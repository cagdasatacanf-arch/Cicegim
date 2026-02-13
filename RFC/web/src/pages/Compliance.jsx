import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Compliance.css';

const STYLE_ICONS = {
    chart: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="3" width="18" height="18" rx="2" /><path d="M7 17l4-8 4 4 4-8" />
        </svg>
    ),
    shield: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        </svg>
    ),
    book: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M4 19.5A2.5 2.5 0 016.5 17H20" /><path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z" />
        </svg>
    ),
};

export default function Compliance() {
    const navigate = useNavigate();
    const [data, setData] = useState(null);
    const [toneOn, setToneOn] = useState(true);
    const [bannedWords, setBannedWords] = useState([]);
    const [newWord, setNewWord] = useState('');
    const [selectedStyle, setSelectedStyle] = useState('analytical');
    const [sensitivity, setSensitivity] = useState('medium');

    useEffect(() => {
        fetch('http://localhost:8000/api/compliance')
            .then((r) => r.json())
            .then((d) => {
                const c = d.compliance;
                setData(c);
                setToneOn(c.institutional_tone);
                setBannedWords(c.banned_words);
                setSelectedStyle(c.style_guideline);
                setSensitivity(c.qa_sensitivity);
            })
            .catch(() => {
                setData({
                    style_options: [
                        { id: 'analytical', name: 'Analytical', description: 'Data-driven, objective, neutral tone.', icon: 'chart' },
                        { id: 'conservative', name: 'Conservative', description: 'Risk-averse, highly formal language.', icon: 'shield' },
                        { id: 'academic', name: 'Academic', description: 'Deep investigative, scholarly depth.', icon: 'book' },
                    ], qa_hint: '"Medium" sensitivity balances speed with essential cross-referencing of financial data points.'
                });
                setBannedWords(['disruptive', 'game-changing', 'revolutionary', 'unicorn']);
            });
    }, []);

    function addWord() {
        if (newWord.trim() && !bannedWords.includes(newWord.trim().toLowerCase())) {
            setBannedWords([...bannedWords, newWord.trim().toLowerCase()]);
            setNewWord('');
        }
    }

    function removeWord(word) {
        setBannedWords(bannedWords.filter((w) => w !== word));
    }

    if (!data) {
        return <div className="page"><div className="loading-state"><div className="loading-spinner" /><span>Loading...</span></div></div>;
    }

    return (
        <div className="page cp-page">
            {/* Top bar */}
            <div className="cp-topbar">
                <button className="cp-back" onClick={() => navigate(-1)}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="15,18 9,12 15,6" />
                    </svg>
                    Back
                </button>
                <h2 className="cp-title">AI & Compliance</h2>
                <button className="cp-save text-accent">Save</button>
            </div>

            {/* Institutional Standards */}
            <div className="cp-section-label">Institutional Standards</div>
            <div className="cp-toggle-card card">
                <div>
                    <span className="cp-card-title">Institutional Tone</span>
                    <span className="cp-card-desc">Enforce strict corporate voice across all reports.</span>
                </div>
                <button className={`fd-toggle ${toneOn ? 'fd-toggle-on' : ''}`} onClick={() => setToneOn(!toneOn)}>
                    <span className="fd-toggle-knob" />
                </button>
            </div>

            {/* Banned Words */}
            <div className="cp-section-label">
                <span>Banned Words</span>
                <span className="cp-count">{bannedWords.length} terms active</span>
            </div>
            <div className="cp-banned card">
                <div className="cp-banned-tags">
                    {bannedWords.slice(0, 4).map((word) => (
                        <span key={word} className="cp-banned-tag">
                            {word}
                            <button className="cp-tag-x" onClick={() => removeWord(word)}>×</button>
                        </span>
                    ))}
                </div>
                <div className="cp-banned-input-row">
                    <input
                        className="cp-banned-input"
                        placeholder="Add restricted term..."
                        value={newWord}
                        onChange={(e) => setNewWord(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && addWord()}
                    />
                    <button className="cp-add-btn" onClick={addWord}>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
                            <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
                        </svg>
                    </button>
                </div>
            </div>

            {/* Style Guidelines */}
            <div className="cp-section-label">Style Guidelines</div>
            <div className="cp-styles">
                {data.style_options?.map((style) => (
                    <div
                        key={style.id}
                        className={`cp-style-card card ${selectedStyle === style.id ? 'cp-style-active' : ''}`}
                        onClick={() => setSelectedStyle(style.id)}
                    >
                        <div className="cp-style-icon">{STYLE_ICONS[style.icon]}</div>
                        <div className="cp-style-content">
                            <span className="cp-style-name">{style.name}</span>
                            <span className="cp-style-desc">{style.description}</span>
                        </div>
                        <div className={`cp-radio ${selectedStyle === style.id ? 'cp-radio-on' : ''}`}>
                            {selectedStyle === style.id && <div className="cp-radio-dot" />}
                        </div>
                    </div>
                ))}
            </div>

            {/* QA Sensitivity */}
            <div className="cp-section-label">QA Sensitivity</div>
            <div className="cp-qa card">
                <span className="cp-card-title">Citation & Metric Validation</span>
                <span className="cp-card-desc">Sensitivity level for automated fact-checking and source cross-referencing.</span>
                <div className="cp-slider-track">
                    <input
                        type="range"
                        min="0"
                        max="2"
                        value={['low', 'medium', 'high'].indexOf(sensitivity)}
                        onChange={(e) => setSensitivity(['low', 'medium', 'high'][e.target.value])}
                        className="cp-slider"
                    />
                </div>
                <div className="cp-slider-labels">
                    {['Low', 'Medium', 'High'].map((label) => (
                        <span key={label} className={sensitivity === label.toLowerCase() ? 'text-accent' : ''}>{label.toUpperCase()}</span>
                    ))}
                </div>
            </div>

            {/* QA Hint */}
            <div className="cp-hint card">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--accent-blue)" strokeWidth="2">
                    <circle cx="12" cy="12" r="10" /><line x1="12" y1="16" x2="12" y2="12" /><line x1="12" y1="8" x2="12.01" y2="8" />
                </svg>
                <p>{data.qa_hint}</p>
            </div>

            {/* Action buttons */}
            <button className="btn btn-primary cp-update-btn">Update Compliance Engine</button>
            <button className="cp-restore-btn">Restore Global Defaults</button>
        </div>
    );
}
