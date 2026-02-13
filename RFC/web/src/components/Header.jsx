import './Header.css';

export default function Header() {
    return (
        <header className="header">
            <div className="header-left">
                <div className="header-logo">
                    <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
                        <rect width="28" height="28" rx="8" fill="url(#logo-grad)" />
                        <path d="M8 14l4-6 4 6-4 6z" fill="white" opacity="0.9" />
                        <path d="M14 10l4 4-4 4" stroke="white" strokeWidth="1.5" opacity="0.7" />
                        <defs>
                            <linearGradient id="logo-grad" x1="0" y1="0" x2="28" y2="28">
                                <stop stopColor="#3b82f6" />
                                <stop offset="1" stopColor="#8b5cf6" />
                            </linearGradient>
                        </defs>
                    </svg>
                </div>
                <span className="header-title">IRF Analyst</span>
            </div>
            <div className="header-right">
                <button className="header-icon-btn" aria-label="Notifications">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9" />
                        <path d="M13.73 21a2 2 0 01-3.46 0" />
                    </svg>
                    <span className="notification-dot"></span>
                </button>
                <div className="header-avatar">
                    <div className="avatar-circle">
                        <span>C</span>
                    </div>
                </div>
            </div>
        </header>
    );
}
