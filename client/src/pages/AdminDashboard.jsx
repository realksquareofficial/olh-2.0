import { useState, useEffect } from 'react';
import axiosInstance from '../utils/axios';
import { useNavigate } from 'react-router-dom';

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalMaterials: 0,
    pendingMaterials: 0,
    reportedMaterials: 0
  });
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchStats();
    fetchUsers();
  }, []);

  const fetchStats = async () => {
    try {
      const res = await axiosInstance.get('/api/admin/stats');
      setStats(res.data);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const res = await axiosInstance.get('/api/users/all');
      setUsers(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleReject = async (materialId) => {
    const reason = prompt('Enter rejection reason (optional):');
    try {
      await axiosInstance.patch(
        `/api/materials/${materialId}/reject`,
        { reason }
      );
      fetchPendingMaterials();
    } catch (error) {
      console.error(error);
    }
  };

  const handleRoleChange = async (userId, newRole) => {
    try {
      await axiosInstance.patch(`/api/users/${userId}/role`, 
        { role: newRole }
      );
      alert('Role updated! ✅');
      fetchUsers();
    } catch (err) {
      console.error(err);
      alert('Failed to update role!');
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Delete this user permanently?')) return;

    try {
      await axiosInstance.delete(`/api/users/${userId}`);
      alert('User deleted! ✅');
      fetchUsers();
    } catch (err) {
      console.error(err);
      alert('Failed to delete user!');
    }
  };

  if (loading) {
    return <div className="text-center text-2xl mt-20">Loading...</div>;
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      <h1 className="text-4xl font-bold mb-8 text-indigo-600 dark:text-indigo-400">⚙️ Admin Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white p-6 rounded-xl shadow-lg">
          <div className="text-3xl mb-2">👥</div>
          <div className="text-4xl font-bold">{stats.totalUsers}</div>
          <div className="text-blue-100">Total Users</div>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-green-600 text-white p-6 rounded-xl shadow-lg">
          <div className="text-3xl mb-2">📚</div>
          <div className="text-4xl font-bold">{stats.totalMaterials}</div>
          <div className="text-green-100">Total Materials</div>
        </div>

        <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 text-white p-6 rounded-xl shadow-lg cursor-pointer hover:scale-105 transition-transform" onClick={() => navigate('/')}>
          <div className="text-3xl mb-2">⏳</div>
          <div className="text-4xl font-bold">{stats.pendingMaterials}</div>
          <div className="text-yellow-100">Pending Approvals</div>
        </div>

        <div className="bg-gradient-to-br from-red-500 to-red-600 text-white p-6 rounded-xl shadow-lg cursor-pointer hover:scale-105 transition-transform" onClick={() => navigate('/')}>
          <div className="text-3xl mb-2">🚩</div>
          <div className="text-4xl font-bold">{stats.reportedMaterials}</div>
          <div className="text-red-100">Reported Materials</div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
        <h2 className="text-2xl font-bold mb-6 text-gray-800 dark:text-white">👥 User Management</h2>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b-2 border-gray-300 dark:border-gray-600">
                <th className="text-left p-3 text-gray-700 dark:text-gray-300">Username</th>
                <th className="text-left p-3 text-gray-700 dark:text-gray-300">Email</th>
                <th className="text-left p-3 text-gray-700 dark:text-gray-300">Role</th>
                <th className="text-left p-3 text-gray-700 dark:text-gray-300">Joined</th>
                <th className="text-center p-3 text-gray-700 dark:text-gray-300">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user._id} className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="p-3 font-semibold text-gray-900 dark:text-white">{user.username}</td>
                  <td className="p-3 text-gray-600 dark:text-gray-400">{user.email}</td>
                  <td className="p-3">
                    <select
                      value={user.role}
                      onChange={(e) => handleRoleChange(user._id, e.target.value)}
                      className="bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded px-3 py-1 text-gray-900 dark:text-white"
                    >
                      <option value="user">User</option>
                      <option value="admin">Admin</option>
                      <option value="master">Master</option>
                    </select>
                  </td>
                  <td className="p-3 text-gray-600 dark:text-gray-400">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </td>
                  <td className="p-3 text-center">
                    <button
                      onClick={() => handleDeleteUser(user._id)}
                      className="bg-red-500 hover:bg-red-600 text-white px-4 py-1 rounded transition-colors"
                    >
                      🗑️ Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;