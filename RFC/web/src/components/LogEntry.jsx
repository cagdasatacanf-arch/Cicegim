import './LogEntry.css';

export default function LogEntry({ entry }) {
    return (
        <div className="log-entry">
            <div className={`log-dot log-dot-${entry.color}`} />
            <div className="log-content">
                <p className="log-message">{entry.message}</p>
                <span className="log-meta">
                    {entry.timestamp} • {entry.detail}
                </span>
            </div>
        </div>
    );
}
