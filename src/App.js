import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import MainPage from './components/MainPage'; // Ensure the path is correct
import ProjectManager from './components/ProjectManager';
import ProjectDetail from './components/ProjectDetail';
import NotFound from './components/NotFound';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<MainPage />} />
        <Route path="/project-manager" element={<ProjectManager />} />
        <Route path="/project-detail" element={<ProjectDetail />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  );
}

export default App;
