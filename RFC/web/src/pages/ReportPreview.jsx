import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import './ReportPreview.css';

export default function ReportPreview() {
    const { ticker } = useParams();
    const navigate = useNavigate();
    const [data, setData] = useState(null);
    const [currentPage, setCurrentPage] = useState(0);

    useEffect(() => {
        fetch(`http://localhost:8000/api/report-preview/${ticker}`)
            .then((r) => r.json())
            .then(setData)
            .catch(() => {
                setData({
                    ticker: ticker.toUpperCase(), total_pages: 18, firm: 'KONGSBERG RESEARCH', firm_initial: 'K',
                    rating: 'STRONG BUY', company: 'NVIDIA Corp.', exchange: `${ticker.toUpperCase()}:NASDAQ`,
                    price: 128.55, date: 'OCTOBER 24, 2023', target_price: 165.00, market_cap: '3.12T', risk_level: 'Moderate',
                    pages: [
                        {
                            page: 1, section_title: 'SECTION 1: EXECUTIVE SUMMARY',
                            content_left: 'Summary: NVIDIA Corporation continues to demonstrate unparalleled dominance in the accelerated computing sector...',
                            content_right: 'expansion. Current free cash flow projections indicate a 22% CAGR through 2027...',
                            watermark: 'Institutional Series | Confidential Research'
                        },
                    ],
                });
            });
    }, [ticker]);

    if (!data) {
        return <div className="page"><div className="loading-state"><div className="loading-spinner" /><span>Loading...</span></div></div>;
    }

    const page = data.pages[currentPage] || data.pages[0];

    return (
        <div className="rp-page">
            {/* Top bar */}
            <div className="rp-topbar">
                <button className="rp-close-btn" onClick={() => navigate(-1)}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                </button>
                <div className="rp-top-center">
                    <span className="rp-top-title">Equity Research Report</span>
                    <span className="rp-top-subtitle">PAGE {page.page} OF {data.total_pages}</span>
                </div>
                <div className="rp-top-right">
                    <button className="rp-icon-btn">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
                        </svg>
                    </button>
                    <button className="rp-icon-btn">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                            <circle cx="12" cy="5" r="1.5" /><circle cx="12" cy="12" r="1.5" /><circle cx="12" cy="19" r="1.5" />
                        </svg>
                    </button>
                </div>
            </div>

            {/* PDF Document */}
            <div className="rp-doc-container">
                <div className="rp-doc-page">
                    {/* Cover header */}
                    <div className="rp-doc-header">
                        <div className="rp-firm-row">
                            <div className="rp-firm-logo">
                                <span className="rp-firm-initial">{data.firm_initial}</span>
                            </div>
                            <div className="rp-firm-name">{data.firm}</div>
                            <div className="rp-rating-badge">
                                <span className="rp-rating-label">CURRENT RATING</span>
                                <span className="rp-rating-value">{data.rating}</span>
                            </div>
                        </div>

                        <h1 className="rp-company-name">{data.company}</h1>
                        <div className="rp-company-meta">
                            <span className="rp-exchange-badge">{data.exchange}</span>
                            <span className="rp-price-info">Price: ${data.price.toFixed(2)}</span>
                            <span className="rp-date">{data.date}</span>
                        </div>

                        <div className="rp-divider" />

                        <div className="rp-stats-row">
                            <div className="rp-stat">
                                <span className="rp-stat-label">TARGET PRICE</span>
                                <span className="rp-stat-value">${data.target_price.toFixed(2)}</span>
                            </div>
                            <div className="rp-stat">
                                <span className="rp-stat-label">MARKET CAP</span>
                                <span className="rp-stat-value">${data.market_cap}</span>
                            </div>
                            <div className="rp-stat">
                                <span className="rp-stat-label">RISK LEVEL</span>
                                <span className="rp-stat-value">{data.risk_level}</span>
                            </div>
                        </div>
                    </div>

                    {/* Section content */}
                    <div className="rp-section">
                        <h2 className="rp-section-title">{page.section_title}</h2>
                        <div className="rp-two-col">
                            <div className="rp-col">{page.content_left}</div>
                            <div className="rp-col">{page.content_right}</div>
                        </div>
                    </div>

                    {/* Watermark */}
                    <div className="rp-watermark">
                        <span>{page.watermark}</span>
                        <span>PAGE {page.page}</span>
                    </div>
                </div>
            </div>

            {/* Page dots */}
            <div className="rp-page-dots">
                {data.pages.map((_, i) => (
                    <button
                        key={i}
                        className={`rp-dot ${i === currentPage ? 'rp-dot-active' : ''}`}
                        onClick={() => setCurrentPage(i)}
                    />
                ))}
            </div>

            {/* Bottom action bar */}
            <div className="rp-bottom-bar">
                <button className="rp-action-btn">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" />
                        <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" /><line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
                    </svg>
                    <span>SHARE</span>
                </button>
                <button className="rp-download-btn">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" /><polyline points="14 2 14 8 20 8" />
                        <line x1="12" y1="18" x2="12" y2="12" /><polyline points="9 15 12 18 15 15" />
                    </svg>
                    Download PDF
                </button>
                <button className="rp-action-btn">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="6 9 6 2 18 2 18 9" /><path d="M6 18H4a2 2 0 01-2-2v-5a2 2 0 012-2h16a2 2 0 012 2v5a2 2 0 01-2 2h-2" />
                        <rect x="6" y="14" width="12" height="8" />
                    </svg>
                    <span>PRINT</span>
                </button>
            </div>
        </div>
    );
}
