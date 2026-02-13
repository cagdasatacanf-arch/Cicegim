import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import './SectionEditor.css';

const TOOLBAR_ITEMS = [
    { icon: 'bold', label: 'B', style: 'font-weight:800' },
    { icon: 'italic', label: 'I', style: 'font-style:italic' },
    { icon: 'list', svg: true },
    { icon: 'text', label: 'T' },
    { icon: 'quote', label: '❝' },
    { icon: 'table', svg: true },
    { icon: 'link', svg: true },
    { icon: 'undo', svg: true },
    { icon: 'redo', svg: true },
];

export default function SectionEditor() {
    const { sectionId } = useParams();
    const navigate = useNavigate();
    const [data, setData] = useState(null);
    const [conceptClarity, setConceptClarity] = useState(true);

    useEffect(() => {
        fetch(`http://localhost:8000/api/section-editor/${sectionId}`)
            .then((r) => r.json())
            .then((d) => { setData(d); setConceptClarity(d.concept_clarity); })
            .catch(() => {
                setData({
                    section_number: parseInt(sectionId), total_sections: 11,
                    subtitle: 'MASTERCLASS EDITOR', teaching_topic: 'EUV Lithography vs DUV',
                    concept_clarity: true,
                    content_blocks: [
                        { type: 'text', html: 'Extreme Ultraviolet (EUV) lithography represents the most significant leap in semiconductor manufacturing in two decades. Unlike Deep Ultraviolet (DUV) which uses 193nm wavelength light, EUV operates at 13.5nm, allowing for the patterning of features far smaller than previously possible.' },
                        { type: 'diagram', label: 'Technical Diagram: Light Source Comparison' },
                        { type: 'text', html: 'The transition from multi-patterning DUV to single-exposure EUV reduces process complexity, but introduces significant challenges in terms of vacuum requirements, mask infrastructure, and photon shot noise at smaller feature sizes.' },
                    ],
                    word_count: { current: 842, target: 1000 },
                    key_terms_count: 4,
                    key_terms: [
                        { id: 'kt-1', term: 'Numerical Aperture', defined: false },
                        { id: 'kt-2', term: 'Stochastic Effects', defined: false },
                        { id: 'kt-3', term: 'Pellicles', defined: false },
                    ],
                });
                setConceptClarity(true);
            });
    }, [sectionId]);

    if (!data) {
        return <div className="page"><div className="loading-state"><div className="loading-spinner" /><span>Loading...</span></div></div>;
    }

    const wordPct = Math.min(100, (data.word_count.current / data.word_count.target) * 100);

    return (
        <div className="page se-page">
            {/* Top bar */}
            <div className="se-topbar">
                <button className="pv-back" onClick={() => navigate(-1)}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <polyline points="15,18 9,12 15,6" />
                    </svg>
                </button>
                <div className="se-top-center">
                    <span className="se-section-label">Section {data.section_number} of {data.total_sections}</span>
                    <span className="se-subtitle">{data.subtitle}</span>
                </div>
                <div className="se-top-right">
                    <button className="se-preview-btn">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" />
                        </svg>
                        PREVIEW
                    </button>
                    <button className="pv-more">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                            <circle cx="12" cy="5" r="1.5" /><circle cx="12" cy="12" r="1.5" /><circle cx="12" cy="19" r="1.5" />
                        </svg>
                    </button>
                </div>
            </div>

            {/* Teaching topic header */}
            <div className="se-topic-header">
                <div className="se-topic-left">
                    <span className="se-topic-label">TEACHING TOPIC</span>
                </div>
                <div className="se-topic-right">
                    <span className="se-clarity-label">Concept Clarity</span>
                    <div
                        className={`ds-toggle ${conceptClarity ? 'ds-toggle-on se-toggle-green' : ''}`}
                        onClick={() => setConceptClarity(!conceptClarity)}
                    >
                        <div className="ds-toggle-thumb" />
                    </div>
                </div>
            </div>
            <h1 className="se-topic-title">{data.teaching_topic}</h1>

            {/* Toolbar */}
            <div className="se-toolbar">
                {TOOLBAR_ITEMS.map((item, i) => (
                    <button key={i} className="se-tool-btn">
                        {item.icon === 'bold' && <span style={{ fontWeight: 800, fontSize: '16px' }}>B</span>}
                        {item.icon === 'italic' && <span style={{ fontStyle: 'italic', fontSize: '16px', fontFamily: 'serif' }}>I</span>}
                        {item.icon === 'list' && <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="8" y1="6" x2="21" y2="6" /><line x1="8" y1="12" x2="21" y2="12" /><line x1="8" y1="18" x2="21" y2="18" /><line x1="3" y1="6" x2="3.01" y2="6" /><line x1="3" y1="12" x2="3.01" y2="12" /><line x1="3" y1="18" x2="3.01" y2="18" /></svg>}
                        {item.icon === 'text' && <span style={{ fontWeight: 700, fontSize: '16px' }}>T</span>}
                        {item.icon === 'quote' && <span style={{ fontSize: '18px', lineHeight: 1 }}>❝</span>}
                        {item.icon === 'table' && <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2" /><line x1="3" y1="9" x2="21" y2="9" /><line x1="3" y1="15" x2="21" y2="15" /><line x1="9" y1="3" x2="9" y2="21" /><line x1="15" y1="3" x2="15" y2="21" /></svg>}
                        {item.icon === 'link' && <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71" /><path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71" /></svg>}
                        {item.icon === 'undo' && <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="1 4 1 10 7 10" /><path d="M3.51 15a9 9 0 102.13-9.36L1 10" /></svg>}
                        {item.icon === 'redo' && <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="23 4 23 10 17 10" /><path d="M20.49 15a9 9 0 11-2.12-9.36L23 10" /></svg>}
                    </button>
                ))}
            </div>

            {/* Content area */}
            <div className="se-content-area">
                {data.content_blocks.map((block, i) => {
                    if (block.type === 'text') {
                        return (
                            <div key={i} className="se-text-block" contentEditable suppressContentEditableWarning>
                                {block.html}
                            </div>
                        );
                    }
                    if (block.type === 'diagram') {
                        return (
                            <div key={i} className="se-diagram-placeholder">
                                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="1.5">
                                    <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="3" y="14" width="7" height="7" /><rect x="14" y="14" width="7" height="7" /><line x1="10" y1="6.5" x2="14" y2="6.5" /><line x1="6.5" y1="10" x2="6.5" y2="14" />
                                </svg>
                                <span className="se-diagram-label">[{block.label}]</span>
                                <button className="se-diagram-edit">EDIT DIAGRAM PROPERTIES</button>
                            </div>
                        );
                    }
                    return null;
                })}
            </div>

            {/* Bottom stats bar */}
            <div className="se-stats-bar">
                <button className="se-stats-tab">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M4 19.5A2.5 2.5 0 016.5 17H20" /><path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z" />
                    </svg>
                    KEY TERMS ({data.key_terms_count})
                </button>
                <button className="se-stats-tab">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" /><polyline points="14 2 14 8 20 8" />
                    </svg>
                    CITATIONS
                </button>
                <span className="se-words-count">
                    {data.word_count.current} / {data.word_count.target.toLocaleString()} WORDS
                </span>
                <div className="se-words-bar-track">
                    <div className="se-words-bar-fill" style={{ width: `${wordPct}%` }} />
                </div>
            </div>

            {/* Key terms section */}
            <div className="se-key-terms-section">
                <div className="se-key-terms-header">
                    <span className="se-key-terms-title">KEY TERMS TO DEFINE</span>
                    <button className="se-add-term">Add New</button>
                </div>
                <div className="se-key-terms-list">
                    {data.key_terms.map((kt) => (
                        <div key={kt.id} className="se-key-term-chip">
                            <span className="se-key-term-name">{kt.term}</span>
                            <span className="se-key-term-action">Insert Definition</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
