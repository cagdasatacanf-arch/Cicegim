import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import './PeerValuation.css';

export default function PeerValuation() {
    const { ticker } = useParams();
    const navigate = useNavigate();
    const [data, setData] = useState(null);
    const [tab, setTab] = useState('current');

    useEffect(() => {
        fetch(`http://localhost:8000/api/peer-valuation/${ticker}`)
            .then((r) => r.json())
            .then(setData)
            .catch(() => {
                setData({
                    section_number: 9, section_title: 'Peer Valuation', ticker: ticker.toUpperCase(),
                    current_multiples: [
                        { ticker: ticker.toUpperCase(), is_target: true, pe_fwd: 42.4, ev_rev: 22.1, ev_ebitda: 35.8, ps: 20.5 },
                        { ticker: 'AMD', is_target: false, pe_fwd: 28.2, ev_rev: 8.4, ev_ebitda: 21.0, ps: 7.9 },
                        { ticker: 'AVGO', is_target: false, pe_fwd: 31.5, ev_rev: 14.2, ev_ebitda: 24.5, ps: 12.1 },
                        { ticker: 'MRVL', is_target: false, pe_fwd: 35.1, ev_rev: 9.8, ev_ebitda: 28.3, ps: 9.2 },
                    ],
                    peer_average: { pe_fwd: 31.6, ev_rev: 10.8, ev_ebitda: 24.6, ps: 9.7 },
                    valuation_summary: { implied_price: 148.20, upside: 15.2, peer_premium: 34.1, selected_peers: 'AMD, AVGO, MRVL', weighting_method: 'Equal Weighted' },
                    word_count: { current: 425, target_min: 500, target_max: 700 },
                    citations: { current: 3, goal: 5 },
                    draft_excerpt: '"NVIDIA\'s forward P/E expansion relative to peers is fundamentally supported by its 70%+ gross margin profile compared to the peer average of 54.2%..."',
                });
            });
    }, [ticker]);

    if (!data) {
        return <div className="page"><div className="loading-state"><div className="loading-spinner" /><span>Loading...</span></div></div>;
    }

    const wcPct = Math.min(100, (data.word_count.current / data.word_count.target_max) * 100);
    const wcDots = [
        wcPct >= 25, wcPct >= 50, wcPct >= 75, wcPct >= 100
    ];

    return (
        <div className="page pv-page">
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
                <button className="pv-more">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                        <circle cx="12" cy="5" r="1.5" /><circle cx="12" cy="12" r="1.5" /><circle cx="12" cy="19" r="1.5" />
                    </svg>
                </button>
            </div>

            {/* Tabs */}
            <div className="pv-tabs">
                <button className={`pv-tab ${tab === 'current' ? 'pv-tab-active' : ''}`} onClick={() => setTab('current')}>
                    Current Multiples
                </button>
                <button className={`pv-tab ${tab === 'historical' ? 'pv-tab-active' : ''}`} onClick={() => setTab('historical')}>
                    Historical Averages
                </button>
            </div>

            {/* Multiples table */}
            <div className="pv-table-wrap card">
                <table className="pv-table">
                    <thead>
                        <tr>
                            <th>Ticker</th>
                            <th>P/E<br /><span className="pv-th-sub">(FWD)</span></th>
                            <th>EV/REV</th>
                            <th>EV/EBITDA</th>
                            <th>P/S</th>
                        </tr>
                    </thead>
                    <tbody>
                        {data.current_multiples.map((row) => (
                            <tr key={row.ticker} className={row.is_target ? 'pv-target-row' : ''}>
                                <td>
                                    <span className="pv-ticker-cell">{row.ticker}</span>
                                    {row.is_target && <span className="pv-target-label">TARGET</span>}
                                </td>
                                <td className={row.is_target ? 'pv-val-highlight' : ''}>{row.pe_fwd}x</td>
                                <td className={row.is_target ? 'pv-val-highlight' : ''}>{row.ev_rev}x</td>
                                <td className={row.is_target ? 'pv-val-highlight' : ''}>{row.ev_ebitda}x</td>
                                <td className={row.is_target ? 'pv-val-highlight' : ''}>{row.ps}x</td>
                            </tr>
                        ))}
                        <tr className="pv-avg-row">
                            <td>Peer<br />Avg.</td>
                            <td className="pv-avg-val">{data.peer_average.pe_fwd}x</td>
                            <td className="pv-avg-val">{data.peer_average.ev_rev}x</td>
                            <td className="pv-avg-val">{data.peer_average.ev_ebitda}x</td>
                            <td className="pv-avg-val">{data.peer_average.ps}x</td>
                        </tr>
                    </tbody>
                </table>
            </div>

            {/* Valuation Summary */}
            <div className="pv-summary card">
                <div className="pv-summary-header">
                    <span className="pv-summary-title">Valuation Summary</span>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="2">
                        <rect x="9" y="9" width="13" height="13" rx="2" ry="2" /><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
                    </svg>
                </div>

                <div className="pv-summary-cards">
                    <div className="pv-summary-card">
                        <span className="pv-summary-label">Implied Price</span>
                        <span className="pv-summary-value">${data.valuation_summary.implied_price.toFixed(2)}</span>
                        <span className="pv-summary-sub pv-up">{data.valuation_summary.upside}% Upside</span>
                    </div>
                    <div className="pv-summary-card">
                        <span className="pv-summary-label">Peer Premium</span>
                        <span className="pv-summary-value">{data.valuation_summary.peer_premium}%</span>
                        <span className="pv-summary-sub">vs Group Avg.</span>
                    </div>
                </div>

                <div className="pv-summary-meta">
                    <div className="pv-meta-row">
                        <span className="pv-meta-label">Selected Peers</span>
                        <span className="pv-meta-value">{data.valuation_summary.selected_peers}</span>
                    </div>
                    <div className="pv-meta-row">
                        <span className="pv-meta-label">Weighting Method</span>
                        <span className="pv-meta-value">{data.valuation_summary.weighting_method}</span>
                    </div>
                </div>

                <button className="btn btn-primary pv-recalc-btn">Recalculate Model</button>
            </div>

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
                <button className="pv-subnav-item pv-subnav-active">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4-4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 00-3-3.87" /><path d="M16 3.13a4 4 0 010 7.75" /></svg>
                    <span>Peers</span>
                </button>
                <button className="pv-subnav-center">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
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
