'use client';

import { useState, useEffect } from 'react';
import { apiFetch } from '@/utils/api';

interface User {
  id: string;
  name: string;
  email: string;
  has_paid: boolean;
  is_first_login: boolean;
  isLocked?: boolean;
  status?: string;
  createdAt: string;
  lastLogin?: string;
}

interface Pagination {
  page: number;
  size: number;
  total: number;
  totalPages: number;
}

const AdminMiniPanel = () => {
  const [searchEmail, setSearchEmail] = useState('');
  const [searchedUser, setSearchedUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [loading, setLoading] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [managing, setManaging] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [viewMode, setViewMode] = useState<'search' | 'list'>('search');
  const [portfolioPreview, setPortfolioPreview] = useState<any>(null);

  const pageSize = 5;

  const loadUsers = async (page: number = 1) => {
    setLoading(true);
    try {
      const data = await apiFetch(`/admin/dashboard?page=${page}&size=${pageSize}`);
      setUsers(data.users);
      setPagination(data.pagination);
    } catch (error) {
      console.error('Load users error:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (viewMode === 'list') {
      loadUsers(currentPage);
    }
  }, [viewMode, currentPage]);

  const handleSearch = async () => {
    if (!searchEmail.trim()) return;

    setLoading(true);
    try {
      const data = await apiFetch(`/admin/search-user?email=${encodeURIComponent(searchEmail)}`);
      setSearchedUser(data.user);
      setPortfolioPreview(null);
    } catch (error) {
      console.error('Search error:', error);
      alert('User not found or access denied');
      setSearchedUser(null);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmPayment = async (userId: string) => {
    setConfirming(true);
    try {
      await apiFetch(`/admin/confirm-payment/${userId}`, {
        method: 'PUT',
      });
      alert('Payment confirmed successfully!');
      // Refresh data
      if (viewMode === 'list') {
        loadUsers(currentPage);
      } else if (searchedUser) {
        setSearchedUser({ ...searchedUser, has_paid: true });
      }
    } catch (error) {
      console.error('Confirm error:', error);
      alert('Error confirming payment');
    } finally {
      setConfirming(false);
    }
  };

  const handleUserManagement = async (userId: string, action: string) => {
    setManaging(userId);
    try {
      await apiFetch(`/admin/user-management/${userId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      });
      alert(`${action} successful!`);
      // Refresh data
      if (viewMode === 'list') {
        loadUsers(currentPage);
      } else if (searchedUser) {
        handleSearch(); // Refresh searched user
      }
    } catch (error) {
      console.error('Management error:', error);
      alert(`Error performing ${action}`);
    } finally {
      setManaging(null);
    }
  };

  const handlePortfolioPreview = async (userId: string) => {
    try {
      const data = await apiFetch(`/admin/portfolio-preview/${userId}`);
      setPortfolioPreview(data);
    } catch (error) {
      console.error('Preview error:', error);
      alert('Error loading portfolio preview');
    }
  };

  return (
    <div className="bg-gray-100 p-4 rounded-lg mb-6">
      <h3 className="text-lg font-semibold mb-4">Admin Panel</h3>

      <div className="flex gap-2 mb-4">
        <button
          onClick={() => setViewMode('search')}
          className={`px-4 py-2 rounded ${viewMode === 'search' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
        >
          Search User
        </button>
        <button
          onClick={() => setViewMode('list')}
          className={`px-4 py-2 rounded ${viewMode === 'list' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
        >
          User List
        </button>
      </div>

      {viewMode === 'search' && (
        <>
          <div className="flex gap-2 mb-4">
            <input
              type="email"
              placeholder="Enter user email to search"
              value={searchEmail}
              onChange={(e) => setSearchEmail(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              className="flex-1 px-3 py-2 border rounded"
            />
            <button
              onClick={handleSearch}
              disabled={loading}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
            >
              {loading ? 'Searching...' : 'Search'}
            </button>
          </div>

          {searchedUser && (
            <UserCard
              user={searchedUser}
              onConfirmPayment={handleConfirmPayment}
              onUserManagement={handleUserManagement}
              onPortfolioPreview={handlePortfolioPreview}
              confirming={confirming}
              managing={managing}
            />
          )}
        </>
      )}

      {viewMode === 'list' && (
        <>
          <div className="mb-4">
            {pagination && (
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-gray-600">
                  Page {pagination.page} of {pagination.totalPages} ({pagination.total} total users)
                </span>
                <div className="flex gap-2">
                  <button
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1 || loading}
                    className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => setCurrentPage(Math.min(pagination.totalPages, currentPage + 1))}
                    disabled={currentPage === pagination.totalPages || loading}
                    className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>

          {loading ? (
            <div className="text-center py-4">Loading...</div>
          ) : (
            <div className="space-y-2">
              {users.map((user) => (
                <UserCard
                  key={user.id}
                  user={user}
                  onConfirmPayment={handleConfirmPayment}
                  onUserManagement={handleUserManagement}
                  onPortfolioPreview={handlePortfolioPreview}
                  confirming={confirming}
                  managing={managing}
                />
              ))}
            </div>
          )}
        </>
      )}

      {portfolioPreview && (
        <div className="mt-4 bg-white p-4 rounded border">
          <h4 className="font-semibold mb-2">Portfolio Preview - {portfolioPreview.user.username}</h4>
          {portfolioPreview.portfolio ? (
            <div className="text-sm">
              <p><strong>Title:</strong> {portfolioPreview.portfolio.displayName || 'Not set'}</p>
              <p><strong>Bio:</strong> {portfolioPreview.portfolio.bio || 'Not set'}</p>
              <p><strong>Theme:</strong> {portfolioPreview.portfolio.theme || 'light'}</p>
              <p><strong>Published:</strong> {portfolioPreview.portfolio.isPublished ? 'Yes' : 'No'}</p>
              <p><strong>Projects:</strong> {portfolioPreview.portfolio.projects?.length || 0}</p>
              <p><strong>Skills:</strong> {portfolioPreview.portfolio.skills?.length || 0}</p>
            </div>
          ) : (
            <p className="text-gray-500">No portfolio data available</p>
          )}
          <button
            onClick={() => setPortfolioPreview(null)}
            className="mt-2 px-3 py-1 bg-gray-500 text-white rounded text-sm"
          >
            Close Preview
          </button>
        </div>
      )}
    </div>
  );
};

const UserCard = ({
  user,
  onConfirmPayment,
  onUserManagement,
  onPortfolioPreview,
  confirming,
  managing
}: {
  user: User;
  onConfirmPayment: (userId: string) => void;
  onUserManagement: (userId: string, action: string) => void;
  onPortfolioPreview: (userId: string) => void;
  confirming: boolean;
  managing: string | null;
}) => (
  <div className="bg-white p-4 rounded border">
    <h4 className="font-semibold">{user.name}</h4>
    <p><strong>Email:</strong> {user.email}</p>
    <p><strong>Status:</strong> {user.status || 'active'} {user.isLocked && '(Locked)'}</p>
    <p><strong>Has Paid:</strong> {user.has_paid ? 'Yes' : 'No'}</p>
    <p><strong>First Login:</strong> {user.is_first_login ? 'Yes' : 'No'}</p>
    <p><strong>Created:</strong> {new Date(user.createdAt).toLocaleDateString()}</p>
    {user.lastLogin && <p><strong>Last Login:</strong> {new Date(user.lastLogin).toLocaleDateString()}</p>}

    <div className="flex gap-2 mt-2 flex-wrap">
      {!user.has_paid && (
        <button
          className="px-3 py-1 bg-green-500 text-white rounded text-sm hover:bg-green-600 disabled:opacity-50"
          onClick={() => onConfirmPayment(user.id)}
          disabled={confirming}
        >
          {confirming ? 'Confirming...' : 'Confirm Payment'}
        </button>
      )}

      <button
        className="px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600"
        onClick={() => onPortfolioPreview(user.id)}
      >
        Preview Portfolio
      </button>

      {user.isLocked ? (
        <button
          className="px-3 py-1 bg-yellow-500 text-white rounded text-sm hover:bg-yellow-600 disabled:opacity-50"
          onClick={() => onUserManagement(user.id, 'reactivate')}
          disabled={managing === user.id}
        >
          {managing === user.id ? 'Processing...' : 'Reactivate'}
        </button>
      ) : (
        <button
          className="px-3 py-1 bg-red-500 text-white rounded text-sm hover:bg-red-600 disabled:opacity-50"
          onClick={() => onUserManagement(user.id, 'disable')}
          disabled={managing === user.id}
        >
          {managing === user.id ? 'Processing...' : 'Disable'}
        </button>
      )}
    </div>
  </div>
);

export default AdminMiniPanel;