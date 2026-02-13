import './SearchBar.css';

export default function SearchBar({ placeholder = 'Search frameworks or reports...' }) {
    return (
        <div className="search-bar">
            <svg className="search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
                type="text"
                className="search-input"
                placeholder={placeholder}
            />
        </div>
    );
}
