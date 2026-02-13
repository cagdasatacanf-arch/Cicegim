import { useState } from 'react';
import './Models.css';

const MODELS = [
    { id: 'claude-sonnet-4-20250514', name: 'Claude Sonnet 4', provider: 'Anthropic', status: 'active', costPer1k: '$0.003' },
    { id: 'claude-opus-4-20250514', name: 'Claude Opus 4', provider: 'Anthropic', status: 'available', costPer1k: '$0.015' },
    { id: 'gpt-4o', name: 'GPT-4o', provider: 'OpenAI', status: 'coming_soon', costPer1k: '$0.005' },
    { id: 'gemini-2.5-pro', name: 'Gemini 2.5 Pro', provider: 'Google', status: 'coming_soon', costPer1k: '$0.004' },
];

export default function Models() {
    const [activeModel, setActiveModel] = useState('claude-sonnet-4-20250514');
    const [apiKey, setApiKey] = useState('');
    const [showKey, setShowKey] = useState(false);

    return (
        <div className="page">
            <h2>AI Models</h2>
            <p className="text-secondary mt-sm">Configure AI models for report generation</p>

            <div className="section-header">
                <span className="section-title">Available Models</span>
            </div>

            <div className="models-list">
                {MODELS.map((model) => (
                    <div
                        key={model.id}
                        className={`model-card card ${activeModel === model.id ? 'model-active' : ''} ${model.status === 'coming_soon' ? 'model-disabled' : ''}`}
                        onClick={() => model.status !== 'coming_soon' && setActiveModel(model.id)}
                    >
                        <div className="model-card-top">
                            <div>
                                <h3 className="model-name">{model.name}</h3>
                                <span className="model-provider">{model.provider}</span>
                            </div>
                            <div className="model-status-wrap">
                                {activeModel === model.id ? (
                                    <span className="badge badge-green">Active</span>
                                ) : model.status === 'coming_soon' ? (
                                    <span className="badge badge-purple">Coming Soon</span>
                                ) : (
                                    <span className="badge badge-blue">Available</span>
                                )}
                            </div>
                        </div>
                        <div className="model-card-bottom">
                            <span className="text-muted">Cost: {model.costPer1k}/1K tokens</span>
                            {activeModel === model.id && (
                                <div className="model-active-indicator">
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--accent-green)" strokeWidth="3">
                                        <polyline points="20,6 9,17 4,12" />
                                    </svg>
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            <div className="section-header">
                <span className="section-title">API Configuration</span>
            </div>

            <div className="card api-config">
                <div className="form-group">
                    <label>Anthropic API Key</label>
                    <div className="api-key-input-wrap">
                        <input
                            className="input"
                            type={showKey ? 'text' : 'password'}
                            placeholder="sk-ant-..."
                            value={apiKey}
                            onChange={(e) => setApiKey(e.target.value)}
                        />
                        <button className="btn btn-secondary api-key-toggle" onClick={() => setShowKey(!showKey)}>
                            {showKey ? 'Hide' : 'Show'}
                        </button>
                    </div>
                </div>
                <div className="form-group">
                    <label>Max Tokens per Section</label>
                    <input className="input" type="number" defaultValue={4096} />
                </div>
                <button className="btn btn-primary">Save Configuration</button>
            </div>
        </div>
    );
}
