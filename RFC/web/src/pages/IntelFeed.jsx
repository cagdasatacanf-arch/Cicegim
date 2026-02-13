import { useState, useEffect } from 'react';
import './IntelFeed.css';

const SENTIMENT_BADGES = {
    bullish: { label: '▲ Bullish', cls: 'if-badge-green' },
    bearish: { label: '▼ Bearish', cls: 'if-badge-red' },
    neutral: { label: '— Neutral', cls: 'if-badge-gray' },
};

export default function IntelFeed() {
    const [data, setData] = useState(null);
    const [activeSource, setActiveSource] = useState('All Sources');

    useEffect(() => {
        fetch('http://localhost:8000/api/intelligence-feed')
            .then((r) => r.json())
            .then(setData)
            .catch(() => {
                setData({
                    tickers: [
                        { symbol: 'NVDA', price: 824.32, change: -2.4 },
                        { symbol: 'AMD', price: 178.29, change: -0.8 },
                        { symbol: 'AVGO', price: 1285.40, change: 1.2 },
                    ],
                    sources: ['All Sources', 'Reuters', 'Bloomberg', 'SEC RSS'],
                    articles: [
                        {
                            id: 'art-1', source: 'Bloomberg', source_color: '#F06292', ticker: 'NVDA', time: '12m ago',
                            title: 'NVDA expands Blackwell production capacity amid record enterprise demand',
                            summary: 'Nvidia is reportedly securing additional packaging capacity from TSMC to accelerate delivery...',
                            sentiment: 'bullish', impact: 9.2
                        },
                        {
                            id: 'art-2', source: 'SEC RSS', source_color: '#78909C', ticker: 'AVGO', time: '45m ago',
                            title: 'Form 4 Filing: AVGO Insider Selling by Executive VP',
                            summary: 'A new Form 4 filing reveals that Broadcom\'s Executive VP sold 4,500 shares...',
                            sentiment: 'neutral', impact: 4.5
                        },
                        {
                            id: 'art-3', source: 'Reuters', source_color: '#FF8A65', ticker: 'AMD', time: '2h ago',
                            title: 'AMD supply chain constraints in Southeast Asia may impact Q3 outlook',
                            summary: 'Logistical hurdles in Vietnam and Malaysia are causing minor delays...',
                            sentiment: 'bearish', impact: 7.8
                        },
                    ],
                });
            });
    }, []);

    if (!data) {
        return <div className="page"><div className="loading-state"><div className="loading-spinner" /><span>Loading feed...</span></div></div>;
    }

    const filtered = activeSource === 'All Sources'
        ? data.articles
        : data.articles.filter((a) => a.source === activeSource);

    return (
        <div className="page if-page">
            {/* Header */}
            <div className="if-header">
                <h1 className="if-title">Intelligence Feed</h1>
                <div className="if-header-icons">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
                    </svg>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 01-3.46 0" />
                    </svg>
                </div>
            </div>

            {/* Ticker bar */}
            <div className="if-ticker-bar">
                {data.tickers.map((t) => (
                    <div key={t.symbol} className="if-ticker">
                        <span className="if-ticker-symbol">{t.symbol}</span>
                        <span className="if-ticker-price">{t.price.toFixed(2)}</span>
                        <span className={`if-ticker-change ${t.change >= 0 ? 'if-change-up' : 'if-change-down'}`}>
                            {t.change >= 0 ? '+' : ''}{t.change.toFixed(1)}%
                        </span>
                    </div>
                ))}
            </div>

            {/* Source filters */}
            <div className="if-sources">
                {data.sources.map((source) => (
                    <button
                        key={source}
                        className={`if-source-btn ${activeSource === source ? 'if-source-active' : ''}`}
                        onClick={() => setActiveSource(source)}
                    >
                        {source}
                    </button>
                ))}
            </div>

            {/* Articles */}
            <div className="if-articles">
                {filtered.map((article) => (
                    <div key={article.id} className="if-article card">
                        <div className="if-article-meta">
                            <span className="if-article-source" style={{ color: article.source_color }}>
                                <span className="if-source-dot" style={{ background: article.source_color }} />
                                {article.source}
                            </span>
                            <span className="if-article-time">{article.time}</span>
                            <span className="if-article-ticker">{article.ticker}</span>
                        </div>
                        <h3 className="if-article-title">{article.title}</h3>
                        <p className="if-article-summary">{article.summary}</p>
                        <div className="if-article-footer">
                            <span className={`if-sentiment ${SENTIMENT_BADGES[article.sentiment].cls}`}>
                                {SENTIMENT_BADGES[article.sentiment].label}
                            </span>
                            <span className="if-impact">Impact <strong>{article.impact}</strong></span>
                            <button className="if-pin-btn">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--accent-blue)" strokeWidth="2">
                                    <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
                                    <polyline points="17 8 12 3 7 8" />
                                    <line x1="12" y1="3" x2="12" y2="15" />
                                </svg>
                                Pin to Citation
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {/* Refresh FAB */}
            <button className="if-refresh-btn">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
                    <polyline points="23 4 23 10 17 10" /><path d="M20.49 15a9 9 0 11-2.12-9.36L23 10" />
                </svg>
            </button>

            {/* Bottom Nav */}
            <div className="if-bottom-nav">
                {[
                    { icon: 'feed', label: 'Feed', active: true },
                    { icon: 'portfolio', label: 'Portfolio', active: false },
                    { icon: 'library', label: 'Library', active: false },
                    { icon: 'settings', label: 'Settings', active: false },
                ].map((item) => (
                    <button key={item.label} className={`if-nav-item ${item.active ? 'if-nav-active' : ''}`}>
                        {item.icon === 'feed' && <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="3" width="20" height="14" rx="2" /><line x1="8" y1="21" x2="16" y2="21" /><line x1="12" y1="17" x2="12" y2="21" /></svg>}
                        {item.icon === 'portfolio' && <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="7" width="20" height="14" rx="2" ry="2" /><path d="M16 21V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v16" /></svg>}
                        {item.icon === 'library' && <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 19.5A2.5 2.5 0 016.5 17H20" /><path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z" /></svg>}
                        {item.icon === 'settings' && <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4" /></svg>}
                        <span>{item.label}</span>
                    </button>
                ))}
            </div>
        </div>
    );
}
