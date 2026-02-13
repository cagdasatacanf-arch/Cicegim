import { useState, useEffect } from 'react';
import { api } from '../api';
import './Profile.css';

export default function Profile() {
    const [config, setConfig] = useState(null);

    useEffect(() => {
        api.getConfig()
            .then((data) => setConfig(data.config))
            .catch(() => {
                setConfig({
                    model: 'claude-sonnet-4-20250514',
                    output_dir: './output',
                    max_tokens_per_section: 4096,
                    default_format: 'markdown',
                    api_key: 'sk-ant-***',
                });
            });
    }, []);

    return (
        <div className="page">
            <div className="profile-header">
                <div className="profile-avatar-large">
                    <span>C</span>
                </div>
                <div>
                    <h2>Catacan</h2>
                    <p className="text-secondary">Investment Analyst</p>
                </div>
            </div>

            <div className="section-header">
                <span className="section-title">Usage Statistics</span>
            </div>

            <div className="stats-grid">
                <div className="stat-card card">
                    <span className="stat-value">24</span>
                    <span className="stat-label">Reports Generated</span>
                </div>
                <div className="stat-card card">
                    <span className="stat-value">5</span>
                    <span className="stat-label">Frameworks</span>
                </div>
                <div className="stat-card card">
                    <span className="stat-value">1.2M</span>
                    <span className="stat-label">Tokens Used</span>
                </div>
                <div className="stat-card card">
                    <span className="stat-value">98%</span>
                    <span className="stat-label">QA Pass Rate</span>
                </div>
            </div>

            <div className="section-header">
                <span className="section-title">System Configuration</span>
            </div>

            {config && (
                <div className="config-list card">
                    {Object.entries(config).map(([key, value]) => (
                        <div key={key} className="config-row">
                            <span className="config-key">{key.replace(/_/g, ' ')}</span>
                            <span className="config-value">{String(value)}</span>
                        </div>
                    ))}
                </div>
            )}

            <div className="section-header">
                <span className="section-title">Quick Actions</span>
            </div>

            <div className="actions-list">
                <button className="action-btn card">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
                        <polyline points="17,8 12,3 7,8" />
                        <line x1="12" y1="3" x2="12" y2="15" />
                    </svg>
                    <span>Export All Reports</span>
                </button>
                <button className="action-btn card">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                    </svg>
                    <span>Backup Database</span>
                </button>
                <button className="action-btn card">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="12" cy="12" r="10" />
                        <line x1="12" y1="8" x2="12" y2="12" />
                        <line x1="12" y1="16" x2="12.01" y2="16" />
                    </svg>
                    <span>About IRF v0.1.0</span>
                </button>
            </div>
        </div>
    );
}
