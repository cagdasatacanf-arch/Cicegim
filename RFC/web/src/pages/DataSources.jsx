import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './DataSources.css';

const STATUS_BADGES = {
    connected: { label: '● CONNECTED', cls: 'ds-badge-green' },
    public_access: { label: '● PUBLIC ACCESS', cls: 'ds-badge-green' },
    attention: { label: '● ATTENTION', cls: 'ds-badge-orange' },
};

const SOURCE_ICONS = {
    'chart-wave': <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#3B82F6" strokeWidth="2"><path d="M22 12h-4l-3 9L9 3l-3 9H2" /></svg>,
    'line-chart': <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12" /></svg>,
    newspaper: <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#F59E0B" strokeWidth="2"><rect x="2" y="3" width="20" height="14" rx="2" /><line x1="8" y1="21" x2="16" y2="21" /><line x1="12" y1="17" x2="12" y2="21" /></svg>,
    building: <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#8B5CF6" strokeWidth="2"><rect x="3" y="10" width="18" height="11" rx="1" /><path d="M12 2l9 8H3z" /></svg>,
};

export default function DataSources() {
    const navigate = useNavigate();
    const [data, setData] = useState(null);
    const [testing, setTesting] = useState(null);

    useEffect(() => {
        fetch('http://localhost:8000/api/data-sources')
            .then((r) => r.json())
            .then(setData)
            .catch(() => {
                setData({
                    sources: [
                        { id: 'fred', name: 'FRED® Indicators', subtitle: 'Federal Reserve Economic Data', icon: 'chart-wave', status: 'connected', api_key: '••••••••••••••••', auto_fetch: true, auto_fetch_label: 'Daily synchronization at 08:00 UTC' },
                        { id: 'equity', name: 'Equity Data', subtitle: 'Yahoo Finance API', icon: 'line-chart', status: 'public_access', real_time_quotes: true, real_time_label: 'Fetch data on report generation', note: 'No API Key required for basic equity data.' },
                        { id: 'news', name: 'News & RSS', subtitle: '', icon: 'newspaper', status: 'attention', last_sync: 'Today, 11:24 AM', sentiment_analysis: false, sentiment_label: 'AI processing of news headlines' },
                        { id: 'sec-edgar', name: 'SEC EDGAR', subtitle: 'Corporate Filings & 10-Ks', icon: 'building', status: 'connected', user_agent: 'research@capitaltrust.com' },
                    ],
                });
            });
    }, []);

    const handleTest = async (sourceId) => {
        setTesting(sourceId);
        try {
            await fetch(`http://localhost:8000/api/data-sources/${sourceId}/test`, { method: 'POST' });
        } catch { }
        setTimeout(() => setTesting(null), 1500);
    };

    if (!data) {
        return <div className="page"><div className="loading-state"><div className="loading-spinner" /><span>Loading...</span></div></div>;
    }

    return (
        <div className="page ds-page">
            {/* Top bar */}
            <div className="ds-topbar">
                <button className="pv-back" onClick={() => navigate(-1)}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <polyline points="15,18 9,12 15,6" />
                    </svg>
                </button>
                <h2 className="ds-page-title">Data Sources</h2>
                <button className="ds-help-btn">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="12" cy="12" r="10" /><path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3" /><line x1="12" y1="17" x2="12.01" y2="17" />
                    </svg>
                </button>
            </div>

            {/* Subtitle */}
            <div className="ds-subtitle-section">
                <span className="ds-config-label">CONFIGURATION</span>
                <p className="ds-config-desc">Configure and manage external macroeconomic and market data pipelines for research reports.</p>
            </div>

            {/* Source cards */}
            {data.sources.map((source) => (
                <div key={source.id} className="ds-source-card card">
                    {/* Header */}
                    <div className="ds-source-header">
                        <div className="ds-source-icon">{SOURCE_ICONS[source.icon]}</div>
                        <div className="ds-source-info">
                            <span className="ds-source-name">{source.name}</span>
                            {source.subtitle && <span className="ds-source-subtitle">{source.subtitle}</span>}
                        </div>
                        <span className={`ds-status-badge ${STATUS_BADGES[source.status]?.cls || ''}`}>
                            {STATUS_BADGES[source.status]?.label || source.status}
                        </span>
                    </div>

                    {/* FRED-specific */}
                    {source.id === 'fred' && (
                        <>
                            <div className="ds-field">
                                <span className="ds-field-label">
                                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0110 0v4" /></svg>
                                    API KEY
                                </span>
                                <div className="ds-api-key-row">
                                    <input type="password" className="ds-api-key-input" value={source.api_key} readOnly />
                                    <button className="ds-eye-btn">
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" />
                                        </svg>
                                    </button>
                                </div>
                            </div>
                            <div className="ds-toggle-row">
                                <div>
                                    <span className="ds-toggle-label">Auto-Fetch</span>
                                    <span className="ds-toggle-desc">{source.auto_fetch_label}</span>
                                </div>
                                <div className={`ds-toggle ${source.auto_fetch ? 'ds-toggle-on' : ''}`}>
                                    <div className="ds-toggle-thumb" />
                                </div>
                            </div>
                            <button className={`ds-test-btn ${testing === source.id ? 'ds-testing' : ''}`} onClick={() => handleTest(source.id)}>
                                {testing === source.id ? 'Testing...' : 'TEST CONNECTION'}
                            </button>
                        </>
                    )}

                    {/* Equity-specific */}
                    {source.id === 'equity' && (
                        <>
                            <div className="ds-toggle-row">
                                <div>
                                    <span className="ds-toggle-label">Real-time Quotes</span>
                                    <span className="ds-toggle-desc">{source.real_time_label}</span>
                                </div>
                                <div className={`ds-toggle ${source.real_time_quotes ? 'ds-toggle-on' : ''}`}>
                                    <div className="ds-toggle-thumb" />
                                </div>
                            </div>
                            {source.note && <p className="ds-note">{source.note}</p>}
                        </>
                    )}

                    {/* News-specific */}
                    {source.id === 'news' && (
                        <>
                            {source.last_sync && (
                                <div className="ds-last-sync">
                                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
                                    </svg>
                                    Last full sync: {source.last_sync}
                                </div>
                            )}
                            <button className="btn btn-primary ds-refresh-all-btn">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                    <polyline points="23 4 23 10 17 10" /><path d="M20.49 15a9 9 0 11-2.12-9.36L23 10" />
                                </svg>
                                REFRESH ALL FEEDS
                            </button>
                            <div className="ds-toggle-row">
                                <div>
                                    <span className="ds-toggle-label">Sentiment Analysis</span>
                                    <span className="ds-toggle-desc">{source.sentiment_label}</span>
                                </div>
                                <div className={`ds-toggle ${source.sentiment_analysis ? 'ds-toggle-on' : ''}`}>
                                    <div className="ds-toggle-thumb" />
                                </div>
                            </div>
                            <button className="ds-revalidate-btn">REVALIDATE URL</button>
                        </>
                    )}

                    {/* SEC EDGAR-specific */}
                    {source.id === 'sec-edgar' && (
                        <>
                            <div className="ds-field">
                                <span className="ds-field-label">USER-AGENT HEADER (EMAIL)</span>
                                <input type="text" className="ds-text-input" value={source.user_agent} readOnly />
                            </div>
                            <button className={`ds-test-btn ${testing === source.id ? 'ds-testing' : ''}`} onClick={() => handleTest(source.id)}>
                                {testing === source.id ? 'Testing...' : 'TEST CONNECTION'}
                            </button>
                        </>
                    )}
                </div>
            ))}
        </div>
    );
}
