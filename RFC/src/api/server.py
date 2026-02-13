"""FastAPI REST server for the IRF web UI."""

from __future__ import annotations

import json
from datetime import datetime
from pathlib import Path

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel

from src.config import load_config, set_config_value, DB_PATH
from src.db import (
    init_db,
    get_company_by_ticker,
    get_reports_for_company,
    list_frameworks,
    get_framework,
)
from src.frameworks.manager import FrameworkManager
from src.frameworks.base import build_effective_framework
from src.generator.qa import run_qa_checks, format_qa_report
from src.research.financial import fetch_company_info

# ── App Setup ──

app = FastAPI(title="IRF Analyst", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

fm = FrameworkManager()


# ── Startup ──

@app.on_event("startup")
def startup():
    """Ensure DB is initialized on startup."""
    DB_PATH.parent.mkdir(parents=True, exist_ok=True)
    init_db()
    fm.load_builtin_frameworks()


# ── Models ──

class ReportCreateRequest(BaseModel):
    ticker: str
    framework_id: str
    quarter: str


class ConfigUpdateRequest(BaseModel):
    key: str
    value: str


# ── Dashboard / Stats ──

@app.get("/api/stats")
def get_stats():
    """Dashboard statistics."""
    frameworks = fm.list()

    # Gather sample data for dashboard
    return {
        "greeting": _get_greeting(),
        "pending_qa": 3,
        "total_frameworks": len(frameworks),
        "active_research": [
            {
                "id": "nvda-q3-2024",
                "title": "NVIDIA Q3 Deep Dive",
                "status": "qa_review",
                "progress": 85,
                "citations_verified": 112,
                "word_count": 2482,
                "word_count_vs_avg": "+12%",
                "last_updated": "14m ago",
                "updated_by": "System AI",
            },
            {
                "id": "global-saas-val",
                "title": "Global SaaS Valuation",
                "status": "in_progress",
                "progress": 32,
                "sources_scanned": 42,
                "draft_sections": "4 / 12",
                "last_updated": "2h ago",
                "updated_by": "Analyst",
            },
        ],
        "generation_log": [
            {
                "id": "log-1",
                "type": "citation",
                "message": "Citations verified for NVIDIA Report",
                "timestamp": "Today at 10:45 AM",
                "detail": "120 sources checked",
                "color": "blue",
            },
            {
                "id": "log-2",
                "type": "generation",
                "message": "Generation Complete: Energy Outlook 2024",
                "timestamp": "Yesterday at 6:20 PM",
                "detail": "Completed by Analyst AI",
                "color": "green",
            },
            {
                "id": "log-3",
                "type": "qa",
                "message": "QA Passed: AMD Semiconductor Analysis",
                "timestamp": "2 days ago",
                "detail": "All 11 sections verified",
                "color": "green",
            },
        ],
    }


def _get_greeting() -> str:
    hour = datetime.now().hour
    if hour < 12:
        return "Good morning"
    elif hour < 17:
        return "Good afternoon"
    return "Good evening"


# ── Frameworks ──

@app.get("/api/frameworks")
def api_list_frameworks():
    """List all available frameworks."""
    raw = fm.list()
    results = []
    for row in raw:
        config = row.get("config", {})
        results.append({
            "id": config.get("sector_id") or config.get("id", row.get("id", "")),
            "name": config.get("display_name", config.get("name", "Unknown")),
            "description": config.get("description", ""),
            "version": config.get("base_version", "1.0"),
            "status": "Updated" if config.get("base_version", "1.0") != "1.0" else "Standard",
        })
    return {"frameworks": results}


@app.get("/api/frameworks/{framework_id}")
def api_get_framework(framework_id: str):
    """Get a specific framework with full details."""
    config = fm.get(framework_id)
    if config is None:
        raise HTTPException(status_code=404, detail=f"Framework not found: {framework_id}")
    effective = build_effective_framework(config)
    return {"framework": effective}


# ── Reports ──

@app.get("/api/reports")
def api_list_reports():
    """List all reports (sample data for now)."""
    return {
        "reports": [
            {
                "id": "rpt-nvda-001",
                "ticker": "NVDA",
                "company": "NVIDIA Corporation",
                "framework": "semiconductor_fabless",
                "quarter": "Q3 FY2025",
                "status": "qa_review",
                "progress": 85,
                "word_count": 8420,
                "sections_complete": 11,
                "sections_total": 11,
                "created_at": "2024-12-15",
                "updated_at": "2024-12-20",
            },
            {
                "id": "rpt-saab-001",
                "ticker": "SAAB",
                "company": "Saab AB",
                "framework": "defense_aerospace",
                "quarter": "Q4 FY2024",
                "status": "in_progress",
                "progress": 32,
                "word_count": 3200,
                "sections_complete": 4,
                "sections_total": 11,
                "created_at": "2024-12-18",
                "updated_at": "2024-12-20",
            },
            {
                "id": "rpt-amd-001",
                "ticker": "AMD",
                "company": "Advanced Micro Devices",
                "framework": "semiconductor_fabless",
                "quarter": "Q3 FY2025",
                "status": "complete",
                "progress": 100,
                "word_count": 9150,
                "sections_complete": 11,
                "sections_total": 11,
                "created_at": "2024-12-10",
                "updated_at": "2024-12-14",
            },
        ]
    }


@app.get("/api/reports/{ticker}")
def api_get_report(ticker: str):
    """Get reports for a specific ticker."""
    reports = get_reports_for_company(ticker.upper())
    return {"reports": reports}


@app.post("/api/reports/new")
def api_create_report(req: ReportCreateRequest):
    """Create a new report."""
    config = fm.get(req.framework_id)
    if config is None:
        raise HTTPException(status_code=404, detail=f"Framework not found: {req.framework_id}")
    return {
        "status": "created",
        "ticker": req.ticker.upper(),
        "framework": req.framework_id,
        "quarter": req.quarter,
        "message": f"Report for {req.ticker.upper()} created. Use generate endpoint to start.",
    }


# ── Research ──

@app.get("/api/research/financials/{ticker}")
def api_research_financials(ticker: str):
    """Fetch financial data for a company."""
    data = fetch_company_info(ticker.upper())
    if "error" in data:
        raise HTTPException(status_code=400, detail=data["error"])
    return data


# ── Config ──

@app.get("/api/config")
def api_get_config():
    """Get current configuration."""
    config = load_config()
    # Mask API key
    if config.get("api_key"):
        key = config["api_key"]
        config["api_key"] = key[:8] + "..." + key[-4:] if len(key) > 12 else "***"
    return {"config": config}


@app.post("/api/config")
def api_update_config(req: ConfigUpdateRequest):
    """Update a configuration value."""
    set_config_value(req.key, req.value)
    return {"status": "updated", "key": req.key}


# ── Framework Detail ──

@app.get("/api/frameworks/{framework_id}/detail")
def api_get_framework_detail(framework_id: str):
    """Full framework detail with effective sections, KPIs, peers."""
    config = fm.get(framework_id)
    if config is None:
        raise HTTPException(status_code=404, detail=f"Framework not found: {framework_id}")
    effective = build_effective_framework(config)

    # Extract custom KPIs and peer universe from sector overrides
    custom_kpis = config.get("key_drivers", [])
    operational_kpis = config.get("operational_kpis", [])
    peer_group = config.get("peer_group", [])
    data_requirements = config.get("data_requirements", {})

    # Compute summary stats
    sections = effective.get("sections", [])
    total_words_min = sum(s.get("word_count", {}).get("min", 0) for s in sections)
    total_words_max = sum(s.get("word_count", {}).get("max", 0) for s in sections)
    total_citations = sum(s.get("citation_target", {}).get("min", 0) for s in sections)

    return {
        "framework": {
            "id": framework_id,
            "name": effective.get("display_name", framework_id),
            "description": effective.get("description", ""),
            "version": config.get("base_version", "1.0"),
            "section_count": len(sections),
            "target_words": f"{total_words_min / 1000:.1f}k",
            "target_citations": f"{total_citations}+",
            "custom_kpis": custom_kpis[:5] if custom_kpis else operational_kpis[:5],
            "peer_group": peer_group,
            "has_overrides": bool(config.get("section_overrides")),
            "sections": [
                {
                    "id": s["id"],
                    "name": s["name"],
                    "word_count_min": s.get("word_count", {}).get("min", 0),
                    "word_count_max": s.get("word_count", {}).get("max", 0),
                    "citation_min": s.get("citation_target", {}).get("min", 0),
                    "citation_max": s.get("citation_target", {}).get("max", 0),
                    "required_elements": s.get("required_elements", []),
                    "subsections": s.get("subsections", []),
                    "has_override": s["id"] in [
                        o.get("section_id", 0)
                        for o in config.get("section_overrides", [])
                    ],
                }
                for s in sections
            ],
            "data_requirements": data_requirements,
        }
    }


# ── Pipeline ──

@app.get("/api/pipeline/{ticker}")
def api_get_pipeline(ticker: str):
    """Get generation pipeline status for a ticker."""
    # Simulated pipeline state
    return {
        "pipeline": {
            "ticker": ticker.upper(),
            "company": "NVIDIA Corporation" if ticker.upper() == "NVDA" else f"{ticker.upper()} Corp",
            "engine_version": "v2.4.0",
            "status": "active",
            "est_completion": "0:45",
            "stages": [
                {"id": "profiling", "name": "Profiling", "status": "complete",
                 "detail": "Historical context and data mapping complete."},
                {"id": "financials", "name": "Fetching Financials", "status": "complete",
                 "detail": "10-K, 10-Q, and alternative data ingested."},
                {"id": "generation", "name": "AI Generation", "status": "active",
                 "detail": "Synthesizing insights and drafting sections..."},
                {"id": "qa", "name": "QA Checks", "status": "pending",
                 "detail": "Pending generation completion."},
            ],
            "sections_complete": 4,
            "sections_total": 11,
            "live_word_count": 1242,
            "sections": [
                {"id": 1, "name": "Executive Summary", "status": "complete"},
                {"id": 2, "name": "Macro Environment", "status": "complete"},
                {"id": 3, "name": "Market Positioning", "status": "complete"},
                {"id": 4, "name": "Operational Analysis", "status": "active",
                 "progress": 65, "detail": "Drafting manufacturing efficiency sub-section..."},
                {"id": 5, "name": "Valuation & DCF", "status": "queued"},
                {"id": 6, "name": "Risk Assessment", "status": "queued"},
                {"id": 7, "name": "Financial Health", "status": "queued"},
                {"id": 8, "name": "Competitive Landscape", "status": "queued"},
                {"id": 9, "name": "Management & Governance", "status": "queued"},
                {"id": 10, "name": "ESG Considerations", "status": "queued"},
                {"id": 11, "name": "Investment Conclusion", "status": "queued"},
            ],
            "ai_note": "AI is currently analyzing the last 3 earnings transcripts to finalize the Operational Analysis.",
        }
    }


# ── Report Detail ──

@app.get("/api/reports/{report_id}/detail")
def api_get_report_detail(report_id: str):
    """Detailed report view with section content."""
    return {
        "report": {
            "id": report_id,
            "ticker": "NVDA",
            "company": "NVIDIA Corporation",
            "framework": "semiconductor_fabless",
            "quarter": "Q3 FY2025",
            "status": "complete",
            "word_count": 9150,
            "report_date": "2024-12-20",
            "qa_status": "passed",
            "qa_score": 94,
            "sections": [
                {"id": 1, "name": "Executive Summary", "word_count": 487, "status": "complete",
                 "content": "NVIDIA Corporation continues to demonstrate exceptional execution in the data center GPU market, with Q3 FY2025 revenue of $35.1B representing 94% YoY growth. The company's dominant position in AI training infrastructure, commanding an estimated 80%+ market share in data center GPUs, provides a substantial competitive moat. Key catalysts include the Blackwell architecture ramp, expanding hyperscaler capex budgets, and growing enterprise AI adoption. Trading at 35x forward P/E, the stock reflects premium expectations but remains supported by the company's unmatched execution trajectory and TAM expansion."},
                {"id": 2, "name": "Macro Environment", "word_count": 724, "status": "complete",
                 "content": "The semiconductor industry is experiencing a structural shift driven by generative AI demand. Global semiconductor revenue reached $526B in 2023, with AI-related chips growing at 3x the industry average. U.S. CHIPS Act funding of $52.7B and increased data center capex from major cloud providers (AWS +28% YoY, Azure +33% YoY, GCP +41% YoY) create a favorable backdrop. Interest rate normalization may ease capital allocation pressures for enterprise buyers, while geopolitical tensions around Taiwan supply chains continue to benefit diversified suppliers like NVIDIA."},
                {"id": 3, "name": "Strategic Positioning", "word_count": 680, "status": "complete",
                 "content": "NVIDIA's competitive position rests on three pillars: (1) the CUDA software ecosystem with 4M+ developers creating high switching costs, (2) full-stack platform integration from silicon to cloud services, and (3) a rapid product cadence with annual architecture releases. The Blackwell platform represents a generational leap with 4x training performance per watt versus Hopper. Key threats include AMD MI300X gaining traction at Microsoft and Meta, custom ASICs from Google (TPU v5p) and Amazon (Trainium2), and potential demand normalization post-initial AI buildout."},
                {"id": 4, "name": "Financial Health", "word_count": 892, "status": "complete",
                 "content": "NVIDIA reported Q3 FY2025 revenue of $35.1B (+94% YoY), with Data Center revenue of $30.8B (+112% YoY) driving the majority of growth. Gross margin expanded to 74.6% on favorable product mix. Operating income reached $21.9B with 62.3% operating margin. Free cash flow of $16.8B (+138% YoY) supports aggressive buyback and R&D investment. Balance sheet remains fortress-quality with $18.3B cash and $8.5B long-term debt, resulting in a net cash position of $9.8B."},
                {"id": 5, "name": "Valuation & DCF", "word_count": 810, "status": "complete",
                 "content": "DCF analysis using a WACC of 10.5% and terminal growth rate of 4% yields a fair value range of $145–$168 per share. Key assumptions include 45% revenue CAGR through FY2027 driven by Blackwell ramp, gradual margin normalization to 70% gross margin, and sustained R&D investment at 12–14% of revenue. Relative valuation at 35x forward P/E compares to AMD at 28x and Broadcom at 32x, premium justified by superior growth profile. Sum-of-parts analysis values Data Center at $3.2T, Gaming at $180B, and Auto/Robotics at $120B."},
            ],
        }
    }


# ── AI & Compliance ──

class ComplianceUpdateRequest(BaseModel):
    institutional_tone: bool | None = None
    banned_words: list[str] | None = None
    style_guideline: str | None = None
    qa_sensitivity: str | None = None


@app.get("/api/compliance")
def api_get_compliance():
    """Get compliance / style settings."""
    return {
        "compliance": {
            "institutional_tone": True,
            "banned_words": ["disruptive", "game-changing", "revolutionary", "unicorn",
                             "paradigm shift", "synergy", "best-in-class", "world-class",
                             "cutting-edge", "moonshot", "hockey stick", "bleeding edge"],
            "style_guideline": "analytical",
            "style_options": [
                {"id": "analytical", "name": "Analytical",
                 "description": "Data-driven, objective, neutral tone.", "icon": "chart"},
                {"id": "conservative", "name": "Conservative",
                 "description": "Risk-averse, highly formal language.", "icon": "shield"},
                {"id": "academic", "name": "Academic",
                 "description": "Deep investigative, scholarly depth.", "icon": "book"},
            ],
            "qa_sensitivity": "medium",
            "qa_levels": [
                {"id": "low", "label": "Low"},
                {"id": "medium", "label": "Medium"},
                {"id": "high", "label": "High"},
            ],
            "qa_hint": '"Medium" sensitivity balances speed with essential cross-referencing of financial data points.',
        }
    }


@app.post("/api/compliance")
def api_update_compliance(req: ComplianceUpdateRequest):
    """Update compliance settings."""
    return {"status": "updated", "message": "Compliance engine updated."}


# ── Intelligence Feed ──

@app.get("/api/intelligence-feed")
def api_intelligence_feed():
    """Real-time intelligence feed with news and filings."""
    return {
        "tickers": [
            {"symbol": "NVDA", "price": 824.32, "change": -2.4},
            {"symbol": "AMD", "price": 178.29, "change": -0.8},
            {"symbol": "AVGO", "price": 1285.40, "change": 1.2},
            {"symbol": "TSM", "price": 142.65, "change": 0.5},
        ],
        "sources": ["All Sources", "Reuters", "Bloomberg", "SEC RSS", "Analyst Notes"],
        "articles": [
            {
                "id": "art-1",
                "source": "Bloomberg",
                "source_color": "#F06292",
                "ticker": "NVDA",
                "time": "12m ago",
                "title": "NVDA expands Blackwell production capacity amid record enterprise demand",
                "summary": "Nvidia is reportedly securing additional packaging capacity from TSMC to accelerate the delivery of its Blackwell-seri...",
                "sentiment": "bullish",
                "impact": 9.2,
            },
            {
                "id": "art-2",
                "source": "SEC RSS",
                "source_color": "#78909C",
                "ticker": "AVGO",
                "time": "45m ago",
                "title": "Form 4 Filing: AVGO Insider Selling by Executive VP",
                "summary": "A new Form 4 filing reveals that Broadcom's Executive VP sold 4,500 shares as part of a pre-planned 10b5-1 trading...",
                "sentiment": "neutral",
                "impact": 4.5,
            },
            {
                "id": "art-3",
                "source": "Reuters",
                "source_color": "#FF8A65",
                "ticker": "AMD",
                "time": "2h ago",
                "title": "AMD supply chain constraints in Southeast Asia may impact Q3 outlook",
                "summary": "Logistical hurdles in Vietnam and Malaysia are causing minor delays in the assembly and testing phase for AMD's...",
                "sentiment": "bearish",
                "impact": 7.8,
            },
            {
                "id": "art-4",
                "source": "Reuters",
                "source_color": "#FF8A65",
                "ticker": "TSM",
                "time": "3h ago",
                "title": "TSMC reports higher than expected yields on 3nm process node",
                "summary": "Manufacturing data suggests that Taiwan Semiconductor Manufacturing Co. has surpassed internal yield targets fo...",
                "sentiment": "bullish",
                "impact": 8.5,
            },
        ],
    }


# ── Peer Valuation ──

@app.get("/api/peer-valuation/{ticker}")
def api_peer_valuation(ticker: str):
    """Peer valuation comparables for a ticker."""
    return {
        "section_number": 9,
        "section_title": "Peer Valuation",
        "ticker": ticker.upper(),
        "current_multiples": [
            {"ticker": ticker.upper(), "is_target": True,
             "pe_fwd": 42.4, "ev_rev": 22.1, "ev_ebitda": 35.8, "ps": 20.5},
            {"ticker": "AMD", "is_target": False,
             "pe_fwd": 28.2, "ev_rev": 8.4, "ev_ebitda": 21.0, "ps": 7.9},
            {"ticker": "AVGO", "is_target": False,
             "pe_fwd": 31.5, "ev_rev": 14.2, "ev_ebitda": 24.5, "ps": 12.1},
            {"ticker": "MRVL", "is_target": False,
             "pe_fwd": 35.1, "ev_rev": 9.8, "ev_ebitda": 28.3, "ps": 9.2},
        ],
        "peer_average": {"pe_fwd": 31.6, "ev_rev": 10.8, "ev_ebitda": 24.6, "ps": 9.7},
        "valuation_summary": {
            "implied_price": 148.20,
            "upside": 15.2,
            "peer_premium": 34.1,
            "selected_peers": "AMD, AVGO, MRVL",
            "weighting_method": "Equal Weighted",
        },
        "word_count": {"current": 425, "target_min": 500, "target_max": 700},
        "citations": {"current": 3, "goal": 5},
        "draft_excerpt": '"NVIDIA\'s forward P/E expansion relative to peers is fundamentally supported by its 70%+ gross margin profile compared to the peer average of 54.2%..."',
    }


# ── Risks & Impact ──

@app.get("/api/risks/{ticker}")
def api_risks(ticker: str):
    """Risk assessment data for a ticker."""
    return {
        "section_number": 10,
        "section_title": "Risks & Impact",
        "ticker": ticker.upper(),
        "risk_matrix": {
            "rows": ["H", "M", "L"],
            "cols": ["L", "M", "H"],
            "cells": [
                {"row": "H", "col": "L", "icon": "warning", "color": "#F59E0B", "risk": "Regulatory"},
                {"row": "H", "col": "M", "icon": "bank", "color": "#F97316", "risk": "Macro"},
                {"row": "H", "col": "H", "icon": "alert", "color": "#EF4444", "risk": "Geopolitical"},
                {"row": "M", "col": "M", "icon": "chain", "color": "#F59E0B", "risk": "Supply Chain"},
            ],
            "auto_updating": True,
        },
        "identified_risks": [
            {
                "id": "risk-1",
                "title": "Supply Chain Disruption",
                "category": "Operational Risk",
                "color": "#EF4444",
                "impact": "H",
                "probability": "H",
                "mitigation": "Diversification of foundry partners and multi-regional component sourcing to reduce geographic concentration.",
            },
            {
                "id": "risk-2",
                "title": "Regulatory Scrutiny",
                "category": "Compliance Risk",
                "color": "#F59E0B",
                "impact": "M",
                "probability": "M",
                "mitigation": "Engagement with legal counsel and proactive adherence to antitrust frameworks in key jurisdictions.",
            },
            {
                "id": "risk-3",
                "title": "AI Demand Normalization",
                "category": "Market Risk",
                "color": "#3B82F6",
                "impact": "H",
                "probability": "L",
                "mitigation": "Diversification into automotive, robotics, and edge AI to reduce data center revenue concentration.",
            },
        ],
        "word_count": {"current": 365, "target_min": 300, "target_max": 500},
        "citations": {"current": 2, "goal": 4},
        "draft_excerpt": '"While systemic supply chain risks remain elevated, the target\'s transition to a \'fab-lite\' model provides significant flexibility in mitigating..."',
    }


# ── Version Comparison ──

@app.get("/api/version-comparison/{report_id}")
def api_version_comparison(report_id: str):
    """Compare two versions of a report."""
    return {
        "report_id": report_id,
        "old_version": "v1.0.2",
        "new_version": "v1.0.3",
        "key_changes": {
            "word_count": {"delta": 342, "direction": "up"},
            "citations": {"delta": 2, "direction": "up"},
            "tone_shift": "Formal",
        },
        "sections": [
            {
                "id": "sec-1", "title": "Executive Summary", "icon": "doc",
                "status": "updated",
                "content": 'The projected Q4 growth for the semiconductor segment has been <del>adjusted downwards</del> <ins>revised to 12.4%</ins> reflecting the recent manufacturing shift in Taiwan.\n\nMoreover, <ins>new regulatory headwinds in the EU suggest a conservative outlook</ins> for the remainder of the fiscal year.',
            },
            {"id": "sec-2", "title": "Market Outlook", "icon": "globe", "status": "no change", "content": None},
            {"id": "sec-3", "title": "Competitive Positioning", "icon": "users", "status": "updated", "content": None},
            {"id": "sec-4", "title": "Financial Analysis", "icon": "chart", "status": "updated", "content": None},
            {"id": "sec-5", "title": "Risk Factors", "icon": "alert", "status": "no change", "content": None},
            {"id": "sec-6", "title": "Valuation & DCF", "icon": "calculator", "status": "updated", "content": None},
            {"id": "sec-7", "title": "Peer Comparison", "icon": "peers", "status": "no change", "content": None},
            {"id": "sec-8", "title": "Regulatory Landscape", "icon": "shield", "status": "updated", "content": None},
            {"id": "sec-9", "title": "Technical Analysis", "icon": "chart-line", "status": "no change", "content": None},
            {"id": "sec-10", "title": "Appendix & Data", "icon": "database", "status": "no change", "content": None},
            {"id": "sec-11", "title": "Investment Thesis", "icon": "flag", "status": "updated", "content": None},
        ],
        "total_sections": 11,
    }


# ── Citations Library ──

@app.get("/api/citations")
def api_citations():
    """Citation library with sources."""
    return {
        "filters": ["All", "SEC Filings", "News", "Internal", "Academic"],
        "citations": [
            {
                "id": "cit-1",
                "icon": "doc",
                "icon_color": "#3B82F6",
                "title": "Apple Inc. 2023 Form 10-K",
                "quote": '"The Company\'s future performance depends on its ability to continue to innovate and introduce new products and services to the...',
                "used_in": "Section 4: Operational Analysis",
                "updated": "Updated 2h ago",
                "type": "SEC Filings",
            },
            {
                "id": "cit-2",
                "icon": "news",
                "icon_color": "#F59E0B",
                "title": "Bloomberg: Semi-conductor...",
                "quote": '"Market analysts predict a 15% contraction in automotive chip supply chains over the next fiscal quarter, citing logistical bottlenecks."',
                "used_in": "Section 2: Market Dynamics",
                "updated": "Updated Oct 24",
                "type": "News",
            },
            {
                "id": "cit-3",
                "icon": "lock",
                "icon_color": "#F97316",
                "title": "Internal Alpha Model Q3 Results",
                "quote": '"Proprietary model indicates a buy rating based on current free cash flow yields exceeding the 5-year historical average by 200bps."',
                "used_in": "Section 6: Valuation",
                "updated": "Updated Oct 22",
                "type": "Internal",
            },
            {
                "id": "cit-4",
                "icon": "academic",
                "icon_color": "#A855F7",
                "title": "Efficient Market Hypothesis in...",
                "quote": '"Longitudinal study of 500 growth-stage tech entities suggests that information asymmetry is highest during product release cycles."',
                "used_in": "Section 1: Risk Factors",
                "updated": "Updated Oct 18",
                "type": "Academic",
            },
        ],
    }


# ── Data Sources ──

@app.get("/api/data-sources")
def api_data_sources():
    """Data source configurations."""
    return {
        "sources": [
            {
                "id": "fred",
                "name": "FRED® Indicators",
                "subtitle": "Federal Reserve Economic Data",
                "icon": "chart-wave",
                "status": "connected",
                "api_key": "••••••••••••••••",
                "auto_fetch": True,
                "auto_fetch_label": "Daily synchronization at 08:00 UTC",
            },
            {
                "id": "equity",
                "name": "Equity Data",
                "subtitle": "Yahoo Finance API",
                "icon": "line-chart",
                "status": "public_access",
                "real_time_quotes": True,
                "real_time_label": "Fetch data on report generation",
                "note": "No API Key required for basic equity data. Advanced fundamental analysis might require a premium key.",
            },
            {
                "id": "news",
                "name": "News & RSS",
                "subtitle": "",
                "icon": "newspaper",
                "status": "attention",
                "last_sync": "Today, 11:24 AM",
                "sentiment_analysis": False,
                "sentiment_label": "AI processing of news headlines",
            },
            {
                "id": "sec-edgar",
                "name": "SEC EDGAR",
                "subtitle": "Corporate Filings & 10-Ks",
                "icon": "building",
                "status": "connected",
                "user_agent": "research@capitaltrust.com",
            },
        ],
    }


@app.post("/api/data-sources/{source_id}/test")
def api_test_data_source(source_id: str):
    """Test connection to a data source."""
    return {"source_id": source_id, "status": "ok", "latency_ms": 142}


# ── Portfolio Coverage ──

@app.get("/api/portfolio-coverage")
def api_portfolio_coverage():
    """Portfolio coverage overview with sector-grouped tickers."""
    return {
        "stats": {
            "tickers": {"value": 42, "sub": "+2 this month"},
            "avg_qa": {"value": 84, "sub": "Target: 90%"},
            "due_soon": {"value": 5, "sub": "Before Friday"},
        },
        "filters": ["All Status", "Published", "Drafts", "Reviewing"],
        "sectors": [
            {
                "name": "SEMICONDUCTORS",
                "ticker_count": 8,
                "tickers": [
                    {
                        "symbol": "NVDA", "name": "NVIDIA Corp.",
                        "status": "draft", "status_label": "V1.1 DRAFT",
                        "sections_done": 7, "sections_total": 11,
                        "updated": "Updated 2h ago", "analyst": "J. Miller",
                        "color": "#3B82F6",
                    },
                    {
                        "symbol": "AMD", "name": "Adv. Micro Devices",
                        "status": "published", "status_label": "PUBLISHED",
                        "change": "+1.24%",
                        "sections_done": 11, "sections_total": 11,
                        "qa_score": 92, "analyst": "J. Miller",
                        "color": "#10B981",
                    },
                    {
                        "symbol": "AVGO", "name": "Broadcom Inc.",
                        "status": "reviewing", "status_label": "REVIEWING",
                        "sections_done": 10, "sections_total": 11,
                        "updated": "Updated 5h ago", "analyst": "S. Chen",
                        "color": "#F59E0B",
                    },
                ],
            },
            {
                "name": "DEFENSE & AEROSPACE",
                "ticker_count": 4,
                "tickers": [
                    {
                        "symbol": "LMT", "name": "Lockheed Martin",
                        "status": "reviewing", "status_label": "UNDER REVIEW",
                        "sections_done": 9, "sections_total": 11,
                        "due": "Due by Thursday", "analyst": "A. Park",
                        "color": "#F97316",
                    },
                    {
                        "symbol": "RTX", "name": "RTX Corporation",
                        "status": "draft", "status_label": "V1.0 DRAFT",
                        "sections_done": 5, "sections_total": 11,
                        "updated": "Updated 1d ago", "analyst": "A. Park",
                        "color": "#3B82F6",
                    },
                ],
            },
            {
                "name": "CLOUD & SAAS",
                "ticker_count": 6,
                "tickers": [
                    {
                        "symbol": "MSFT", "name": "Microsoft Corp.",
                        "status": "published", "status_label": "PUBLISHED",
                        "change": "+0.72%",
                        "sections_done": 11, "sections_total": 11,
                        "qa_score": 95, "analyst": "L. Torres",
                        "color": "#10B981",
                    },
                ],
            },
        ],
    }



# ── Section Editor (Masterclass) ──

@app.get("/api/section-editor/{section_id}")
def api_section_editor(section_id: int):
    """Section editor content for the masterclass editor."""
    return {
        "section_number": section_id,
        "total_sections": 11,
        "subtitle": "MASTERCLASS EDITOR",
        "teaching_topic": "EUV Lithography vs DUV",
        "concept_clarity": True,
        "content_blocks": [
            {
                "type": "text",
                "html": "Extreme Ultraviolet (EUV) lithography represents the most significant leap in semiconductor manufacturing in two decades. Unlike Deep Ultraviolet (DUV) which uses 193nm wavelength light, EUV operates at 13.5nm, allowing for the patterning of features far smaller than previously possible.",
            },
            {
                "type": "diagram",
                "label": "Technical Diagram: Light Source Comparison",
                "icon": "diagram",
            },
            {
                "type": "text",
                "html": "The transition from multi-patterning DUV to single-exposure EUV reduces process complexity, but introduces significant challenges in terms of vacuum requirements, mask infrastructure, and photon shot noise at smaller feature sizes.",
            },
        ],
        "word_count": {"current": 842, "target": 1000},
        "key_terms_count": 4,
        "key_terms": [
            {"id": "kt-1", "term": "Numerical Aperture", "defined": False},
            {"id": "kt-2", "term": "Stochastic Effects", "defined": False},
            {"id": "kt-3", "term": "Pellicles", "defined": False},
        ],
    }


# ── Conclusion & Monitoring ──

@app.get("/api/conclusion/{ticker}")
def api_conclusion(ticker: str):
    """Conclusion & Monitoring section data."""
    return {
        "section_number": 11,
        "section_title": "Conclusion & Monitoring",
        "ticker": ticker.upper(),
        "thesis_recap": {
            "word_count": {"current": 342, "target": 400},
            "content": "Based on the quantitative analysis and market positioning assessment, the investment thesis remains robust. The core value driver—expansion into the APAC region—is tracking ahead of schedule. We anticipate a 15% EBITDA margin expansion over the next 36 months, driven primarily by operational efficiencies in the supply chain and localized manufacturing pivots. Key risks regarding regulatory shifts in the tech sector are mitigated by the current diversification strategy. Final recommendation is a Strong Buy contingent on the continued execution of the growth roadmap.",
        },
        "monitoring_framework": {
            "triggers": [
                {
                    "id": "trg-1",
                    "title": "Revenue Growth KPI",
                    "description": "If quarterly revenue growth dips below 5% for two consecutive periods.",
                    "category": "CRITICAL",
                    "category_color": "#EF4444",
                    "enabled": True,
                },
                {
                    "id": "trg-2",
                    "title": "Price Target Threshold",
                    "description": "Equity price reaching $145.00 trigger re-evaluation of valuation multiples.",
                    "category": "MARKET",
                    "category_color": "#3B82F6",
                    "enabled": False,
                },
                {
                    "id": "trg-3",
                    "title": "Geopolitical Shift",
                    "description": "Any new trade tariffs exceeding 10% on semiconductors from Southeast Asia.",
                    "category": "MACRO",
                    "category_color": "#8B5CF6",
                    "enabled": True,
                },
            ],
        },
        "confidence_rating": {
            "levels": ["Speculative", "Moderate", "High", "Conviction"],
            "selected": "High",
            "description": "Based on data integrity and historical projection accuracy.",
        },
        "final_report_status": {
            "ready": True,
            "label": "Ready for committee review",
        },
        "last_edited": "M. THORNTON",
        "last_edited_time": "14:28 GMT",
        "section_completion": 92,
    }



# ── Report Preview ──

@app.get("/api/report-preview/{ticker}")
def api_report_preview(ticker: str):
    """PDF-style report preview data."""
    return {
        "ticker": ticker.upper(),
        "total_pages": 18,
        "firm": "KONGSBERG RESEARCH",
        "firm_initial": "K",
        "rating": "STRONG BUY",
        "company": "NVIDIA Corp.",
        "exchange": f"{ticker.upper()}:NASDAQ",
        "price": 128.55,
        "date": "OCTOBER 24, 2023",
        "target_price": 165.00,
        "market_cap": "3.12T",
        "risk_level": "Moderate",
        "pages": [
            {
                "page": 1,
                "section_title": "SECTION 1: EXECUTIVE SUMMARY",
                "content_left": "Summary: NVIDIA Corporation continues to demonstrate unparalleled dominance in the accelerated computing sector. Our fundamental analysis suggests that the market significantly underestimates the long-term sustainability of",
                "content_right": "expansion. Current free cash flow projections indicate a 22% CAGR through 2027, bolstered by the company's proprietary software moat via CUDA.\n\nWe reiterate our Strong Buy recommendation based on superior capital allocation strategies.",
                "watermark": "Institutional Series | Confidential Research",
            },
            {
                "page": 2,
                "section_title": "SECTION 2: MARKET DYNAMICS",
                "content_left": "The global AI infrastructure market is projected to reach $420B by 2028, representing a 38% CAGR from 2023 levels. NVIDIA's dominant position in GPU computing, with an estimated 80%+ market share in AI training hardware,",
                "content_right": "positions the company as the primary beneficiary of this secular growth trend. Key demand drivers include enterprise AI adoption, sovereign AI initiatives, and the transition to accelerated computing across all verticals.",
                "watermark": "Institutional Series | Confidential Research",
            },
            {
                "page": 3,
                "section_title": "SECTION 3: FINANCIAL PROJECTIONS",
                "content_left": "Revenue projections for FY2025-FY2027 indicate sustained hypergrowth driven by Data Center segment expansion. We model 85% YoY revenue growth in FY2025, moderating to 35% in FY2026 and 22% in FY2027 as the",
                "content_right": "base effect normalizes. Gross margins are expected to stabilize at 72-75%, reflecting pricing power offset by increased packaging costs for Blackwell architecture. Operating leverage drives EPS to $4.85 by FY2027.",
                "watermark": "Institutional Series | Confidential Research",
            },
        ],
    }



# ── Strategic Positioning ──

@app.get("/api/strategic-positioning/{ticker}")
def api_strategic_positioning(ticker: str):
    """Strategic positioning section data."""
    return {
        "section_number": 3,
        "section_title": "Strategic Positioning",
        "prev_section": "Section 2",
        "landscape": {
            "x_label": ["LOW TECH EDGE", "HIGH TECH EDGE"],
            "y_label": ["LOW MARKET SHARE", "HIGH MARKET SHARE"],
            "entities": [
                {"id": "target", "label": "Target Corp", "x": 65, "y": 60, "type": "target"},
                {"id": "peer-a", "label": "Peer A", "x": 25, "y": 75, "type": "peer"},
                {"id": "peer-b", "label": "Peer B", "x": 72, "y": 30, "type": "peer"},
                {"id": "peer-c", "label": "Peer C", "x": 18, "y": 52, "type": "peer"},
            ],
            "note": "Drag and drop entities to adjust perceived market positioning",
        },
        "companies": [
            {
                "id": "target",
                "name": "TARGET COMPANY",
                "tags": ["High Switching Costs", "Brand Equity"],
                "market_share": 68,
                "tech_edge": 8.5,
                "is_target": True,
            },
            {
                "id": "peer-a",
                "name": "PEER A",
                "tags": ["Cost Leadership"],
                "market_share": 22,
                "tech_edge": 4.2,
                "is_target": False,
            },
        ],
        "analysis": {
            "status": "DRAFT",
            "content": "The target's competitive positioning is anchored in high switching costs derived from deep enterprise software integration. Unlike Peer A, which competes primarily on cost, the target maintains a premium pricing strategy supported by proprietary IP and a 15% R&D-to-revenue lead. The expansion into regional markets is expected to solidify market share in the coming quarters.",
        },
        "word_count": {"current": 256, "target_min": 400, "target_display": 600},
        "citations": {"current": 3, "goal": 6},
    }



# ── AI Report Synthesis ──

@app.get("/api/ai-synthesis/{ticker}")
def api_ai_synthesis(ticker: str):
    """AI Report Synthesis section data."""
    return {
        "section": "SECTION 1: EXECUTIVE SUMMARY",
        "ticker": ticker.upper(),
        "title": "AI Report Synthesis",
        "subtitle": "Synthesize data from Sections 2-10 into a cohesive executive investment narrative.",
        "refinement_focus": ["Standard", "Growth", "Yield", "Defensive"],
        "selected_focus": "Standard",
        "draft_status": "READY",
        "paragraphs": [
            {
                "label": "THESIS",
                "label_color": "#10B981",
                "text": f"Our analysis indicates a compelling opportunity for {ticker.upper()} based on its undisputed dominance in the generative AI semiconductor vertical. The vertical integration of CUDA software with H100/B200 hardware architectures creates a multi-year moat that competitors like AMD and Intel are currently unable to penetrate at scale.",
            },
            {
                "label": None,
                "text": "The data aggregated from the supply chain section suggests a 22% improvement in wafer starts for Q3, which supports our bullish revenue revision. We anticipate significant margin expansion as production yields stabilize at the new 3nm node.",
            },
            {
                "label": "KEY RISKS",
                "label_color": "#F59E0B",
                "text": "Geopolitical tensions regarding export controls to East Asian markets remain the primary headwind. Additionally, any contraction in hyperscaler CapEx could lead to a near-term inventory correction, though current backlogs extend into late 2025.",
            },
            {
                "label": "PRICE TARGET",
                "label_color": "#8B5CF6",
                "text": "We maintain an Outperform rating with a 12-month target of $155.00, representing a 24x forward P/E multiple. This is justified by the projected 45% CAGR in Datacenter revenue over the next three fiscal years.",
            },
        ],
        "generated_ago": "Generated 2m ago",
        "word_count": 482,
        "citation_verification": 92,
        "length": "MEDIUM",
    }



# ── Financial Deep Dive ──

@app.get("/api/financial-deep-dive/{ticker}")
def api_financial_deep_dive(ticker: str):
    """Financial Deep Dive section data."""
    return {
        "section_number": 7,
        "section_title": "Financial Deep Dive",
        "words": {"current": 642, "target": 800},
        "citations": {"current": 7, "target": 10},
        "synced": "SYNCED 14M AGO",
        "metrics": {
            "columns": ["METRIC", "Q1 24", "Q2 24", "Q3 24 (E)"],
            "rows": [
                {"metric": "Revenue ($M)", "values": ["1,420.5", "1,510.2", "1585.0"], "highlight_idx": 2, "highlight_color": None},
                {"metric": "EBITDA ($M)", "values": ["340.8", "355.2", "382.4"], "highlight_idx": 2, "highlight_color": "#10B981"},
                {"metric": "Margin (%)", "values": ["24.0%", "23.5%", "24.1"], "highlight_idx": None, "highlight_color": None},
                {"metric": "FCF ($M)", "values": ["210.4", "198.8", "235.5"], "highlight_idx": None, "highlight_color": None},
                {"metric": "Net Debt/EBITDA", "values": ["2.4x", "2.2x", "2.0"], "highlight_idx": None, "highlight_color": None, "warn_indices": [0, 1]},
            ],
        },
        "insight": {
            "subtitle": "Drafted based on Q3 Estimates & YoY growth trends.",
            "paragraphs": [
                "Revenue for Q3 is projected to grow by 5% QoQ, driven primarily by strong seasonal demand in enterprise licensing. Notably, the EBITDA Margin is expected to stabilize at 24.1%, showing resilience despite rising OpEx pressures.",
                "Free Cash Flow conversion remains healthy, allowing for continued deleveraging. Projections suggest Net Debt/EBITDA will reach a comfortable 2.0x by quarter-end, significantly down from the 2.4x high in Q1.",
            ],
        },
        "quarterly_trends": [
            {"label": "REVENUE", "change": "+11.5%", "change_color": "#10B981", "bars": [55, 65, 80, 90]},
            {"label": "LEVERAGE", "change": "-0.4x", "change_color": "#10B981", "bars": [90, 80, 70, 60]},
        ],
    }


# ── Serve static frontend in production ──

WEB_DIST = Path(__file__).resolve().parent.parent.parent / "web" / "dist"

if WEB_DIST.exists():
    app.mount("/", StaticFiles(directory=str(WEB_DIST), html=True), name="frontend")
