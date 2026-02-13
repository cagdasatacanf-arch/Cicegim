import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import './Conclusion.css';

export default function Conclusion() {
    const { ticker } = useParams();
    const navigate = useNavigate();
    const [data, setData] = useState(null);
    const [confidence, setConfidence] = useState('High');
    const [reportReady, setReportReady] = useState(true);
    const [triggers, setTriggers] = useState([]);

    useEffect(() => {
        fetch(`http://localhost:8000/api/conclusion/${ticker}`)
            .then((r) => r.json())
            .then((d) => {
                setData(d);
                setConfidence(d.confidence_rating.selected);
                setReportReady(d.final_report_status.ready);
                setTriggers(d.monitoring_framework.triggers);
            })
            .catch(() => {
                const d = {
                    section_number: 11, section_title: 'Conclusion & Monitoring', ticker: ticker.toUpperCase(),
                    thesis_recap: { word_count: { current: 342, target: 400 }, content: 'Based on the quantitative analysis and market positioning assessment, the investment thesis remains robust...' },
                    monitoring_framework: {
                        triggers: [
                            { id: 'trg-1', title: 'Revenue Growth KPI', description: 'If quarterly revenue growth dips below 5% for two consecutive periods.', category: 'CRITICAL', category_color: '#EF4444', enabled: true },
                            { id: 'trg-2', title: 'Price Target Threshold', description: 'Equity price reaching $145.00 trigger re-evaluation of valuation multiples.', category: 'MARKET', category_color: '#3B82F6', enabled: false },
                            { id: 'trg-3', title: 'Geopolitical Shift', description: 'Any new trade tariffs exceeding 10% on semiconductors from Southeast Asia.', category: 'MACRO', category_color: '#8B5CF6', enabled: true },
                        ]
                    },
                    confidence_rating: { levels: ['Speculative', 'Moderate', 'High', 'Conviction'], selected: 'High', description: 'Based on data integrity and historical projection accuracy.' },
                    final_report_status: { ready: true, label: 'Ready for committee review' },
                    last_edited: 'M. THORNTON', last_edited_time: '14:28 GMT', section_completion: 92,
                };
                setData(d); setConfidence('High'); setReportReady(true); setTriggers(d.monitoring_framework.triggers);
            });
    }, [ticker]);

    const toggleTrigger = (id) => {
        setTriggers(triggers.map((t) => t.id === id ? { ...t, enabled: !t.enabled } : t));
    };

    if (!data) {
        return <div className="page"><div className="loading-state"><div className="loading-spinner" /><span>Loading...</span></div></div>;
    }

    const wordPct = Math.min(100, (data.thesis_recap.word_count.current / data.thesis_recap.word_count.target) * 100);

    return (
        <div className="page cn-page">
            {/* Top bar */}
            <div className="cn-topbar">
                <button className="pv-back" onClick={() => navigate(-1)}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <polyline points="15,18 9,12 15,6" />
                    </svg>
                </button>
                <div className="cn-top-center">
                    <span className="cn-section-num">SECTION {data.section_number}</span>
                    <span className="cn-section-title">{data.section_title}</span>
                </div>
                <button className="se-preview-btn cn-save-btn">Save</button>
            </div>

            {/* Investment Thesis Recap */}
            <div className="cn-section-block">
                <div className="cn-section-header">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--accent-blue)" strokeWidth="2">
                        <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" /><polyline points="14 2 14 8 20 8" />
                    </svg>
                    <h2 className="cn-block-title">Investment Thesis Recap</h2>
                    <span className="cn-word-badge">{data.thesis_recap.word_count.current} / {data.thesis_recap.word_count.target} words</span>
                </div>
                <div className="cn-thesis-content card">
                    {data.thesis_recap.content}
                </div>
            </div>

            {/* Monitoring Framework */}
            <div className="cn-section-block">
                <div className="cn-section-header">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--accent-blue)" strokeWidth="2">
                        <path d="M16 4h2a2 2 0 012 2v14a2 2 0 01-2 2H6a2 2 0 01-2-2V6a2 2 0 012-2h2" /><rect x="8" y="2" width="8" height="4" rx="1" ry="1" />
                    </svg>
                    <h2 className="cn-block-title">Monitoring Framework</h2>
                    <button className="cn-add-trigger">+ ADD TRIGGER</button>
                </div>

                <div className="cn-triggers">
                    {triggers.map((trg) => (
                        <div key={trg.id} className="cn-trigger-card card">
                            <div className="cn-trigger-top">
                                <button
                                    className={`cn-trigger-check ${trg.enabled ? 'cn-check-on' : ''}`}
                                    onClick={() => toggleTrigger(trg.id)}
                                >
                                    {trg.enabled && (
                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
                                            <polyline points="20 6 9 17 4 12" />
                                        </svg>
                                    )}
                                </button>
                                <div className="cn-trigger-info">
                                    <span className="cn-trigger-title">{trg.title}</span>
                                    <p className="cn-trigger-desc">{trg.description}</p>
                                </div>
                                <span className="cn-trigger-badge" style={{ background: `${trg.category_color}1a`, color: trg.category_color }}>
                                    {trg.category}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Confidence Rating */}
            <div className="cn-section-block">
                <div className="cn-section-header">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--accent-green)" strokeWidth="2">
                        <path d="M22 11.08V12a10 10 0 11-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" />
                    </svg>
                    <h2 className="cn-block-title">Confidence Rating</h2>
                </div>
                <div className="cn-confidence-pills">
                    {data.confidence_rating.levels.map((level) => (
                        <button
                            key={level}
                            className={`cn-conf-pill ${confidence === level ? 'cn-conf-active' : ''}`}
                            onClick={() => setConfidence(level)}
                        >
                            {level}
                        </button>
                    ))}
                </div>
                <p className="cn-conf-desc">{data.confidence_rating.description}</p>
            </div>

            {/* Final Report Status */}
            <div className="cn-final-status card">
                <div className="cn-final-left">
                    <span className="cn-final-label">Final Report Status</span>
                    <span className="cn-final-sub">{data.final_report_status.label}</span>
                </div>
                <div
                    className={`ds-toggle ${reportReady ? 'ds-toggle-on' : ''}`}
                    onClick={() => setReportReady(!reportReady)}
                >
                    <div className="ds-toggle-thumb" />
                </div>
            </div>

            {/* Last edited */}
            <div className="cn-last-edited">
                LAST EDITED BY {data.last_edited} • {data.last_edited_time}
            </div>

            {/* Bottom bar */}
            <div className="cn-bottom-bar">
                <div className="cn-completion">
                    <span className="cn-completion-label">SECTION COMPLETION</span>
                    <span className="cn-completion-value">{data.section_completion}% Finished</span>
                </div>
                <button className="btn btn-primary cn-submit-btn">
                    Submit Report
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
                    </svg>
                </button>
            </div>
        </div>
    );
}
