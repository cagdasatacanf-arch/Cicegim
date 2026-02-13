import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../api';
import './FrameworkDetail.css';

export default function FrameworkDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [fw, setFw] = useState(null);
    const [tab, setTab] = useState('structure');
    const [overridesOn, setOverridesOn] = useState(true);
    const [showAllSections, setShowAllSections] = useState(false);

    useEffect(() => {
        fetch(`http://localhost:8000/api/frameworks/${id}/detail`)
            .then((r) => r.json())
            .then((d) => {
                setFw(d.framework);
                setOverridesOn(d.framework.has_overrides);
            })
            .catch(() => {
                // Fallback
                setFw({
                    id: id,
                    name: id.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
                    section_count: 11,
                    target_words: '4.2k',
                    target_citations: '45+',
                    custom_kpis: ['Gross Margin %', 'R&D Intensity', 'Inventory Turns', 'Design Win Rate', 'Wafer Cost Trends'],
                    peer_group: ['NVIDIA', 'AMD', 'BROADCOM', 'MARVELL', 'QUALCOMM'],
                    has_overrides: true,
                    sections: [
                        { id: 1, name: 'Executive Summary', word_count_min: 400, word_count_max: 500, citation_min: 3, citation_max: 5, has_override: false },
                        { id: 2, name: 'Macro Environment', word_count_min: 600, word_count_max: 800, citation_min: 8, citation_max: 10, has_override: false },
                        { id: 3, name: 'Strategic Positioning', word_count_min: 500, word_count_max: 700, citation_min: 4, citation_max: 6, has_override: true },
                        { id: 4, name: 'Product Roadmap', word_count_min: 400, word_count_max: 600, citation_min: 5, citation_max: 5, has_override: false },
                        { id: 5, name: 'Financial Health', word_count_min: 800, word_count_max: 1000, citation_min: 12, citation_max: 15, has_override: false },
                        { id: 6, name: 'Valuation & DCF', word_count_min: 600, word_count_max: 800, citation_min: 6, citation_max: 8, has_override: false },
                        { id: 7, name: 'Risk Assessment', word_count_min: 400, word_count_max: 600, citation_min: 4, citation_max: 6, has_override: false },
                        { id: 8, name: 'Competitive Landscape', word_count_min: 500, word_count_max: 700, citation_min: 5, citation_max: 8, has_override: true },
                        { id: 9, name: 'Management & Governance', word_count_min: 300, word_count_max: 500, citation_min: 3, citation_max: 5, has_override: false },
                        { id: 10, name: 'ESG Considerations', word_count_min: 300, word_count_max: 400, citation_min: 4, citation_max: 6, has_override: false },
                        { id: 11, name: 'Investment Conclusion', word_count_min: 400, word_count_max: 500, citation_min: 3, citation_max: 5, has_override: false },
                    ],
                });
            });
    }, [id]);

    if (!fw) {
        return (
            <div className="page">
                <div className="loading-state">
                    <div className="loading-spinner" />
                    <span>Loading framework...</span>
                </div>
            </div>
        );
    }

    const visibleSections = showAllSections ? fw.sections : fw.sections.slice(0, 5);
    const hiddenCount = fw.sections.length - 5;

    return (
        <div className="page fd-page">
            {/* Top bar */}
            <div className="fd-topbar">
                <button className="fd-back" onClick={() => navigate(-1)}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="15,18 9,12 15,6" />
                    </svg>
                </button>
                <h2 className="fd-title">{fw.name}</h2>
                <button className="btn btn-primary fd-save-btn">Save</button>
            </div>

            {/* Summary stats */}
            <div className="fd-stats">
                <div className="fd-stat">
                    <span className="fd-stat-label">Sections</span>
                    <span className="fd-stat-value text-accent">{fw.section_count}</span>
                </div>
                <div className="fd-stat">
                    <span className="fd-stat-label">Target Words</span>
                    <span className="fd-stat-value text-accent">{fw.target_words}</span>
                </div>
                <div className="fd-stat">
                    <span className="fd-stat-label">Citations</span>
                    <span className="fd-stat-value text-accent">{fw.target_citations}</span>
                </div>
            </div>

            {/* Framework Assets */}
            <div className="section-header">
                <span className="section-title">Framework Assets</span>
                <button className="section-action">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
                        <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
                    </svg>
                    Edit
                </button>
            </div>

            {/* Custom KPIs */}
            <div className="fd-asset-card card">
                <div className="fd-asset-header">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--accent-blue)" strokeWidth="2">
                        <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
                    </svg>
                    <span className="fd-asset-title">Custom KPIs</span>
                </div>
                <div className="fd-tags">
                    {fw.custom_kpis.slice(0, 3).map((kpi) => (
                        <span key={kpi} className="fd-tag">{kpi}</span>
                    ))}
                    {fw.custom_kpis.length > 3 && (
                        <span className="fd-tag fd-tag-more">+{fw.custom_kpis.length - 3} More</span>
                    )}
                </div>
            </div>

            {/* Peer Universe */}
            <div className="fd-asset-card card">
                <div className="fd-asset-header">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--accent-blue)" strokeWidth="2">
                        <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
                        <circle cx="9" cy="7" r="4" />
                        <path d="M23 21v-2a4 4 0 00-3-3.87" />
                        <path d="M16 3.13a4 4 0 010 7.75" />
                    </svg>
                    <span className="fd-asset-title">Peer Universe</span>
                </div>
                <div className="fd-tags">
                    {fw.peer_group.map((peer) => (
                        <span key={peer} className="fd-tag fd-tag-dark">{peer}</span>
                    ))}
                </div>
            </div>

            {/* Sector Overrides */}
            <div className="fd-override-card card">
                <div>
                    <span className="fd-override-title">Sector-Specific Overrides</span>
                    <span className="fd-override-sub">Enable specialized fabless logic</span>
                </div>
                <button
                    className={`fd-toggle ${overridesOn ? 'fd-toggle-on' : ''}`}
                    onClick={() => setOverridesOn(!overridesOn)}
                >
                    <span className="fd-toggle-knob" />
                </button>
            </div>

            {/* Base Structure */}
            <div className="section-header">
                <span className="section-title">Base Structure ({fw.sections.length})</span>
                <button className="fd-filter-btn">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <line x1="4" y1="21" x2="4" y2="14" /><line x1="4" y1="10" x2="4" y2="3" />
                        <line x1="12" y1="21" x2="12" y2="12" /><line x1="12" y1="8" x2="12" y2="3" />
                        <line x1="20" y1="21" x2="20" y2="16" /><line x1="20" y1="12" x2="20" y2="3" />
                        <line x1="1" y1="14" x2="7" y2="14" /><line x1="9" y1="8" x2="15" y2="8" />
                        <line x1="17" y1="16" x2="23" y2="16" />
                    </svg>
                </button>
            </div>

            <div className="fd-sections">
                {visibleSections.map((section) => (
                    <div key={section.id} className={`fd-section card ${section.has_override ? 'fd-section-override' : ''}`}>
                        <div className="fd-section-top">
                            <div className="fd-section-id">{String(section.id).padStart(2, '0')}</div>
                            <h3 className="fd-section-name">{section.name}</h3>
                            <button className="fd-section-menu">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                                    <circle cx="12" cy="5" r="2" /><circle cx="12" cy="12" r="2" /><circle cx="12" cy="19" r="2" />
                                </svg>
                            </button>
                        </div>
                        <div className="fd-section-meta">
                            <span>
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M4 6h16M4 12h16M4 18h10" />
                                </svg>
                                {section.word_count_min} - {section.word_count_max} words
                            </span>
                            <span>
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71" />
                                    <path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71" />
                                </svg>
                                {section.citation_min} - {section.citation_max} citations
                            </span>
                        </div>
                        {section.has_override && (
                            <div className="fd-section-override-tag">
                                <span className="fd-override-dot" />
                                Sector Override Active: Foundry Relations
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {!showAllSections && hiddenCount > 0 && (
                <button className="fd-show-more" onClick={() => setShowAllSections(true)}>
                    Show {hiddenCount} More Sections
                </button>
            )}

            {/* Add section button */}
            <button className="fd-add-btn">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
                    <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
                </svg>
            </button>

            {/* Sub-nav */}
            <div className="fd-subnav">
                {['Structure', 'Data', 'History', 'Config'].map((t) => (
                    <button
                        key={t}
                        className={`fd-subnav-item ${tab === t.toLowerCase() ? 'fd-subnav-active' : ''}`}
                        onClick={() => setTab(t.toLowerCase())}
                    >
                        {t === 'Structure' && (
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
                                <polyline points="14,2 14,8 20,8" />
                            </svg>
                        )}
                        {t === 'Data' && (
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <ellipse cx="12" cy="5" rx="9" ry="3" /><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3" />
                                <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5" />
                            </svg>
                        )}
                        {t === 'History' && (
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <circle cx="12" cy="12" r="10" /><polyline points="12,6 12,12 16,14" />
                            </svg>
                        )}
                        {t === 'Config' && (
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <circle cx="12" cy="12" r="3" />
                                <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z" />
                            </svg>
                        )}
                        <span>{t}</span>
                    </button>
                ))}
            </div>
        </div>
    );
}
