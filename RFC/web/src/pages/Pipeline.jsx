import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './Pipeline.css';

const STAGE_ICONS = {
    complete: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="11" fill="var(--accent-green)" />
            <polyline points="8,12 11,15 16,9" stroke="white" strokeWidth="2.5" fill="none" strokeLinecap="round" />
        </svg>
    ),
    active: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" className="spin-icon">
            <circle cx="12" cy="12" r="11" stroke="var(--accent-blue)" strokeWidth="2" fill="none" strokeDasharray="22 44" />
        </svg>
    ),
    pending: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="11" stroke="var(--text-muted)" strokeWidth="2" fill="none" />
            <circle cx="12" cy="12" r="3" fill="var(--text-muted)" />
        </svg>
    ),
};

const SECTION_BADGES = {
    complete: 'badge-green',
    active: 'badge-blue',
    queued: 'badge-purple',
};

export default function Pipeline() {
    const { ticker } = useParams();
    const navigate = useNavigate();
    const [data, setData] = useState(null);

    useEffect(() => {
        fetch(`http://localhost:8000/api/pipeline/${ticker}`)
            .then((r) => r.json())
            .then((d) => setData(d.pipeline))
            .catch(() => {
                setData({
                    ticker: ticker?.toUpperCase() || 'NVDA',
                    company: 'NVIDIA Corporation',
                    engine_version: 'v2.4.0',
                    status: 'active',
                    est_completion: '0:45',
                    stages: [
                        { id: 'profiling', name: 'Profiling', status: 'complete', detail: 'Historical context and data mapping complete.' },
                        { id: 'financials', name: 'Fetching Financials', status: 'complete', detail: '10-K, 10-Q, and alternative data ingested.' },
                        { id: 'generation', name: 'AI Generation', status: 'active', detail: 'Synthesizing insights and drafting sections...' },
                        { id: 'qa', name: 'QA Checks', status: 'pending', detail: 'Pending generation completion.' },
                    ],
                    sections_complete: 4,
                    sections_total: 11,
                    live_word_count: 1242,
                    sections: [
                        { id: 1, name: 'Executive Summary', status: 'complete' },
                        { id: 2, name: 'Macro Environment', status: 'complete' },
                        { id: 3, name: 'Market Positioning', status: 'complete' },
                        { id: 4, name: 'Operational Analysis', status: 'active', progress: 65, detail: 'Drafting manufacturing efficiency sub-section...' },
                        { id: 5, name: 'Valuation & DCF', status: 'queued' },
                        { id: 6, name: 'Risk Assessment', status: 'queued' },
                    ],
                    ai_note: 'AI is currently analyzing the last 3 earnings transcripts to finalize the Operational Analysis.',
                });
            });
    }, [ticker]);

    if (!data) {
        return (
            <div className="page">
                <div className="loading-state">
                    <div className="loading-spinner" />
                    <span>Loading pipeline...</span>
                </div>
            </div>
        );
    }

    return (
        <div className="page pl-page">
            {/* Header */}
            <div className="pl-header">
                <div>
                    <div className="pl-status-row">
                        <span className="pl-status-label">Pipeline Active</span>
                        <span className="pl-status-dot" />
                    </div>
                    <h1 className="pl-ticker">${data.ticker}</h1>
                    <p className="text-secondary">{data.company}</p>
                </div>
                <div className="pl-header-right">
                    <span className="pl-engine">{data.engine_version} Engine</span>
                    <span className="pl-est-label">Est. Completion</span>
                    <span className="pl-est-time">{data.est_completion}</span>
                </div>
            </div>

            {/* Pipeline Stages */}
            <div className="section-header">
                <span className="section-title">Pipeline Stages</span>
            </div>

            <div className="pl-stages">
                {data.stages.map((stage, i) => (
                    <div key={stage.id} className={`pl-stage pl-stage-${stage.status}`}>
                        <div className="pl-stage-icon">{STAGE_ICONS[stage.status]}</div>
                        <div className="pl-stage-content">
                            <span className={`pl-stage-name ${stage.status === 'active' ? 'text-accent' : ''}`}>
                                {stage.name}
                            </span>
                            <span className="pl-stage-detail">{stage.detail}</span>
                        </div>
                        {i < data.stages.length - 1 && <div className="pl-stage-line" />}
                    </div>
                ))}
            </div>

            {/* Section Status */}
            <div className="pl-section-header">
                <span className="section-title">Section Status ({data.sections_complete} of {data.sections_total})</span>
                <div className="pl-live-count">
                    <span className="pl-live-label">Live Count</span>
                    <span className="pl-live-value">{data.live_word_count.toLocaleString()}</span>
                    <span className="pl-live-unit">wds</span>
                </div>
            </div>

            <div className="pl-sections">
                {data.sections.map((section) => (
                    <div key={section.id} className={`pl-section ${section.status === 'active' ? 'pl-section-active' : ''}`}>
                        <div className="pl-section-top">
                            <span className="pl-section-id">{String(section.id).padStart(2, '0')}</span>
                            <span className="pl-section-name">{section.name}</span>
                            <span className={`badge ${SECTION_BADGES[section.status]}`}>
                                {section.status.toUpperCase()}
                            </span>
                        </div>
                        {section.status === 'active' && (
                            <>
                                <div className="pl-section-progress">
                                    <div className="pl-section-bar">
                                        <div className="pl-section-fill" style={{ width: `${section.progress}%` }} />
                                    </div>
                                </div>
                                <p className="pl-section-detail">{section.detail}</p>
                            </>
                        )}
                    </div>
                ))}
            </div>

            {/* AI Note */}
            {data.ai_note && (
                <div className="pl-ai-note">
                    <span className="pl-ai-dot" />
                    <p>{data.ai_note.split('Operational Analysis.')[0]}
                        <span className="text-accent">Operational Analysis</span>.
                    </p>
                </div>
            )}

            {/* Cancel Button */}
            <button className="pl-cancel-btn" onClick={() => navigate(-1)}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--accent-red)" strokeWidth="2.5">
                    <circle cx="12" cy="12" r="10" />
                    <line x1="15" y1="9" x2="9" y2="15" />
                    <line x1="9" y1="9" x2="15" y2="15" />
                </svg>
                Cancel Generation
            </button>
        </div>
    );
}
