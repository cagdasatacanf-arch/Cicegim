import { useState, useEffect } from 'react';
import './Citations.css';

const ICON_MAP = {
    doc: (color) => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" /><polyline points="14 2 14 8 20 8" /></svg>,
    news: (color) => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2"><rect x="2" y="3" width="20" height="14" rx="2" /><line x1="8" y1="21" x2="16" y2="21" /><line x1="12" y1="17" x2="12" y2="21" /></svg>,
    lock: (color) => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0110 0v4" /></svg>,
    academic: (color) => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2"><path d="M2 3h6a4 4 0 014 4v14a3 3 0 00-3-3H2z" /><path d="M22 3h-6a4 4 0 00-4 4v14a3 3 0 013-3h7z" /></svg>,
};

export default function Citations() {
    const [data, setData] = useState(null);
    const [activeFilter, setActiveFilter] = useState('All');
    const [search, setSearch] = useState('');

    useEffect(() => {
        fetch('http://localhost:8000/api/citations')
            .then((r) => r.json())
            .then(setData)
            .catch(() => {
                setData({
                    filters: ['All', 'SEC Filings', 'News', 'Internal', 'Academic'],
                    citations: [
                        {
                            id: 'cit-1', icon: 'doc', icon_color: '#3B82F6', title: 'Apple Inc. 2023 Form 10-K',
                            quote: '"The Company\'s future performance depends on its ability to continue to innovate and introduce new products and services to the...',
                            used_in: 'Section 4: Operational Analysis', updated: 'Updated 2h ago', type: 'SEC Filings'
                        },
                        {
                            id: 'cit-2', icon: 'news', icon_color: '#F59E0B', title: 'Bloomberg: Semi-conductor...',
                            quote: '"Market analysts predict a 15% contraction in automotive chip supply chains over the next fiscal quarter, citing logistical bottlenecks."',
                            used_in: 'Section 2: Market Dynamics', updated: 'Updated Oct 24', type: 'News'
                        },
                    ],
                });
            });
    }, []);

    if (!data) {
        return <div className="page"><div className="loading-state"><div className="loading-spinner" /><span>Loading...</span></div></div>;
    }

    const filtered = data.citations.filter((c) => {
        const matchFilter = activeFilter === 'All' || c.type === activeFilter;
        const matchSearch = !search || c.title.toLowerCase().includes(search.toLowerCase());
        return matchFilter && matchSearch;
    });

    return (
        <div className="page ct-page">
            {/* Header */}
            <div className="ct-header">
                <h1 className="ct-title">Citations</h1>
                <button className="ct-profile-btn">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" /><circle cx="12" cy="7" r="4" />
                    </svg>
                </button>
            </div>

            {/* Search */}
            <div className="ct-search">
                <svg className="ct-search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
                <input
                    type="text"
                    className="ct-search-input"
                    placeholder="Search citations or sources..."
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

            {/* Citation Cards */}
            <div className="ct-cards">
                {filtered.map((cit) => (
                    <div key={cit.id} className="ct-card card">
                        <div className="ct-card-header">
                            <div className="ct-card-icon" style={{ color: cit.icon_color }}>
                                {ICON_MAP[cit.icon]?.(cit.icon_color)}
                            </div>
                            <span className="ct-card-title">{cit.title}</span>
                            <div className="ct-card-actions">
                                <button className="ct-action-btn">
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71" />
                                        <path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71" />
                                    </svg>
                                </button>
                                <button className="ct-action-btn">
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                                        <circle cx="12" cy="5" r="1.5" /><circle cx="12" cy="12" r="1.5" /><circle cx="12" cy="19" r="1.5" />
                                    </svg>
                                </button>
                            </div>
                        </div>
                        <p className="ct-card-quote">{cit.quote}</p>
                        <div className="ct-card-footer">
                            <span className="ct-card-used">USED IN: <span className="ct-card-section">{cit.used_in}</span></span>
                            <span className="ct-card-time">{cit.updated}</span>
                        </div>
                    </div>
                ))}
            </div>

            {/* Bottom Nav */}
            <div className="ct-bottom-nav">
                {[
                    { icon: 'reports', label: 'Reports', active: false },
                    { icon: 'library', label: 'Library', active: true },
                    { icon: 'analysis', label: 'Analysis', active: false },
                    { icon: 'settings', label: 'Settings', active: false },
                ].map((item) => (
                    <button key={item.label} className={`if-nav-item ${item.active ? 'if-nav-active' : ''}`}>
                        {item.icon === 'reports' && <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="3" width="20" height="14" rx="2" /><line x1="8" y1="21" x2="16" y2="21" /><line x1="12" y1="17" x2="12" y2="21" /></svg>}
                        {item.icon === 'library' && <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 19.5A2.5 2.5 0 016.5 17H20" /><path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z" /></svg>}
                        {item.icon === 'analysis' && <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2" /><path d="M7 17l4-8 4 4 4-8" /></svg>}
                        {item.icon === 'settings' && <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33" /></svg>}
                        <span>{item.label}</span>
                    </button>
                ))}
                <button className="ct-fab">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
                        <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
                    </svg>
                </button>
            </div>
        </div>
    );
}
