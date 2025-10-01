import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  if (!user) return null;

  return (
    <nav className="navbar">
      <div className="nav-container">
        <Link to="/" className="nav-brand">
          Polling System
        </Link>

        <div className="nav-links">
          <Link to="/" className="nav-link">
            {isAdmin ? 'Dashboard' : 'Polls'}
          </Link>

          <div className="nav-user">
            <span className="user-info">
              {user.username} ({user.role})
            </span>
            <button className="btn btn-secondary btn-sm" onClick={handleLogout}>
              Logout
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
