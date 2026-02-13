import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './PortfolioCoverage.css';

const STATUS_COLORS = {
    draft: '#3B82F6',
    published: '#10B981',
    reviewing: '#F97316',
};

export default function PortfolioCoverage() {
    const navigate = useNavigate();
    const [data, setData] = useState(null);
    const [activeFilter, setActiveFilter] = useState('All Status');
    const [search, setSearch] = useState('');

    useEffect(() => {
        fetch('http://localhost:8000/api/portfolio-coverage')
            .then((r) => r.json())
            .then(setData)
            .catch(() => {
                setData({
                    stats: { tickers: { value: 42, sub: '+2 this month' }, avg_qa: { value: 84, sub: 'Target: 90%' }, due_soon: { value: 5, sub: 'Before Friday' } },
                    filters: ['All Status', 'Published', 'Drafts', 'Reviewing'],
                    sectors: [
                        {
                            name: 'SEMICONDUCTORS', ticker_count: 8, tickers: [
                                { symbol: 'NVDA', name: 'NVIDIA Corp.', status: 'draft', status_label: 'V1.1 DRAFT', sections_done: 7, sections_total: 11, updated: 'Updated 2h ago', analyst: 'J. Miller', color: '#3B82F6' },
                                { symbol: 'AMD', name: 'Adv. Micro Devices', status: 'published', status_label: 'PUBLISHED', change: '+1.24%', sections_done: 11, sections_total: 11, qa_score: 92, analyst: 'J. Miller', color: '#10B981' },
                            ]
                        },
                    ],
                });
            });
    }, []);

    if (!data) {
        return <div className="page"><div className="loading-state"><div className="loading-spinner" /><span>Loading...</span></div></div>;
    }

    const filterStatus = activeFilter === 'All Status' ? null
        : activeFilter === 'Published' ? 'published'
            : activeFilter === 'Drafts' ? 'draft'
                : 'reviewing';

    return (
        <div className="page pc-page">
            {/* Header */}
            <div className="pc-header">
                <h1 className="pc-title">Portfolio Coverage</h1>
                <button className="ct-profile-btn">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" /><circle cx="12" cy="7" r="4" />
                    </svg>
                </button>
            </div>

            {/* Stats */}
            <div className="pc-stats">
                <div className="pc-stat-card">
                    <span className="pc-stat-label">TICKERS</span>
                    <span className="pc-stat-value">{data.stats.tickers.value}</span>
                    <span className="pc-stat-sub pc-stat-blue">{data.stats.tickers.sub}</span>
                </div>
                <div className="pc-stat-card">
                    <span className="pc-stat-label">AVG QA</span>
                    <span className="pc-stat-value">{data.stats.avg_qa.value}<span className="pc-stat-unit">%</span></span>
                    <span className="pc-stat-sub">{data.stats.avg_qa.sub}</span>
                </div>
                <div className="pc-stat-card">
                    <span className="pc-stat-label">DUE SOON</span>
                    <span className="pc-stat-value pc-stat-orange">{String(data.stats.due_soon.value).padStart(2, '0')}</span>
                    <span className="pc-stat-sub">{data.stats.due_soon.sub}</span>
                </div>
            </div>

            {/* Search */}
            <div className="ct-search">
                <svg className="ct-search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
                <input
                    type="text"
                    className="ct-search-input"
                    placeholder="Search ticker or analyst..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
            </div>

            {/* Filters */}
            <div className="ct-filters">
                {data.filters.map((f) => (
                    <button
                        key={f}
                        className={`if-source-btn ${activeFilter === f ? 'if-source-active' : ''}`}
                        onClick={() => setActiveFilter(f)}
                    >
                        {f}
                    </button>
                ))}
            </div>

            {/* Sectors */}
            {data.sectors.map((sector) => {
                const tickers = sector.tickers.filter((t) => {
                    const matchFilter = !filterStatus || t.status === filterStatus;
                    const matchSearch = !search || t.symbol.toLowerCase().includes(search.toLowerCase()) || t.name.toLowerCase().includes(search.toLowerCase()) || t.analyst?.toLowerCase().includes(search.toLowerCase());
                    return matchFilter && matchSearch;
                });
                if (tickers.length === 0) return null;

                return (
                    <div key={sector.name} className="pc-sector">
                        <div className="pc-sector-header">
                            <span className="pc-sector-name">{sector.name}</span>
                            <span className="pc-sector-count">{sector.ticker_count} Tickers</span>
                        </div>

                        {tickers.map((ticker) => (
                            <div
                                key={ticker.symbol}
                                className="pc-ticker-card card"
                                onClick={() => navigate(`/pipeline/${ticker.symbol.toLowerCase()}`)}
                            >
                                <div className="pc-ticker-header">
                                    <div className="pc-ticker-avatar" style={{ background: `${ticker.color}22`, borderColor: ticker.color }}>
                                        <span style={{ color: ticker.color, fontWeight: 800, fontSize: '12px' }}>{ticker.symbol[0]}</span>
                                    </div>
                                    <div className="pc-ticker-info">
                                        <span className="pc-ticker-symbol">{ticker.symbol}</span>
                                        <span className="pc-ticker-name">{ticker.name}</span>
                                    </div>
                                    <div className="pc-ticker-right">
                                        <span className={`pc-status-badge pc-status-${ticker.status}`}>
                                            {ticker.status_label}
                                        </span>
                                        {ticker.change && <span className="pc-ticker-change">{ticker.change}</span>}
                                    </div>
                                </div>

                                {/* Progress bar */}
                                <div className="pc-progress-section">
                                    <div className="pc-progress-header">
                                        <span className="pc-progress-label">FRAMEWORK COMPLETION</span>
                                        <span className="pc-progress-value" style={{ color: ticker.color }}>
                                            {ticker.sections_done === ticker.sections_total
                                                ? `${ticker.sections_done} / ${ticker.sections_total} Complete`
                                                : `${ticker.sections_done} / ${ticker.sections_total} Sections`
                                            }
                                        </span>
                                    </div>
                                    <div className="pc-progress-bar">
                                        {Array.from({ length: ticker.sections_total }, (_, i) => (
                                            <div
                                                key={i}
                                                className="pc-progress-segment"
                                                style={{ background: i < ticker.sections_done ? ticker.color : 'var(--border-subtle)' }}
                                            />
                                        ))}
                                    </div>
                                </div>

                                {/* Footer */}
                                <div className="pc-ticker-footer">
                                    {ticker.updated && (
                                        <span className="pc-ticker-meta">
                                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
                                            </svg>
                                            {ticker.updated}
                                        </span>
                                    )}
                                    {ticker.qa_score != null && (
                                        <span className="pc-ticker-meta">
                                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                <path d="M22 11.08V12a10 10 0 11-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" />
                                            </svg>
                                            QA Score: {ticker.qa_score}%
                                        </span>
                                    )}
                                    {ticker.due && (
                                        <span className="pc-ticker-meta pc-ticker-due">
                                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
                                            </svg>
                                            {ticker.due}
                                        </span>
                                    )}
                                    <span className="pc-ticker-analyst">Analyst: {ticker.analyst}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                );
            })}

            {/* FAB */}
            <button className="pc-fab">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
                    <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
                </svg>
            </button>

            {/* Bottom Nav */}
            <div className="pc-bottom-nav">
                {[
                    { icon: 'portfolio', label: 'Portfolio', active: true },
                    { icon: 'framework', label: 'Framework', active: false },
                    { icon: 'alerts', label: 'Alerts', active: false },
                    { icon: 'settings', label: 'Settings', active: false },
                ].map((item) => (
                    <button key={item.label} className={`if-nav-item ${item.active ? 'if-nav-active' : ''}`}>
                        {item.icon === 'portfolio' && <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="14" y="14" width="7" height="7" /><rect x="3" y="14" width="7" height="7" /></svg>}
                        {item.icon === 'framework' && <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="7" width="20" height="14" rx="2" ry="2" /><path d="M16 21V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v16" /></svg>}
                        {item.icon === 'alerts' && <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 01-3.46 0" /></svg>}
                        {item.icon === 'settings' && <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33" /></svg>}
                        <span>{item.label}</span>
                    </button>
                ))}
            </div>
        </div>
    );
}
