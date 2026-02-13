const API_BASE = 'http://localhost:8000/api';

async function request(path, options = {}) {
    const res = await fetch(`${API_BASE}${path}`, {
        headers: { 'Content-Type': 'application/json', ...options.headers },
        ...options,
    });
    if (!res.ok) {
        const err = await res.json().catch(() => ({ detail: res.statusText }));
        throw new Error(err.detail || 'Request failed');
    }
    return res.json();
}

export const api = {
    // Dashboard
    getStats: () => request('/stats'),

    // Frameworks
    getFrameworks: () => request('/frameworks'),
    getFramework: (id) => request(`/frameworks/${id}`),

    // Reports
    getReports: () => request('/reports'),
    getReport: (ticker) => request(`/reports/${ticker}`),
    createReport: (data) =>
        request('/reports/new', { method: 'POST', body: JSON.stringify(data) }),

    // Research
    getFinancials: (ticker) => request(`/research/financials/${ticker}`),

    // Config
    getConfig: () => request('/config'),
    updateConfig: (key, value) =>
        request('/config', { method: 'POST', body: JSON.stringify({ key, value }) }),
};
