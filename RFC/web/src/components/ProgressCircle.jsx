import './ProgressCircle.css';

export default function ProgressCircle({ value = 0, size = 52, strokeWidth = 4 }) {
    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (value / 100) * circumference;
    const color = value >= 80 ? 'var(--accent-green)' : value >= 50 ? 'var(--accent-blue)' : 'var(--accent-yellow)';

    return (
        <div className="progress-circle" style={{ width: size, height: size }}>
            <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
                <circle
                    className="progress-bg"
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    strokeWidth={strokeWidth}
                />
                <circle
                    className="progress-bar"
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    strokeWidth={strokeWidth}
                    strokeDasharray={circumference}
                    strokeDashoffset={offset}
                    style={{ stroke: color }}
                    transform={`rotate(-90 ${size / 2} ${size / 2})`}
                />
            </svg>
            <span className="progress-value" style={{ color }}>{value}%</span>
        </div>
    );
}
