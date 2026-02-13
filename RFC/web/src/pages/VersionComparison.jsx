import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import './VersionComparison.css';

export default function VersionComparison() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [data, setData] = useState(null);
    const [tab, setTab] = useState('summary');
    const [expandedSection, setExpandedSection] = useState('sec-1');

    useEffect(() => {
        fetch(`http://localhost:8000/api/version-comparison/${id}`)
            .then((r) => r.json())
            .then(setData)
            .catch(() => {
                setData({
                    old_version: 'v1.0.2', new_version: 'v1.0.3',
                    key_changes: { word_count: { delta: 342, direction: 'up' }, citations: { delta: 2, direction: 'up' }, tone_shift: 'Formal' },
                    sections: [
                        {
                            id: 'sec-1', title: 'Executive Summary', icon: 'doc', status: 'updated',
                            content: 'The projected Q4 growth for the semiconductor segment has been <del>adjusted downwards</del> <ins>revised to 12.4%</ins> reflecting the recent manufacturing shift in Taiwan.\n\nMoreover, <ins>new regulatory headwinds in the EU suggest a conservative outlook</ins> for the remainder of the fiscal year.'
                        },
                        { id: 'sec-2', title: 'Market Outlook', icon: 'globe', status: 'no change', content: null },
                        { id: 'sec-3', title: 'Competitive Positioning', icon: 'users', status: 'updated', content: null },
                    ],
                    total_sections: 11,
                });
            });
    }, [id]);

    if (!data) {
        return <div className="page"><div className="loading-state"><div className="loading-spinner" /><span>Loading...</span></div></div>;
    }

    return (
        <div className="page vc-page">
            {/* Top bar */}
            <div className="vc-topbar">
                <button className="pv-back" onClick={() => navigate(-1)}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <polyline points="15,18 9,12 15,6" />
                    </svg>
                </button>
                <div className="vc-top-center">
                    <h2 className="vc-title">Version Comparison</h2>
                    <span className="vc-versions">
                        {data.old_version} <span className="vc-vs">vs</span> {data.new_version}
                    </span>
                </div>
                <button className="pv-more">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                        <circle cx="12" cy="5" r="1.5" /><circle cx="12" cy="12" r="1.5" /><circle cx="12" cy="19" r="1.5" />
                    </svg>
                </button>
            </div>

            {/* Tabs */}
            <div className="pv-tabs">
                <button className={`pv-tab ${tab === 'summary' ? 'pv-tab-active' : ''}`} onClick={() => setTab('summary')}>Summary</button>
                <button className={`pv-tab ${tab === 'sidebyside' ? 'pv-tab-active' : ''}`} onClick={() => setTab('sidebyside')}>Side-by-Side</button>
            </div>

            {/* Key Changes */}
            <div className="vc-section-label">KEY CHANGES <span className="vc-latest-diff">LATEST DIFF</span></div>
            <div className="vc-key-changes">
                <div className="vc-kc-card">
                    <span className="vc-kc-label">WORD COUNT</span>
                    <span className="vc-kc-value vc-kc-blue">
                        +{data.key_changes.word_count.delta}
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                            <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
                        </svg>
                    </span>
                </div>
                <div className="vc-kc-card">
                    <span className="vc-kc-label">CITATIONS</span>
                    <span className="vc-kc-value vc-kc-blue">
                        +{data.key_changes.citations.delta}
                        <span className="vc-kc-quote">❝</span>
                    </span>
                </div>
                <div className="vc-kc-card">
                    <span className="vc-kc-label">TONE SHIFT</span>
                    <span className="vc-kc-value">
                        {data.key_changes.tone_shift}
                        <span className="vc-kc-sparkle">✨</span>
                    </span>
                </div>
            </div>

            {/* Report Sections */}
            <div className="vc-section-label">REPORT SECTIONS ({data.total_sections})</div>
            <div className="vc-sections">
                {data.sections.map((sec) => (
                    <div key={sec.id} className="vc-sec-item card">
                        <div
                            className="vc-sec-header"
                            onClick={() => setExpandedSection(expandedSection === sec.id ? null : sec.id)}
                        >
                            <div className="vc-sec-icon">
                                {sec.icon === 'doc' && <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--accent-blue)" strokeWidth="2"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" /><polyline points="14 2 14 8 20 8" /></svg>}
                                {sec.icon === 'globe' && <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--accent-blue)" strokeWidth="2"><circle cx="12" cy="12" r="10" /><line x1="2" y1="12" x2="22" y2="12" /><path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z" /></svg>}
                                {sec.icon === 'users' && <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--accent-blue)" strokeWidth="2"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4-4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 00-3-3.87" /><path d="M16 3.13a4 4 0 010 7.75" /></svg>}
                                {!['doc', 'globe', 'users'].includes(sec.icon) && <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--accent-blue)" strokeWidth="2"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" /><polyline points="14 2 14 8 20 8" /></svg>}
                            </div>
                            <div className="vc-sec-info">
                                <span className="vc-sec-title">{sec.title}</span>
                                <span className={`vc-sec-status ${sec.status === 'updated' ? 'vc-status-updated' : 'vc-status-none'}`}>
                                    STATUS: {sec.status.toUpperCase()}
                                </span>
                            </div>
                            <svg
                                className={`vc-sec-chevron ${expandedSection === sec.id ? 'vc-chevron-open' : ''}`}
                                width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
                            >
                                <polyline points="6,9 12,15 18,9" />
                            </svg>
                        </div>

                        {expandedSection === sec.id && sec.content && (
                            <div className="vc-sec-content" dangerouslySetInnerHTML={{ __html: sec.content.replace(/\n/g, '<br/>') }} />
                        )}
                    </div>
                ))}
            </div>

            {/* Action buttons */}
            <button className="btn btn-primary vc-promote-btn">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M22 11.08V12a10 10 0 11-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" />
                </svg>
                Promote {data.new_version} to Final
            </button>
            <button className="vc-restore-btn">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="1 4 1 10 7 10" /><path d="M3.51 15a9 9 0 102.13-9.36L1 10" />
                </svg>
                Restore Version {data.old_version}
            </button>
        </div>
    );
}
