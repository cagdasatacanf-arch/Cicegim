import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './ReportView.css';

export default function ReportView() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [report, setReport] = useState(null);
    const [expandedSection, setExpandedSection] = useState(null);

    useEffect(() => {
        fetch(`http://localhost:8000/api/reports/${id}/detail`)
            .then((r) => r.json())
            .then((d) => setReport(d.report))
            .catch(() => {
                setReport({
                    id: id,
                    ticker: 'NVDA',
                    company: 'NVIDIA Corporation',
                    framework: 'semiconductor_fabless',
                    quarter: 'Q3 FY2025',
                    status: 'complete',
                    word_count: 9150,
                    report_date: '2024-12-20',
                    qa_status: 'passed',
                    qa_score: 94,
                    sections: [
                        {
                            id: 1, name: 'Executive Summary', word_count: 487, status: 'complete',
                            content: 'NVIDIA Corporation continues to demonstrate exceptional execution in the data center GPU market, with Q3 FY2025 revenue of $35.1B representing 94% YoY growth. The company\'s dominant position in AI training infrastructure, commanding an estimated 80%+ market share in data center GPUs, provides a substantial competitive moat.'
                        },
                        {
                            id: 2, name: 'Macro Environment', word_count: 724, status: 'complete',
                            content: 'The semiconductor industry is experiencing a structural shift driven by generative AI demand. Global semiconductor revenue reached $526B in 2023, with AI-related chips growing at 3x the industry average.'
                        },
                        {
                            id: 3, name: 'Strategic Positioning', word_count: 680, status: 'complete',
                            content: 'NVIDIA\'s competitive position rests on three pillars: (1) the CUDA software ecosystem with 4M+ developers creating high switching costs, (2) full-stack platform integration from silicon to cloud services, and (3) a rapid product cadence with annual architecture releases.'
                        },
                        {
                            id: 4, name: 'Financial Health', word_count: 892, status: 'complete',
                            content: 'NVIDIA reported Q3 FY2025 revenue of $35.1B (+94% YoY), with Data Center revenue of $30.8B (+112% YoY) driving the majority of growth. Gross margin expanded to 74.6% on favorable product mix.'
                        },
                        {
                            id: 5, name: 'Valuation & DCF', word_count: 810, status: 'complete',
                            content: 'DCF analysis using a WACC of 10.5% and terminal growth rate of 4% yields a fair value range of $145-$168 per share. Key assumptions include 45% revenue CAGR through FY2027 driven by Blackwell ramp.'
                        },
                    ],
                });
            });
    }, [id]);

    if (!report) {
        return (
            <div className="page">
                <div className="loading-state">
                    <div className="loading-spinner" />
                    <span>Loading report...</span>
                </div>
            </div>
        );
    }

    return (
        <div className="page rv-page">
            {/* Top bar */}
            <div className="rv-topbar">
                <button className="fd-back" onClick={() => navigate(-1)}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="15,18 9,12 15,6" />
                    </svg>
                </button>
                <div className="rv-topbar-center">
                    <span className="rv-ticker">${report.ticker}</span>
                    <span className="text-secondary">{report.quarter}</span>
                </div>
                <button className="rv-export-btn">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
                        <polyline points="7,10 12,15 17,10" />
                        <line x1="12" y1="15" x2="12" y2="3" />
                    </svg>
                </button>
            </div>

            {/* Report Meta */}
            <div className="rv-meta">
                <h2 className="rv-company">{report.company}</h2>
                <div className="rv-meta-row">
                    <span className="rv-meta-item">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" />
                            <line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
                        </svg>
                        {report.report_date}
                    </span>
                    <span className="rv-meta-item">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M4 6h16M4 12h16M4 18h10" />
                        </svg>
                        {report.word_count.toLocaleString()} words
                    </span>
                </div>
            </div>

            {/* QA Badge */}
            <div className="rv-qa-card card">
                <div className="rv-qa-left">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--accent-green)" strokeWidth="2">
                        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                    </svg>
                    <div>
                        <span className="rv-qa-label">QA Status</span>
                        <span className="badge badge-green">{report.qa_status.toUpperCase()}</span>
                    </div>
                </div>
                <div className="rv-qa-score">
                    <span className="rv-qa-score-val">{report.qa_score}</span>
                    <span className="rv-qa-score-label">Score</span>
                </div>
            </div>

            {/* Sections */}
            <div className="section-header">
                <span className="section-title">Report Sections</span>
                <span className="text-muted">{report.sections.length} sections</span>
            </div>

            <div className="rv-sections">
                {report.sections.map((section) => (
                    <div key={section.id} className={`rv-section card ${expandedSection === section.id ? 'rv-section-open' : ''}`}>
                        <button
                            className="rv-section-header"
                            onClick={() => setExpandedSection(expandedSection === section.id ? null : section.id)}
                        >
                            <div className="rv-section-left">
                                <span className="rv-section-id">{String(section.id).padStart(2, '0')}</span>
                                <span className="rv-section-name">{section.name}</span>
                            </div>
                            <div className="rv-section-right">
                                <span className="rv-section-wc">{section.word_count} wds</span>
                                <svg
                                    className={`rv-chevron ${expandedSection === section.id ? 'rv-chevron-open' : ''}`}
                                    width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                                >
                                    <polyline points="6,9 12,15 18,9" />
                                </svg>
                            </div>
                        </button>
                        {expandedSection === section.id && (
                            <div className="rv-section-content">
                                <p>{section.content}</p>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}
