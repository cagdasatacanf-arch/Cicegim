import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api';
import './Reports.css';

const STATUS_COLORS = {
    complete: 'green',
    qa_review: 'blue',
    in_progress: 'yellow',
    draft: 'purple',
};

const STATUS_LABELS = {
    complete: 'Complete',
    qa_review: 'QA Review',
    in_progress: 'In Progress',
    draft: 'Draft',
};

export default function Reports() {
    const navigate = useNavigate();
    const [reports, setReports] = useState([]);
    const [showNew, setShowNew] = useState(false);
    const [form, setForm] = useState({ ticker: '', framework_id: '', quarter: '' });

    useEffect(() => {
        api.getReports()
            .then((data) => setReports(data.reports || []))
            .catch(() => {
                setReports([
                    {
                        id: 'rpt-nvda-001', ticker: 'NVDA', company: 'NVIDIA Corporation',
                        framework: 'semiconductor_fabless', quarter: 'Q3 FY2025',
                        status: 'qa_review', progress: 85, word_count: 8420,
                        sections_complete: 11, sections_total: 11,
                        created_at: '2024-12-15', updated_at: '2024-12-20',
                    },
                    {
                        id: 'rpt-saab-001', ticker: 'SAAB', company: 'Saab AB',
                        framework: 'defense_aerospace', quarter: 'Q4 FY2024',
                        status: 'in_progress', progress: 32, word_count: 3200,
                        sections_complete: 4, sections_total: 11,
                        created_at: '2024-12-18', updated_at: '2024-12-20',
                    },
                    {
                        id: 'rpt-amd-001', ticker: 'AMD', company: 'Advanced Micro Devices',
                        framework: 'semiconductor_fabless', quarter: 'Q3 FY2025',
                        status: 'complete', progress: 100, word_count: 9150,
                        sections_complete: 11, sections_total: 11,
                        created_at: '2024-12-10', updated_at: '2024-12-14',
                    },
                ]);
            });
    }, []);

    function handleCreate(e) {
        e.preventDefault();
        api.createReport(form)
            .then(() => {
                setShowNew(false);
                setForm({ ticker: '', framework_id: '', quarter: '' });
            })
            .catch((err) => alert(err.message));
    }

    return (
        <div className="page">
            <div className="page-header">
                <h2>Reports</h2>
                <button className="btn btn-primary" onClick={() => setShowNew(!showNew)}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <line x1="12" y1="5" x2="12" y2="19" />
                        <line x1="5" y1="12" x2="19" y2="12" />
                    </svg>
                    New Report
                </button>
            </div>

            {showNew && (
                <form className="new-report-form card" onSubmit={handleCreate}>
                    <h3>Create New Report</h3>
                    <div className="form-group">
                        <label>Ticker</label>
                        <input className="input" placeholder="e.g. NVDA" value={form.ticker}
                            onChange={(e) => setForm({ ...form, ticker: e.target.value })} required />
                    </div>
                    <div className="form-group">
                        <label>Framework</label>
                        <select className="input" value={form.framework_id}
                            onChange={(e) => setForm({ ...form, framework_id: e.target.value })} required>
                            <option value="">Select framework</option>
                            <option value="semiconductor_fabless">Semiconductor - Fabless</option>
                            <option value="defense_aerospace">Defense & Aerospace</option>
                        </select>
                    </div>
                    <div className="form-group">
                        <label>Quarter</label>
                        <input className="input" placeholder="e.g. Q4 FY2025" value={form.quarter}
                            onChange={(e) => setForm({ ...form, quarter: e.target.value })} required />
                    </div>
                    <div className="form-actions">
                        <button type="button" className="btn btn-secondary" onClick={() => setShowNew(false)}>Cancel</button>
                        <button type="submit" className="btn btn-primary">Create</button>
                    </div>
                </form>
            )}

            <div className="reports-list">
                {reports.map((report) => (
                    <div key={report.id} className="report-row card"
                        onClick={() => navigate(
                            report.status === 'complete' || report.status === 'qa_review'
                                ? `/reports/${report.id}/view`
                                : `/pipeline/${report.ticker.toLowerCase()}`
                        )}
                        style={{ cursor: 'pointer' }}>
                        <div className="report-row-left">
                            <div className="report-row-ticker">{report.ticker}</div>
                            <div>
                                <p className="report-row-company">{report.company}</p>
                                <p className="report-row-meta">
                                    {report.quarter} • {report.framework.replace('_', ' ')}
                                </p>
                            </div>
                        </div>
                        <div className="report-row-right">
                            <span className={`badge badge-${STATUS_COLORS[report.status]}`}>
                                {STATUS_LABELS[report.status]}
                            </span>
                            <div className="report-row-stats">
                                <span>{report.word_count?.toLocaleString()} words</span>
                                <span>{report.sections_complete}/{report.sections_total} sections</span>
                            </div>
                            <div className="report-progress-bar-wrap">
                                <div className="report-progress-bar">
                                    <div className="report-progress-fill" style={{ width: `${report.progress}%` }} />
                                </div>
                                <span className="report-progress-pct">{report.progress}%</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
