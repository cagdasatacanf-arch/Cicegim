import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import BottomNav from './components/BottomNav';
import Home from './pages/Home';
import Reports from './pages/Reports';
import Models from './pages/Models';
import Profile from './pages/Profile';
import FrameworkDetail from './pages/FrameworkDetail';
import Pipeline from './pages/Pipeline';
import ReportView from './pages/ReportView';
import Compliance from './pages/Compliance';
import IntelFeed from './pages/IntelFeed';
import PeerValuation from './pages/PeerValuation';
import Risks from './pages/Risks';
import VersionComparison from './pages/VersionComparison';
import Citations from './pages/Citations';
import DataSources from './pages/DataSources';
import PortfolioCoverage from './pages/PortfolioCoverage';
import SectionEditor from './pages/SectionEditor';
import Conclusion from './pages/Conclusion';
import ReportPreview from './pages/ReportPreview';
import StrategicPositioning from './pages/StrategicPositioning';
import AiSynthesis from './pages/AiSynthesis';
import FinancialDeepDive from './pages/FinancialDeepDive';

export default function App() {
  return (
    <BrowserRouter>
      <div className="app-layout">
        <Routes>
          {/* Pages with standard layout (header + bottom nav) */}
          <Route path="/" element={<><Header /><Home /><BottomNav /></>} />
          <Route path="/reports" element={<><Header /><Reports /><BottomNav /></>} />
          <Route path="/models" element={<><Header /><Models /><BottomNav /></>} />
          <Route path="/profile" element={<><Header /><Profile /><BottomNav /></>} />

          {/* Detail pages with their own navigation */}
          <Route path="/frameworks/:id" element={<FrameworkDetail />} />
          <Route path="/pipeline/:ticker" element={<Pipeline />} />
          <Route path="/reports/:id/view" element={<ReportView />} />

          {/* Phase 3 pages */}
          <Route path="/compliance" element={<Compliance />} />
          <Route path="/intelligence" element={<IntelFeed />} />
          <Route path="/valuation/:ticker" element={<PeerValuation />} />
          <Route path="/risks/:ticker" element={<Risks />} />

          {/* Phase 4 pages */}
          <Route path="/versions/:id" element={<VersionComparison />} />
          <Route path="/citations" element={<Citations />} />
          <Route path="/data-sources" element={<DataSources />} />
          <Route path="/portfolio" element={<PortfolioCoverage />} />
          <Route path="/editor/:sectionId" element={<SectionEditor />} />
          <Route path="/conclusion/:ticker" element={<Conclusion />} />
          <Route path="/report-preview/:ticker" element={<ReportPreview />} />
          <Route path="/strategy/:ticker" element={<StrategicPositioning />} />
          <Route path="/ai-synthesis/:ticker" element={<AiSynthesis />} />
          <Route path="/financials/:ticker" element={<FinancialDeepDive />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}
