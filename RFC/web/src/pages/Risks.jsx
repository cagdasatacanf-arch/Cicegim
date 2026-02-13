import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import './Risks.css';

const RISK_ICONS = {
    warning: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
            <line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" />
        </svg>
    ),
    bank: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="10" width="18" height="11" rx="1" /><path d="M12 2l9 8H3z" />
        </svg>
    ),
    alert: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
    ),
    chain: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71" />
            <path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71" />
        </svg>
    ),
};

const MATRIX_COLORS = {
    'H-L': '#3B6B2D', 'H-M': '#8B5A00', 'H-H': '#8B1A1A',
    'M-L': '#2D4F3B', 'M-M': '#6B5B00', 'M-H': '#8B5A00',
    'L-L': '#1A2F3B', 'L-M': '#2D4F3B', 'L-H': '#3B6B2D',
};

export default function Risks() {
    const { ticker } = useParams();
    const navigate = useNavigate();
    const [data, setData] = useState(null);

    useEffect(() => {
        fetch(`http://localhost:8000/api/risks/${ticker}`)
            .then((r) => r.json())
            .then(setData)
            .catch(() => {
                setData({
                    section_number: 10, section_title: 'Risks & Impact', ticker: ticker.toUpperCase(),
                    risk_matrix: {
                        rows: ['H', 'M', 'L'], cols: ['L', 'M', 'H'],
                        cells: [
                            { row: 'H', col: 'L', icon: 'warning', color: '#F59E0B', risk: 'Regulatory' },
                            { row: 'H', col: 'M', icon: 'bank', color: '#F97316', risk: 'Macro' },
                            { row: 'H', col: 'H', icon: 'alert', color: '#EF4444', risk: 'Geopolitical' },
                            { row: 'M', col: 'M', icon: 'chain', color: '#F59E0B', risk: 'Supply Chain' },
                        ],
                        auto_updating: true,
                    },
                    identified_risks: [
                        {
                            id: 'risk-1', title: 'Supply Chain Disruption', category: 'Operational Risk', color: '#EF4444', impact: 'H', probability: 'H',
                            mitigation: 'Diversification of foundry partners and multi-regional component sourcing to reduce geographic concentration.'
                        },
                        {
                            id: 'risk-2', title: 'Regulatory Scrutiny', category: 'Compliance Risk', color: '#F59E0B', impact: 'M', probability: 'M',
                            mitigation: 'Engagement with legal counsel and proactive adherence to antitrust frameworks in key jurisdictions.'
                        },
                    ],
                    word_count: { current: 365, target_min: 300, target_max: 500 },
                    citations: { current: 2, goal: 4 },
                    draft_excerpt: '"While systemic supply chain risks remain elevated, the target\'s transition to a \'fab-lite\' model provides significant flexibility in mitigating..."',
                });
            });
    }, [ticker]);

    if (!data) {
        return <div className="page"><div className="loading-state"><div className="loading-spinner" /><span>Loading...</span></div></div>;
    }

    const wcPct = Math.min(100, (data.word_count.current / data.word_count.target_max) * 100);
    const wcDots = [wcPct >= 25, wcPct >= 50, wcPct >= 75, wcPct >= 100];

    function getCell(row, col) {
        return data.risk_matrix.cells.find((c) => c.row === row && c.col === col);
    }

    return (
        <div className="page rk-page">
            {/* Top bar */}
            <div className="pv-topbar">
                <button className="pv-back" onClick={() => navigate(-1)}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <polyline points="15,18 9,12 15,6" />
                    </svg>
                    Back
                </button>
                <div className="pv-top-center">
                    <span className="pv-section-num">Section {data.section_number}</span>
                    <h2 className="pv-title">{data.section_title}</h2>
                </div>
                <button className="rk-bookmark">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z" />
                    </svg>
                </button>
            </div>

            {/* Risk Distribution Matrix */}
            <div className="rk-matrix-card card">
                <div className="rk-matrix-header">
                    <span className="rk-matrix-title">Risk Distribution Matrix</span>
                    {data.risk_matrix.auto_updating && (
                        <span className="rk-auto-badge">Auto-updating</span>
                    )}
                </div>

                <div className="rk-matrix-wrap">
                    <div className="rk-matrix-y-label">Probability</div>
                    <div className="rk-matrix-grid">
                        {data.risk_matrix.rows.map((row) => (
                            <div key={row} className="rk-matrix-row">
                                <span className="rk-matrix-row-label">{row}</span>
                                {data.risk_matrix.cols.map((col) => {
                                    const cell = getCell(row, col);
                                    const bgKey = `${row}-${col}`;
                                    return (
                                        <div
                                            key={col}
                                            className="rk-matrix-cell"
                                            style={{ background: MATRIX_COLORS[bgKey] || '#1a2235' }}
                                        >
                                            {cell && (
                                                <div className="rk-matrix-icon" style={{ color: cell.color }}>
                                                    {RISK_ICONS[cell.icon]}
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        ))}
                        <div className="rk-matrix-x-labels">
                            <span />
                            {data.risk_matrix.cols.map((col) => (
                                <span key={col} className="rk-matrix-col-label">{col}</span>
                            ))}
                        </div>
                    </div>
                    <div className="rk-matrix-x-title">Impact</div>
                </div>
            </div>

            {/* Identified Risks */}
            <div className="rk-section-header">
                <span className="rk-section-title">Identified Risks</span>
                <button className="rk-add-risk">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--accent-blue)" strokeWidth="2.5">
                        <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="16" /><line x1="8" y1="12" x2="16" y2="12" />
                    </svg>
                    Add Risk
                </button>
            </div>

            {data.identified_risks.map((risk) => (
                <div key={risk.id} className="rk-risk-card card">
                    <div className="rk-risk-header">
                        <div className="rk-risk-icon" style={{ background: `${risk.color}22`, color: risk.color }}>
                            {RISK_ICONS[risk.id === 'risk-1' ? 'alert' : risk.id === 'risk-2' ? 'warning' : 'chain']}
                        </div>
                        <div className="rk-risk-info">
                            <span className="rk-risk-title">{risk.title}</span>
                            <span className="rk-risk-category">{risk.category.toUpperCase()}</span>
                        </div>
                        <button className="rk-risk-more">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                                <circle cx="12" cy="5" r="1.5" /><circle cx="12" cy="12" r="1.5" /><circle cx="12" cy="19" r="1.5" />
                            </svg>
                        </button>
                    </div>

                    {/* Impact & Probability selectors */}
                    <div className="rk-selectors">
                        <div className="rk-selector-group">
                            <span className="rk-selector-label">Impact</span>
                            <span className="rk-selector-label" style={{ marginLeft: 'auto' }}>Probability</span>
                        </div>
                        <div className="rk-selector-row">
                            <div className="rk-selector-btns">
                                {['L', 'M', 'H'].map((lvl) => (
                                    <button key={lvl} className={`rk-sel-btn ${risk.impact === lvl ? 'rk-sel-active' : ''}`}
                                        style={risk.impact === lvl ? { background: risk.color } : {}}>
                                        {lvl}
                                    </button>
                                ))}
                            </div>
                            <div className="rk-selector-btns">
                                {['L', 'M', 'H'].map((lvl) => (
                                    <button key={lvl} className={`rk-sel-btn ${risk.probability === lvl ? 'rk-sel-active' : ''}`}
                                        style={risk.probability === lvl ? { background: risk.color } : {}}>
                                        {lvl}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Mitigation */}
                    <div className="rk-mitigation">
                        <span className="rk-mit-label">Mitigation Strategy</span>
                        <div className="rk-mit-text">{risk.mitigation}</div>
                    </div>
                </div>
            ))}

            {/* Word count + Citations bar */}
            <div className="pv-footer-bar">
                <div className="pv-footer-block">
                    <div className="pv-footer-block-header">
                        <span className="pv-footer-label">Word<br />Count</span>
                        <span className="pv-footer-target">
                            Target: <span className="pv-target-range">{data.word_count.target_min}–{data.word_count.target_max}</span>
                        </span>
                    </div>
                    <div className="pv-wc-dots">
                        {wcDots.map((on, i) => (
                            <span key={i} className={`pv-wc-dot ${on ? 'pv-wc-dot-on' : ''}`} />
                        ))}
                    </div>
                    <span className="pv-wc-count">{data.word_count.current} words</span>
                </div>
                <div className="pv-footer-divider" />
                <div className="pv-footer-block">
                    <div className="pv-footer-block-header">
                        <span className="pv-footer-label">Citations</span>
                        <span className="pv-footer-target">
                            Goal: <span className="pv-target-range">{data.citations.goal}+</span>
                        </span>
                    </div>
                    <div className="pv-wc-dots">
                        {Array.from({ length: data.citations.goal }, (_, i) => (
                            <span key={i} className={`pv-wc-dot ${i < data.citations.current ? 'pv-wc-dot-on' : ''}`} />
                        ))}
                    </div>
                    <span className="pv-wc-count">{data.citations.current} of {data.citations.goal}</span>
                </div>
            </div>

            {/* Draft excerpt */}
            <div className="pv-draft card">
                <p className="pv-draft-text">{data.draft_excerpt}</p>
                <span className="pv-draft-label">❝ Draft Excerpt</span>
            </div>

            {/* Section sub-nav */}
            <div className="pv-subnav">
                <button className="pv-subnav-item">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2" /><path d="M7 17l4-8 4 4 4-8" /></svg>
                    <span>Metrics</span>
                </button>
                <button className="pv-subnav-item">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4-4v2" /><circle cx="9" cy="7" r="4" /></svg>
                    <span>Peers</span>
                </button>
                <button className="pv-subnav-center rk-subnav-alert">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
                        <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
                        <line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" />
                    </svg>
                </button>
                <button className="pv-subnav-item">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" /><polyline points="14 2 14 8 20 8" /></svg>
                    <span>Draft</span>
                </button>
                <button className="pv-subnav-item">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33" /></svg>
                    <span>Config</span>
                </button>
            </div>
        </div>
    );
}
