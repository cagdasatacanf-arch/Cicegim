import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import './AiSynthesis.css';

export default function AiSynthesis() {
    const { ticker } = useParams();
    const navigate = useNavigate();
    const [data, setData] = useState(null);
    const [focus, setFocus] = useState('Standard');
    const [generating, setGenerating] = useState(false);

    useEffect(() => {
        fetch(`http://localhost:8000/api/ai-synthesis/${ticker}`)
            .then((r) => r.json())
            .then((d) => { setData(d); setFocus(d.selected_focus); })
            .catch(() => {
                setData({
                    section: 'SECTION 1: EXECUTIVE SUMMARY', ticker: ticker.toUpperCase(),
                    title: 'AI Report Synthesis', subtitle: 'Synthesize data from Sections 2-10 into a cohesive executive investment narrative.',
                    refinement_focus: ['Standard', 'Growth', 'Yield', 'Defensive'], selected_focus: 'Standard',
                    draft_status: 'READY',
                    paragraphs: [
                        { label: 'THESIS', label_color: '#10B981', text: 'Our analysis indicates a compelling opportunity...' },
                        { label: null, text: 'The data aggregated from the supply chain section suggests a 22% improvement...' },
                        { label: 'KEY RISKS', label_color: '#F59E0B', text: 'Geopolitical tensions regarding export controls...' },
                        { label: 'PRICE TARGET', label_color: '#8B5CF6', text: 'We maintain an Outperform rating with a 12-month target...' },
                    ],
                    generated_ago: 'Generated 2m ago', word_count: 482, citation_verification: 92, length: 'MEDIUM',
                });
                setFocus('Standard');
            });
    }, [ticker]);

    const handleGenerate = () => {
        setGenerating(true);
        setTimeout(() => setGenerating(false), 2000);
    };

    if (!data) {
        return <div className="page"><div className="loading-state"><div className="loading-spinner" /><span>Loading...</span></div></div>;
    }

    return (
        <div className="page as-page">
            {/* Top bar */}
            <div className="as-topbar">
                <button className="sp-back" onClick={() => navigate(-1)}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <polyline points="15,18 9,12 15,6" />
                    </svg>
                    <span>Framework</span>
                </button>
                <span className="as-section-label">{data.section}</span>
                <button className="rp-icon-btn">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                        <circle cx="12" cy="5" r="1.5" /><circle cx="12" cy="12" r="1.5" /><circle cx="12" cy="19" r="1.5" />
                    </svg>
                </button>
            </div>

            {/* Title */}
            <h1 className="as-title">{data.title}</h1>
            <p className="as-subtitle">{data.subtitle}</p>

            {/* Generate button */}
            <button className={`as-generate-btn ${generating ? 'as-gen-loading' : ''}`} onClick={handleGenerate}>
                {generating ? (
                    <>
                        <div className="loading-spinner" style={{ width: 16, height: 16 }} />
                        Generating...
                    </>
                ) : (
                    <>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                        </svg>
                        Generate Draft
                    </>
                )}
            </button>

            {/* Refinement focus */}
            <div className="as-refinement">
                <span className="as-refinement-label">REFINEMENT FOCUS</span>
                <div className="as-focus-tabs">
                    {data.refinement_focus.map((f) => (
                        <button
                            key={f}
                            className={`as-focus-tab ${focus === f ? 'as-focus-active' : ''}`}
                            onClick={() => setFocus(f)}
                        >
                            {f}
                        </button>
                    ))}
                </div>
            </div>

            {/* Preview draft */}
            <div className="as-preview-header">
                <span className="as-preview-label">PREVIEW DRAFT</span>
                <span className="as-draft-badge">{data.draft_status}</span>
            </div>

            <div className="as-draft-card card">
                {data.paragraphs.map((p, i) => (
                    <div key={i} className="as-paragraph">
                        {p.label && (
                            <span className="as-para-badge" style={{ background: `${p.label_color}1a`, color: p.label_color }}>
                                {p.label}
                            </span>
                        )}
                        <span className="as-para-text">{p.text}</span>
                    </div>
                ))}

                <div className="as-draft-footer">
                    <span className="as-draft-meta">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
                        </svg>
                        {data.generated_ago}
                    </span>
                    <span className="as-draft-meta">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" /><polyline points="14 2 14 8 20 8" />
                        </svg>
                        {data.word_count} Words
                    </span>
                </div>
            </div>

            {/* Citation verification */}
            <div className="as-citation-row">
                <span className="as-citation-label">Citation Verification</span>
                <span className="as-citation-pct">{data.citation_verification}%</span>
            </div>
            <div className="as-citation-bar-track">
                <div className="as-citation-bar-fill" style={{ width: `${data.citation_verification}%` }} />
            </div>

            {/* Length control */}
            <div className="as-length-row">
                <div className="as-length-control">
                    <button className="as-length-btn">−</button>
                    <span className="as-length-value">LENGTH: {data.length}</span>
                    <button className="as-length-btn">+</button>
                </div>
                <button className="as-manual-edit">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
                    </svg>
                    Manual Edit
                </button>
            </div>

            {/* Finalize */}
            <button className="as-finalize-btn btn btn-primary">
                Finalize Section
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M22 11.08V12a10 10 0 11-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" />
                </svg>
            </button>
        </div>
    );
}
