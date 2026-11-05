import { lazy, Suspense } from 'react';
import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import Navbar from './components/layout/Navbar';
import Home from './pages/Home';
import Learn from './pages/Learn';
import Lab from './pages/Lab';
import Challenges from './pages/Challenges';
import Quiz from './pages/Quiz';
import QuizResults from './pages/QuizResults';
import Feedback from './pages/Feedback';
import Certificate from './pages/Certificate';
import Dashboard from './pages/Dashboard';
import Academy from './pages/Academy';
import Events from './pages/Events';
import EventRegister from './pages/EventRegister';
import CircuitGame from './pages/CircuitGame';
import PartMatch from './pages/PartMatch';
import Backdrop3D from './components/ui/Backdrop3D';
import TopicCourse from './pages/TopicCourse';
import Simulator from './pages/Simulator';
import SimDashboard from './pages/SimDashboard';
import Login from './pages/Login';
import Resources from './pages/Resources';
import Profile from './pages/Profile';
import { AuthProvider, useAuth } from './auth/AuthContext';

const Explore3D = lazy(() => import('./pages/Explore3D'));

function AppRoutes() {
  const { user, loading } = useAuth();
  const location = useLocation();
  if (loading) return <div className="auth-loading"><div className="auth-loading-mark">⌁</div><p>Preparing your IoT workspace…</p></div>;
  if (!user && location.pathname !== '/login') return <Navigate to="/login" replace state={{ from: location }} />;
  if (user && location.pathname === '/login') return <Navigate to="/" replace />;

  return (
    <div className="app7">
      {user && <Backdrop3D />}
      {user && <Navbar />}
      <main>
        <Suspense fallback={<p className="p-8 text-center text-slate-300">Loading…</p>}>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/" element={<Home />} />
            <Route path="/explore" element={<Explore3D />} />
            <Route path="/learn" element={<Learn />} />
            <Route path="/resources" element={<Resources />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/lab" element={<Lab />} />
            <Route path="/challenges" element={<Challenges />} />
            <Route path="/quiz" element={<Quiz />} />
            <Route path="/results" element={<QuizResults />} />
            <Route path="/feedback" element={<Feedback />} />
            <Route path="/certificate" element={<Certificate />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/academy" element={<Academy />} />
            <Route path="/academy/:id" element={<TopicCourse />} />
            <Route path="/simulator" element={<Simulator />} />
            <Route path="/simulator/:id" element={<SimDashboard />} />
            <Route path="/events" element={<Events />} />
            <Route path="/events/register" element={<EventRegister />} />
            <Route path="/circuit-game" element={<CircuitGame />} />
            <Route path="/game" element={<PartMatch />} />
            <Route path="*" element={<Home />} />
          </Routes>
        </Suspense>
      </main>
    </div>
  );
}

export default function App() {
  return <AuthProvider><AppRoutes /></AuthProvider>;
}
