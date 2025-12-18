"use client";

import { useState, useEffect } from "react";
import { Search, CheckCircle, XCircle, UserCheck, Users } from "lucide-react";

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  has_paid: boolean;
  createdAt: string;
  onboarded: boolean;
  affiliate?: {
    availableBalance: number;
    totalEarned: number;
  };
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await fetch("/api/admin/users");
      if (response.ok) {
        const data = await response.json();
        setUsers(data.users);
      }
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (email: string) => {
    setSearch(email);
    if (email.trim()) {
      const found = users.find(u => u.email.toLowerCase().includes(email.toLowerCase()));
      setSelectedUser(found || null);
    } else {
      setSelectedUser(null);
    }
  };

  const handleApprovePayment = async (userId: string) => {
    try {
      const response = await fetch("/api/admin/payments/unpaid", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId }),
      });

      if (response.ok) {
        alert("User payment approved successfully!");
        fetchUsers(); // Refresh the list
        if (selectedUser?.id === userId) {
          setSelectedUser({ ...selectedUser, has_paid: true });
        }
      } else {
        const error = await response.json();
        alert(error.error || "Failed to approve payment");
      }
    } catch (error) {
      console.error("Error approving payment:", error);
      alert("Failed to approve payment");
    }
  };

  const displayUsers = selectedUser ? [selectedUser] : users.filter(u =>
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-10">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">All Users</h1>
        <p className="text-gray-600 mt-1">Manage all users in the system</p>
      </div>

      {/* Search */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="email"
            placeholder="Search by email..."
            value={search}
            onChange={(e) => handleSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        {selectedUser && (
          <div className="mt-4 p-4 bg-blue-50 rounded-lg">
            <h3 className="font-semibold text-blue-900">User Found:</h3>
            <div className="mt-2 grid grid-cols-2 gap-4 text-sm">
              <div><strong>Name:</strong> {selectedUser.name}</div>
              <div><strong>Email:</strong> {selectedUser.email}</div>
              <div><strong>Role:</strong> {selectedUser.role}</div>
              <div><strong>Status:</strong>
                {selectedUser.has_paid ? (
                  <span className="inline-flex items-center ml-2 px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Paid
                  </span>
                ) : (
                  <span className="inline-flex items-center ml-2 px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">
                    <XCircle className="w-3 h-3 mr-1" />
                    Unpaid
                  </span>
                )}
              </div>
              <div><strong>Registered:</strong> {new Date(selectedUser.createdAt).toLocaleDateString()}</div>
              <div><strong>Onboarded:</strong> {selectedUser.onboarded ? "Yes" : "No"}</div>
            </div>
            {!selectedUser.has_paid && selectedUser.role === "client" && (
              <button
                onClick={() => handleApprovePayment(selectedUser.id)}
                className="mt-4 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                Approve Payment
              </button>
            )}
          </div>
        )}
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-2xl shadow-sm border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Role
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Registration Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {displayUsers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                    No users found
                  </td>
                </tr>
              ) : (
                displayUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {user.name}
                        </div>
                        <div className="text-sm text-gray-500">
                          {user.email}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {user.role === "affiliate" ? (
                          <UserCheck className="w-4 h-4 text-green-600 mr-2" />
                        ) : (
                          <Users className="w-4 h-4 text-blue-600 mr-2" />
                        )}
                        <span className="text-sm text-gray-900 capitalize">
                          {user.role}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {user.has_paid ? (
                        <span className="inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Paid
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">
                          <XCircle className="w-3 h-3 mr-1" />
                          Unpaid
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {new Date(user.createdAt).toLocaleDateString()}
                      </div>
                      <div className="text-sm text-gray-500">
                        {new Date(user.createdAt).toLocaleTimeString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      {!user.has_paid && user.role === "client" && (
                        <button
                          onClick={() => handleApprovePayment(user.id)}
                          className="text-green-600 hover:text-green-900"
                        >
                          Approve Payment
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}