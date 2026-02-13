import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import './FinancialDeepDive.css';

export default function FinancialDeepDive() {
    const { ticker } = useParams();
    const navigate = useNavigate();
    const [data, setData] = useState(null);
    const [view, setView] = useState('table');

    useEffect(() => {
        fetch(`http://localhost:8000/api/financial-deep-dive/${ticker}`)
            .then((r) => r.json())
            .then(setData)
            .catch(() => {
                setData({
                    section_number: 7, section_title: 'Financial Deep Dive',
                    words: { current: 642, target: 800 }, citations: { current: 7, target: 10 },
                    synced: 'SYNCED 14M AGO',
                    metrics: {
                        columns: ['METRIC', 'Q1 24', 'Q2 24', 'Q3 24 (E)'],
                        rows: [
                            { metric: 'Revenue ($M)', values: ['1,420.5', '1,510.2', '1585.0'], highlight_idx: 2 },
                            { metric: 'EBITDA ($M)', values: ['340.8', '355.2', '382.4'], highlight_idx: 2, highlight_color: '#10B981' },
                        ],
                    },
                    insight: { subtitle: 'Drafted based on Q3 Estimates & YoY growth trends.', paragraphs: ['Revenue for Q3...'] },
                    quarterly_trends: [
                        { label: 'REVENUE', change: '+11.5%', change_color: '#10B981', bars: [55, 65, 80, 90] },
                        { label: 'LEVERAGE', change: '-0.4x', change_color: '#10B981', bars: [90, 80, 70, 60] },
                    ],
                });
            });
    }, [ticker]);

    if (!data) {
        return <div className="page"><div className="loading-state"><div className="loading-spinner" /><span>Loading...</span></div></div>;
    }

    const wordPct = Math.min(100, (data.words.current / data.words.target) * 100);

    return (
        <div className="page fd-page">
            {/* Section header */}
            <div className="fd-header">
                <div className="fd-header-left">
                    <span className="fd-section-num">SECTION {data.section_number}</span>
                    <h1 className="fd-title">{data.section_title}</h1>
                </div>
                <div className="fd-header-right">
                    <div className="fd-header-stat">
                        <span className="fd-stat-label">WORDS</span>
                        <span className="fd-stat-val">{data.words.current}<span className="fd-stat-dim"> / {data.words.target}</span></span>
                    </div>
                    <div className="fd-header-stat">
                        <span className="fd-stat-label">CITATIONS</span>
                        <span className="fd-stat-val">{data.citations.current}<span className="fd-stat-dim"> / {data.citations.target}</span></span>
                    </div>
                </div>
            </div>

            {/* Progress bar */}
            <div className="fd-progress-track">
                <div className="fd-progress-fill" style={{ width: `${wordPct}%` }} />
            </div>

            {/* View toggle */}
            <div className="fd-toggle-row">
                <div className="fd-toggle">
                    <button className={`fd-toggle-btn ${view === 'table' ? 'fd-toggle-active' : ''}`} onClick={() => setView('table')}>Table</button>
                    <button className={`fd-toggle-btn ${view === 'preview' ? 'fd-toggle-active' : ''}`} onClick={() => setView('preview')}>Preview</button>
                </div>
                <span className="fd-synced">
                    <span className="fd-synced-dot" />
                    {data.synced}
                </span>
            </div>

            {/* Performance Metrics */}
            <div className="fd-metrics-section">
                <div className="fd-metrics-header">
                    <span className="fd-metrics-icon">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <rect x="3" y="3" width="18" height="18" rx="2" ry="2" /><line x1="3" y1="9" x2="21" y2="9" /><line x1="9" y1="21" x2="9" y2="9" />
                        </svg>
                    </span>
                    <span className="fd-metrics-title">Performance Metrics</span>
                    <span className="fd-swipe-hint">Swipe to see more →</span>
                </div>

                <div className="fd-table-wrap">
                    <table className="fd-table">
                        <thead>
                            <tr>
                                {data.metrics.columns.map((col) => (
                                    <th key={col}>{col}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {data.metrics.rows.map((row) => (
                                <tr key={row.metric}>
                                    <td className="fd-metric-name">{row.metric}</td>
                                    {row.values.map((val, i) => {
                                        const isHighlight = row.highlight_idx === i;
                                        const isWarn = row.warn_indices && row.warn_indices.includes(i);
                                        return (
                                            <td
                                                key={i}
                                                className={isHighlight ? 'fd-cell-highlight' : ''}
                                                style={isHighlight && row.highlight_color ? { color: row.highlight_color } : isWarn ? { color: '#EF4444' } : {}}
                                            >
                                                {val}
                                            </td>
                                        );
                                    })}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Metric Insights Assistant */}
            <div className="fd-insight-section">
                <div className="fd-insight-header">
                    <span className="fd-insight-title">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                        </svg>
                        Metric Insights Assistant
                    </span>
                    <button className="fd-regen-btn">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <polyline points="23 4 23 10 17 10" /><path d="M20.49 15a9 9 0 11-2.12-9.36L23 10" />
                        </svg>
                        Regenerate
                    </button>
                </div>

                <div className="fd-insight-card card">
                    <div className="fd-insight-badge-row">
                        <div className="fd-insight-icon">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" /><polyline points="14 2 14 8 20 8" />
                            </svg>
                        </div>
                        <div>
                            <span className="fd-insight-badge-title">Observation Draft</span>
                            <p className="fd-insight-subtitle">{data.insight.subtitle}</p>
                        </div>
                    </div>

                    <div className="fd-insight-body">
                        {data.insight.paragraphs.map((p, i) => (
                            <p key={i}>{p}</p>
                        ))}
                    </div>

                    <div className="fd-insight-actions">
                        <button className="fd-edit-btn">Edit Draft</button>
                        <button className="fd-apply-btn btn btn-primary">Apply to Section</button>
                    </div>
                </div>
            </div>

            {/* Quarterly Trends */}
            <div className="fd-trends-section">
                <h3 className="fd-trends-title">Quarterly Trends</h3>
                <div className="fd-trends-grid">
                    {data.quarterly_trends.map((trend) => (
                        <div key={trend.label} className="fd-trend-card card">
                            <div className="fd-trend-header">
                                <span className="fd-trend-label">{trend.label}</span>
                                <span className="fd-trend-change" style={{ color: trend.change_color }}>{trend.change}</span>
                            </div>
                            <div className="fd-trend-bars">
                                {trend.bars.map((h, i) => (
                                    <div key={i} className="fd-trend-bar" style={{ height: `${h}%` }} />
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Bottom bar */}
            <div className="fd-bottom-bar">
                <button className="fd-fetch-btn">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="16,16 12,12 8,16" /><line x1="12" y1="12" x2="12" y2="21" />
                        <path d="M20.39 18.39A5 5 0 0018 9h-1.26A8 8 0 103 16.3" />
                    </svg>
                    <span>FETCH LATEST</span>
                </button>
                <button className="fd-save-btn btn btn-primary">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z" /><polyline points="17 21 17 13 7 13 7 21" /><polyline points="7 3 7 8 15 8" />
                    </svg>
                    Save Section
                </button>
                <button className="fd-options-btn">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                        <circle cx="12" cy="5" r="1.5" /><circle cx="12" cy="12" r="1.5" /><circle cx="12" cy="19" r="1.5" />
                    </svg>
                </button>
            </div>
        </div>
    );
}
