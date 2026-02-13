import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api';
import SearchBar from '../components/SearchBar';
import ReportCard from '../components/ReportCard';
import FrameworkCard from '../components/FrameworkCard';
import LogEntry from '../components/LogEntry';
import './Home.css';

export default function Home() {
    const navigate = useNavigate();
    const [stats, setStats] = useState(null);
    const [frameworks, setFrameworks] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function load() {
            try {
                const [statsData, fwData] = await Promise.all([
                    api.getStats(),
                    api.getFrameworks(),
                ]);
                setStats(statsData);
                setFrameworks(fwData.frameworks || []);
            } catch (err) {
                console.error('Failed to load dashboard:', err);
                // Use fallback data
                setStats({
                    greeting: 'Good morning',
                    pending_qa: 3,
                    active_research: [
                        {
                            id: 'nvda-q3-2024',
                            title: 'NVIDIA Q3 Deep Dive',
                            status: 'qa_review',
                            progress: 85,
                            citations_verified: 112,
                            word_count: 2482,
                            word_count_vs_avg: '+12%',
                            last_updated: '14m ago',
                            updated_by: 'System AI',
                        },
                        {
                            id: 'global-saas-val',
                            title: 'Global SaaS Valuation',
                            status: 'in_progress',
                            progress: 32,
                            sources_scanned: 42,
                            draft_sections: '4 / 12',
                            last_updated: '2h ago',
                            updated_by: 'Analyst',
                        },
                    ],
                    generation_log: [
                        {
                            id: 'log-1',
                            type: 'citation',
                            message: 'Citations verified for NVIDIA Report',
                            timestamp: 'Today at 10:45 AM',
                            detail: '120 sources checked',
                            color: 'blue',
                        },
                        {
                            id: 'log-2',
                            type: 'generation',
                            message: 'Generation Complete: Energy Outlook 2024',
                            timestamp: 'Yesterday at 6:20 PM',
                            detail: 'Completed by Analyst AI',
                            color: 'green',
                        },
                    ],
                });
                setFrameworks([
                    { id: 'semiconductor_fabless', name: 'Semiconductor Logic', version: '4.2', status: 'Updated' },
                    { id: 'defense_aerospace', name: 'Defense & Aero', version: '2.0', status: 'Standard' },
                    { id: 'enterprise_saas', name: 'Enterprise SaaS', version: '3.1', status: 'Draft' },
                ]);
            } finally {
                setLoading(false);
            }
        }
        load();
    }, []);

    if (loading) {
        return (
            <div className="page">
                <div className="loading-state">
                    <div className="loading-spinner" />
                    <span>Loading dashboard...</span>
                </div>
            </div>
        );
    }

    return (
        <div className="page">
            <div className="greeting-section">
                <h1>{stats.greeting}, James</h1>
                <p className="text-secondary">
                    You have <span className="text-accent">{stats.pending_qa} reports</span> pending QA review today.
                </p>
            </div>

            <SearchBar />

            {/* Active Research */}
            <div className="section-header">
                <span className="section-title">Active Research</span>
                <button className="section-action">View All</button>
            </div>

            {stats.active_research?.map((report) => (
                <div key={report.id} onClick={() => navigate(`/pipeline/${report.id.split('-')[0]}`)} style={{ cursor: 'pointer' }}>
                    <ReportCard report={report} />
                </div>
            ))}

            {/* Sector Frameworks */}
            <div className="section-header">
                <span className="section-title">Sector Frameworks</span>
                <button className="section-action framework-settings-btn" aria-label="Settings">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="12" cy="12" r="3" />
                        <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z" />
                    </svg>
                </button>
            </div>

            <div className="frameworks-scroll">
                {frameworks.map((fw) => (
                    <div key={fw.id} onClick={() => navigate(`/frameworks/${fw.id}`)} style={{ cursor: 'pointer' }}>
                        <FrameworkCard framework={fw} />
                    </div>
                ))}
            </div>

            {/* Generation Log */}
            <div className="section-header">
                <span className="section-title">Generation Log</span>
            </div>

            <div className="log-list">
                {stats.generation_log?.map((entry) => (
                    <LogEntry key={entry.id} entry={entry} />
                ))}
            </div>
        </div>
    );
}
