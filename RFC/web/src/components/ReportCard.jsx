import ProgressCircle from './ProgressCircle';
import './ReportCard.css';

export default function ReportCard({ report }) {
    const isQA = report.status === 'qa_review';

    return (
        <div className="report-card card">
            <div className="report-card-top">
                <div>
                    <span className={`badge ${isQA ? 'badge-blue' : 'badge-yellow'}`}>
                        {isQA ? 'QA Review' : 'In Progress'}
                    </span>
                    <h3 className="report-card-title">{report.title}</h3>
                </div>
                <ProgressCircle value={report.progress} />
            </div>

            <div className="report-card-metrics">
                {report.citations_verified != null && (
                    <div className="metric">
                        <span className="metric-label">Citations Verified</span>
                        <div className="metric-row">
                            <div className="metric-bar-track">
                                <div
                                    className="metric-bar-fill"
                                    style={{ width: `${Math.min(report.citations_verified / 1.5, 100)}%` }}
                                />
                            </div>
                            <span className="metric-value">{report.citations_verified}</span>
                        </div>
                    </div>
                )}

                {report.sources_scanned != null && (
                    <div className="metric">
                        <span className="metric-label">Sources Scanned</span>
                        <div className="metric-row">
                            <div className="metric-bar-track">
                                <div
                                    className="metric-bar-fill"
                                    style={{ width: `${Math.min(report.sources_scanned * 2, 100)}%` }}
                                />
                            </div>
                            <span className="metric-value">{report.sources_scanned}</span>
                        </div>
                    </div>
                )}

                {report.word_count != null && (
                    <div className="metric">
                        <span className="metric-label">Word Count</span>
                        <div className="metric-value-row">
                            <span className="metric-value">{report.word_count.toLocaleString()}</span>
                            {report.word_count_vs_avg && (
                                <span className="text-green">{report.word_count_vs_avg} vs avg</span>
                            )}
                        </div>
                    </div>
                )}

                {report.draft_sections != null && (
                    <div className="metric">
                        <span className="metric-label">Draft Sections</span>
                        <span className="metric-value">{report.draft_sections}</span>
                    </div>
                )}
            </div>

            {report.last_updated && (
                <div className="report-card-footer">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="12" cy="12" r="10" />
                        <polyline points="12,6 12,12 16,14" />
                    </svg>
                    <span>Last updated {report.last_updated} by {report.updated_by}</span>
                </div>
            )}
        </div>
    );
}
