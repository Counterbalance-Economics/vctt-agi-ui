
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import DeepAgent from './pages/DeepAgent';
import CoachDashboard from './pages/admin/CoachDashboard';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/deep" replace />} />
        <Route path="/deep" element={<DeepAgent />} />
        <Route path="/admin/coach" element={<CoachDashboard />} />
      </Routes>
    </Router>
  );
}

export default App;
