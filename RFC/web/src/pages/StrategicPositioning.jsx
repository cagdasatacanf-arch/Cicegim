import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import './StrategicPositioning.css';

export default function StrategicPositioning() {
    const { ticker } = useParams();
    const navigate = useNavigate();
    const [data, setData] = useState(null);

    useEffect(() => {
        fetch(`http://localhost:8000/api/strategic-positioning/${ticker}`)
            .then((r) => r.json())
            .then(setData)
            .catch(() => {
                setData({
                    section_number: 3, section_title: 'Strategic Positioning', prev_section: 'Section 2',
                    landscape: {
                        x_label: ['LOW TECH EDGE', 'HIGH TECH EDGE'], y_label: ['LOW MARKET SHARE', 'HIGH MARKET SHARE'],
                        entities: [
                            { id: 'target', label: 'Target Corp', x: 65, y: 60, type: 'target' },
                            { id: 'peer-a', label: 'Peer A', x: 25, y: 75, type: 'peer' },
                            { id: 'peer-b', label: 'Peer B', x: 72, y: 30, type: 'peer' },
                            { id: 'peer-c', label: 'Peer C', x: 18, y: 52, type: 'peer' },
                        ],
                        note: 'Drag and drop entities to adjust perceived market positioning',
                    },
                    companies: [
                        { id: 'target', name: 'TARGET COMPANY', tags: ['High Switching Costs', 'Brand Equity'], market_share: 68, tech_edge: 8.5, is_target: true },
                        { id: 'peer-a', name: 'PEER A', tags: ['Cost Leadership'], market_share: 22, tech_edge: 4.2, is_target: false },
                    ],
                    analysis: { status: 'DRAFT', content: 'The target\'s competitive positioning is anchored in high switching costs...' },
                    word_count: { current: 256, target_min: 400, target_display: 600 },
                    citations: { current: 3, goal: 6 },
                });
            });
    }, [ticker]);

    if (!data) {
        return <div className="page"><div className="loading-state"><div className="loading-spinner" /><span>Loading...</span></div></div>;
    }

    const wordPct = Math.min(100, (data.word_count.current / data.word_count.target_display) * 100);

    return (
        <div className="page sp-page">
            {/* Top bar */}
            <div className="sp-topbar">
                <button className="sp-back" onClick={() => navigate(-1)}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <polyline points="15,18 9,12 15,6" />
                    </svg>
                    <span>{data.prev_section}</span>
                </button>
                <div className="sp-top-center">
                    <span className="sp-section-num">SECTION {data.section_number}</span>
                    <span className="sp-section-title">{data.section_title}</span>
                </div>
                <button className="rp-icon-btn">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <line x1="4" y1="21" x2="4" y2="14" /><line x1="4" y1="10" x2="4" y2="3" /><line x1="12" y1="21" x2="12" y2="12" /><line x1="12" y1="8" x2="12" y2="3" /><line x1="20" y1="21" x2="20" y2="16" /><line x1="20" y1="12" x2="20" y2="3" />
                    </svg>
                </button>
            </div>

            {/* Competitive Landscape */}
            <div className="sp-landscape card">
                <div className="sp-landscape-header">
                    <span className="sp-landscape-title">COMPETITIVE LANDSCAPE</span>
                    <div className="sp-legend">
                        <span className="sp-legend-item"><span className="sp-legend-dot sp-dot-target" /> Target</span>
                        <span className="sp-legend-item"><span className="sp-legend-dot sp-dot-peer" /> Peers</span>
                    </div>
                </div>

                <div className="sp-chart-area">
                    {/* Y axis labels */}
                    <span className="sp-y-label sp-y-top">{data.landscape.y_label[1].split(' ').map((w, i) => <span key={i}>{w}<br /></span>)}</span>
                    <span className="sp-y-label sp-y-bottom">{data.landscape.y_label[0].split(' ').map((w, i) => <span key={i}>{w}<br /></span>)}</span>

                    {/* Chart grid */}
                    <div className="sp-chart-grid">
                        {/* X axis labels */}
                        <span className="sp-x-label sp-x-top">{data.landscape.x_label[1]}</span>
                        <span className="sp-x-label sp-x-bottom">{data.landscape.x_label[0]}</span>

                        {/* Quadrants */}
                        <div className="sp-quadrant sp-q-tl" />
                        <div className="sp-quadrant sp-q-tr" />
                        <div className="sp-quadrant sp-q-bl" />
                        <div className="sp-quadrant sp-q-br" />

                        {/* Entities */}
                        {data.landscape.entities.map((e) => (
                            <div
                                key={e.id}
                                className={`sp-entity ${e.type === 'target' ? 'sp-entity-target' : 'sp-entity-peer'}`}
                                style={{ left: `${e.x}%`, bottom: `${e.y}%` }}
                            >
                                <div className="sp-entity-dot" />
                                <span className="sp-entity-label">{e.label}</span>
                            </div>
                        ))}
                    </div>
                </div>
                <p className="sp-chart-note">{data.landscape.note}</p>
            </div>

            {/* Company Metrics */}
            <div className="sp-metrics-section">
                <div className="sp-metrics-header">
                    <span className="sp-metrics-title">COMPANY METRICS</span>
                    <button className="sp-add-peer">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="16" /><line x1="8" y1="12" x2="16" y2="12" />
                        </svg>
                        Add Peer
                    </button>
                </div>

                {data.companies.map((co) => (
                    <div key={co.id} className="sp-company-card card">
                        <div className="sp-company-top">
                            <div className={`sp-company-avatar ${co.is_target ? 'sp-avatar-target' : ''}`}>
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" /><circle cx="12" cy="7" r="4" />
                                </svg>
                            </div>
                            <div className="sp-company-info">
                                <span className="sp-company-name">{co.name}</span>
                                <div className="sp-company-tags">
                                    {co.tags.map((tag) => (
                                        <span key={tag} className="sp-company-tag">{tag}</span>
                                    ))}
                                </div>
                            </div>
                            <button className="rp-icon-btn">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="18" x2="21" y2="18" />
                                </svg>
                            </button>
                        </div>
                        <div className="sp-company-metrics">
                            <div className="sp-metric-col">
                                <span className="sp-metric-label">MARKET SHARE(%)</span>
                                <span className="sp-metric-value">{co.market_share}</span>
                            </div>
                            <div className="sp-metric-col">
                                <span className="sp-metric-label">TECH EDGE(1-10)</span>
                                <span className="sp-metric-value">{co.tech_edge}</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Competitive Advantage Analysis */}
            <div className="sp-analysis-section">
                <div className="sp-analysis-header">
                    <span className="sp-analysis-title">COMPETITIVE ADVANTAGE ANALYSIS</span>
                    <span className="sp-analysis-badge">{data.analysis.status}</span>
                </div>
                <div className="sp-analysis-content card">
                    {data.analysis.content}
                </div>
            </div>

            {/* Bottom stats */}
            <div className="sp-bottom-stats">
                <div className="sp-stat-box">
                    <div className="sp-stat-header-row">
                        <span className="sp-stat-key">WORD<br />COUNT</span>
                        <span className="sp-stat-target">Target: {data.word_count.target_min}+<br />{data.word_count.target_display}</span>
                    </div>
                    <div className="sp-stat-bar-track">
                        <div className="sp-stat-bar-fill" style={{ width: `${wordPct}%` }} />
                    </div>
                    <span className="sp-stat-sub">{data.word_count.current} words</span>
                </div>
                <div className="sp-stat-box">
                    <div className="sp-stat-header-row">
                        <span className="sp-stat-key">CITATIONS</span>
                        <span className="sp-stat-target">Goal: {data.citations.goal}+</span>
                    </div>
                    <div className="sp-citation-dots">
                        {Array.from({ length: data.citations.goal }, (_, i) => (
                            <div
                                key={i}
                                className={`sp-cite-dot ${i < data.citations.current ? 'sp-cite-filled' : ''}`}
                            />
                        ))}
                    </div>
                    <span className="sp-stat-sub">{data.citations.current} of {data.citations.goal}</span>
                </div>
            </div>

            {/* Bottom Nav */}
            <div className="pc-bottom-nav">
                {[
                    { icon: 'metrics', label: 'Metrics' },
                    { icon: 'strategy', label: 'Strategy', active: true },
                    { icon: 'risks', label: 'Risks' },
                    { icon: 'config', label: 'Config' },
                ].map((item) => (
                    <button key={item.label} className={`if-nav-item ${item.active ? 'if-nav-active' : ''}`}>
                        {item.icon === 'metrics' && <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" /><line x1="6" y1="20" x2="6" y2="14" /></svg>}
                        {item.icon === 'strategy' && <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" /></svg>}
                        {item.icon === 'risks' && <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" /><line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" /></svg>}
                        {item.icon === 'config' && <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33" /></svg>}
                        <span>{item.label}</span>
                    </button>
                ))}
            </div>
        </div>
    );
}
