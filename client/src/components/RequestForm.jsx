import { useState, useContext } from 'react';
import axios from 'axios';
import API_URL from '../config/api';
import { AuthContext } from '../context/AuthContext';


const RequestForm = ({ onRequestSuccess }) => {
  const { user } = useContext(AuthContext);
  const [formData, setFormData] = useState({
    subject: '',
    description: '',
    materialType: 'other',
    regulationYear: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [message, setMessage] = useState('');


  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setSubmitting(true);


    try {
      const token = localStorage.getItem('token');
      await axios.post(`${API_URL}/api/requests`, formData, {
        headers: { Authorization: `Bearer ${token}` }
      });


      setShowSuccessDialog(true);
      setFormData({ subject: '', description: '', materialType: 'other', regulationYear: '' });


      setTimeout(() => {
        window.location.reload();
      }, 2000);
    } catch (error) {
      setMessage(error.response?.data?.message || '❌ Request submission failed');
      setSubmitting(false);
    }
  };


  return (
    <>
      <div className="bg-gradient-to-br from-orange-50 to-red-50 dark:from-gray-800 dark:to-gray-700 rounded-2xl shadow-lg p-6 border border-orange-200 dark:border-gray-600 transition-all duration-300">
        <h2 className="text-2xl font-bold mb-4 text-orange-900 dark:text-orange-300 flex items-center gap-2">
          Request Material ✋
        </h2>


        {message && (
          <div className="mb-4 px-4 py-3 rounded-lg bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 border border-red-400 dark:border-red-500">
            {message}
          </div>
        )}


        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">
              Subject <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              placeholder="e.g., Machine Learning"
              required
              className="w-full px-4 py-2.5 border-2 border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 transition-colors"
              value={formData.subject}
              onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">📚 Required - What subject do you need?</p>
          </div>


          <div>
            <label className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">
              Regulation Year <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.regulationYear}
              onChange={(e) => setFormData({ ...formData, regulationYear: e.target.value })}
              className="w-full px-4 py-2.5 border-2 border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 dark:bg-gray-700 dark:text-white"
              required
            >
              <option value="">Select Regulation Year</option>
              <option value="2019">2019</option>
              <option value="2023">2023</option>
            </select>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">📅 Required - Which regulation year?</p>
          </div>


          <div>
            <label className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">
              Material Type
            </label>
            <select
              value={formData.materialType}
              onChange={(e) => setFormData({ ...formData, materialType: e.target.value })}
              className="w-full px-4 py-2.5 border-2 border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 dark:bg-gray-700 dark:text-white"
            >
              <option value="other">Other</option>
              <option value="notes">📝 Notes</option>
              <option value="question-paper">📄 Question Paper</option>
              <option value="syllabus">📋 Syllabus</option>
              <option value="reference-book">📚 Reference Book</option>
            </select>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">📄 Optional - Type of material needed</p>
          </div>


          <div>
            <label className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">
              Description <span className="text-gray-400 text-xs">(Optional)</span>
            </label>
            <textarea
              placeholder="e.g., Need notes covering Neural Networks, Deep Learning basics..."
              rows="3"
              className="w-full px-4 py-2.5 border-2 border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 transition-colors resize-none"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">💬 Optional - Add more details about what you need</p>
          </div>


          <div className="bg-blue-50 dark:bg-blue-900/20 border-2 border-blue-300 dark:border-blue-600 rounded-lg p-3">
            <p className="text-sm text-blue-800 dark:text-blue-300 flex items-center gap-2">
              <span className="text-lg">💡</span>
              <span>Your request will be visible to all members who can fulfill it!</span>
            </p>
          </div>


          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white font-bold py-3.5 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 shadow-lg"
          >
            {submitting ? '⏳ Submitting...' : '🙏 Submit Request'}
          </button>
        </form>
      </div>


      {showSuccessDialog && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 max-w-md w-full border-2 border-orange-500 dark:border-orange-400">
            <div className="text-center">
              <div className="text-6xl mb-4">✅</div>
              <h3 className="text-2xl font-bold text-green-600 dark:text-green-400 mb-2">Request Submitted!</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Your material request has been posted successfully
              </p>
              <div className="bg-green-50 dark:bg-green-900/20 border-2 border-green-300 dark:border-green-600 rounded-lg p-4">
                <p className="text-sm text-green-800 dark:text-green-300">
                  🎉 Members can now see and fulfill your request!
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};


export default RequestForm;