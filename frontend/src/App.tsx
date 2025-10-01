import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Register from './pages/Register';
import AdminDashboard from './pages/AdminDashboard';
import UserPolls from './pages/UserPolls';
import './App.css';

function AppRoutes() {
  const { user, isAdmin, isLoading } = useAuth();

  if (isLoading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <>
      <Navbar />
      <Routes>
        <Route
          path="/login"
          element={user ? <Navigate to="/" /> : <Login />}
        />
        <Route
          path="/register"
          element={user ? <Navigate to="/" /> : <Register />}
        />
        <Route
          path="/"
          element={
            <ProtectedRoute>
              {isAdmin ? <AdminDashboard /> : <UserPolls />}
            </ProtectedRoute>
          }
        />
      </Routes>
    </>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </Router>
  );
}

export default App;
