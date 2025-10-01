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
    <nav className="bg-white shadow-lg border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link
            to="/"
            className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent hover:from-blue-700 hover:to-blue-900 transition-all"
          >
            Polling System
          </Link>

          <div className="flex items-center space-x-6">
            <Link
              to="/"
              className="text-slate-700 hover:text-blue-600 font-medium transition-colors"
            >
              {isAdmin ? 'Dashboard' : 'Polls'}
            </Link>

            <div className="flex items-center space-x-4 border-l border-slate-300 pl-6">
              <div className="text-sm">
                <span className="font-semibold text-slate-900">{user.username}</span>
                <span className="ml-2 px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-700 font-medium">
                  {user.role}
                </span>
              </div>
              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-800 transition-colors font-medium text-sm"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
