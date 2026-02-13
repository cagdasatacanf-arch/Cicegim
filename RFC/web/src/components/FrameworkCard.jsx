import './FrameworkCard.css';

const icons = {
    semiconductor: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <rect x="6" y="6" width="12" height="12" rx="2" />
            <line x1="6" y1="10" x2="2" y2="10" /><line x1="6" y1="14" x2="2" y2="14" />
            <line x1="18" y1="10" x2="22" y2="10" /><line x1="18" y1="14" x2="22" y2="14" />
            <line x1="10" y1="6" x2="10" y2="2" /><line x1="14" y1="6" x2="14" y2="2" />
            <line x1="10" y1="18" x2="10" y2="22" /><line x1="14" y1="18" x2="14" y2="22" />
        </svg>
    ),
    defense: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        </svg>
    ),
    default: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
        </svg>
    ),
};

function getIcon(id) {
    if (id?.includes('semiconductor')) return icons.semiconductor;
    if (id?.includes('defense')) return icons.defense;
    return icons.default;
}

export default function FrameworkCard({ framework }) {
    return (
        <div className="framework-card">
            <div className="framework-card-icon">
                {getIcon(framework.id)}
            </div>
            <span className="framework-card-name">{framework.name}</span>
            <span className="framework-card-version">
                V{framework.version} {framework.status}
            </span>
        </div>
    );
}
