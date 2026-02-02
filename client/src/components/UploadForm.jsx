import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import API_URL from '../config/api';
import { AuthContext } from '../context/AuthContext';


const UploadForm = ({ onUploadSuccess, linkedRequest }) => {
  const { user } = useContext(AuthContext);
  const [formData, setFormData] = useState({ 
    title: '', 
    subject: '',
    description: '',
    source: 'others',
    materialType: 'other',
    regulationYear: ''
  });
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [showProgressModal, setShowProgressModal] = useState(false);
  const [uploadStatus, setUploadStatus] = useState('');
  const [message, setMessage] = useState('');
  const [uploadedMaterial, setUploadedMaterial] = useState(null);


  const isAdmin = user && ['admin', 'master'].includes(user.role);


  useEffect(() => {
    if (linkedRequest) {
      setFormData({
        ...formData,
        subject: linkedRequest.subject,
        description: linkedRequest.description,
        materialType: linkedRequest.materialType || 'other',
        regulationYear: linkedRequest.regulationYear || ''
      });
    }
  }, [linkedRequest]);


  const validateFile = (file) => {
    const allowedExtensions = ['pdf', 'png', 'jpg', 'jpeg', 'ppt', 'pptx'];
    const maxSize = 50 * 1024 * 1024;
    
    const fileName = file.name.toLowerCase();
    const fileExtension = fileName.split('.').pop();
    
    if (!allowedExtensions.includes(fileExtension)) {
      return {
        valid: false,
        message: '❌ Invalid file type! Only PDF, PNG, JPG, JPEG, PPT, and PPTX files are allowed.'
      };
    }
    
    if (file.size > maxSize) {
      return {
        valid: false,
        message: '❌ File size too large! Maximum size is 50MB.'
      };
    }
    
    return { valid: true };
  };


  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      setMessage('❌ Please select a file to upload');
      return;
    }


    const validation = validateFile(file);
    if (!validation.valid) {
      setMessage(validation.message);
      return;
    }


    const token = localStorage.getItem('token');
    const data = new FormData();
    data.append('title', formData.title);
    data.append('subject', formData.subject);
    data.append('description', formData.description);
    data.append('source', formData.source);
    data.append('regulationYear', formData.regulationYear);
    data.append('materialType', formData.materialType);
    data.append('material', file);
    
    if (linkedRequest) {
      data.append('linkedRequest', linkedRequest._id);
    }


    setUploading(true);
    setUploadProgress(0);
    setShowProgressModal(true);
    setUploadStatus('uploading');
    setMessage('');


    try {
      const response = await axios.post(`${API_URL}/api/materials/upload`, data, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setUploadProgress(percentCompleted);
        }
      });
      
      setUploadedMaterial(response.data);
      setUploadStatus('success');
      setFormData({ title: '', subject: '', description: '', source: 'others', regulationYear: '', materialType: 'other' });
      setFile(null);
      document.getElementById('fileInput').value = '';
      
      setTimeout(() => {
        window.location.reload();
      }, 3000);
    } catch (err) {
      console.error('Upload error:', err);
      setUploadStatus('error');
      const errorMessage = err.response?.data?.message || err.message || '❌ Upload failed';
      setMessage(errorMessage);
    } finally {
      setUploading(false);
    }
  };


  const closeModal = () => {
    if (!uploading) {
      setShowProgressModal(false);
      setUploadProgress(0);
      setUploadStatus('');
      setUploadedMaterial(null);
    }
  };


  return (
    <>
      <div className="bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-gray-800 dark:to-gray-700 rounded-2xl shadow-lg p-6 border border-indigo-200 dark:border-gray-600 transition-all duration-300">
        <h2 className="text-2xl font-bold mb-4 text-indigo-900 dark:text-indigo-300 flex items-center gap-2">
          Upload Material 📤
        </h2>


        {linkedRequest && (
          <div className="mb-4 p-4 bg-orange-100 dark:bg-orange-900/30 border-2 border-orange-400 dark:border-orange-600 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-2xl">🤝</span>
              <h3 className="font-bold text-orange-900 dark:text-orange-300">Fulfilling Request</h3>
            </div>
            <p className="text-sm text-orange-800 dark:text-orange-200">
              <span className="font-semibold">Request:</span> {linkedRequest.subject}
            </p>
            <p className="text-xs text-orange-700 dark:text-orange-300 mt-1">
              By {linkedRequest.requestedBy?.username}
            </p>
          </div>
        )}


        {isAdmin && (
          <div className="mb-4 p-3 bg-green-100 dark:bg-green-900/30 border-2 border-green-400 dark:border-green-600 rounded-lg">
            <p className="text-sm text-green-800 dark:text-green-300 flex items-center gap-2">
              <span className="text-lg">✅</span>
              <span className="font-semibold">Admin Privilege: Your uploads will be auto-approved</span>
            </p>
          </div>
        )}


        {message && (
          <div className={`mb-4 px-4 py-3 rounded-lg ${
            message.includes('successful') 
              ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 border border-green-400 dark:border-green-500' 
              : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 border border-red-400 dark:border-red-500'
          }`}>
            {message}
          </div>
        )}


        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">
              Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              placeholder="e.g., DSP Unit 3 Notes"
              required
              className="w-full px-4 py-2.5 border-2 border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 transition-colors"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">📝 Required - Give your material a clear title</p>
          </div>


          <div>
            <label className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">
              Subject <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              placeholder="e.g., Digital Signal Processing"
              required
              className="w-full px-4 py-2.5 border-2 border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 transition-colors"
              value={formData.subject}
              onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">📚 Required - Specify the subject area</p>
          </div>


          <div>
            <label className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">
              Regulation Year <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.regulationYear}
              onChange={(e) => setFormData({ ...formData, regulationYear: e.target.value })}
              className="w-full px-4 py-2.5 border-2 border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
              required
            >
              <option value="">Select Regulation Year</option>
              <option value="2019">2019</option>
              <option value="2023">2023</option>
            </select>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">📅 Required - Select regulation year</p>
          </div>


          <div>
            <label className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">
              Description <span className="text-gray-400 text-xs">(Optional)</span>
            </label>
            <textarea
              placeholder="e.g., Complete notes covering Fourier Transform, Z-Transform, and Digital Filters with solved examples..."
              rows="3"
              className="w-full px-4 py-2.5 border-2 border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 transition-colors resize-none"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">💬 Optional - Add details about the content</p>
          </div>


          <div>
            <label className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">
              Source <span className="text-red-500">*</span>
            </label>
            <div className="flex flex-wrap gap-4">
              <label className="flex items-center gap-2 cursor-pointer bg-white dark:bg-gray-700 px-4 py-2 rounded-lg border-2 border-gray-300 dark:border-gray-600 hover:border-indigo-500 transition-all">
                <input
                  type="radio"
                  name="source"
                  value="internet"
                  checked={formData.source === 'internet'}
                  onChange={(e) => setFormData({ ...formData, source: e.target.value })}
                  className="w-4 h-4 text-indigo-600 focus:ring-indigo-500"
                  required
                />
                <span className="text-gray-700 dark:text-gray-300 font-medium">🌐 Internet</span>
              </label>
              
              <label className="flex items-center gap-2 cursor-pointer bg-white dark:bg-gray-700 px-4 py-2 rounded-lg border-2 border-gray-300 dark:border-gray-600 hover:border-indigo-500 transition-all">
                <input
                  type="radio"
                  name="source"
                  value="written"
                  checked={formData.source === 'written'}
                  onChange={(e) => setFormData({ ...formData, source: e.target.value })}
                  className="w-4 h-4 text-indigo-600 focus:ring-indigo-500"
                  required
                />
                <span className="text-gray-700 dark:text-gray-300 font-medium">✍️ Written Material</span>
              </label>
              
              <label className="flex items-center gap-2 cursor-pointer bg-white dark:bg-gray-700 px-4 py-2 rounded-lg border-2 border-gray-300 dark:border-gray-600 hover:border-indigo-500 transition-all">
                <input
                  type="radio"
                  name="source"
                  value="others"
                  checked={formData.source === 'others'}
                  onChange={(e) => setFormData({ ...formData, source: e.target.value })}
                  className="w-4 h-4 text-indigo-600 focus:ring-indigo-500"
                  required
                />
                <span className="text-gray-700 dark:text-gray-300 font-medium">📦 Others</span>
              </label>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">📍 Required - Select where this material came from</p>
          </div>


          <div>
            <label className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">
              Material Type
            </label>
            <select
              value={formData.materialType}
              onChange={(e) => setFormData({ ...formData, materialType: e.target.value })}
              className="w-full px-4 py-2.5 border-2 border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
            >
              <option value="other">Other</option>
              <option value="notes">📝 Notes</option>
              <option value="question-paper">📄 Question Paper</option>
              <option value="syllabus">📋 Syllabus</option>
              <option value="reference-book">📚 Reference Book</option>
            </select>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">📄 Optional - Type of material</p>
          </div>


          <div>
            <label className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">
              Material File <span className="text-red-500">*</span>
            </label>
            <input
              id="fileInput"
              type="file"
              accept=".pdf,.png,.jpg,.jpeg,.ppt,.pptx"
              required
              className="w-full px-4 py-2.5 border-2 border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white 
              file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-indigo-600 file:text-white file:font-semibold file:cursor-pointer hover:file:bg-indigo-700 transition-colors"
              onChange={(e) => setFile(e.target.files[0])}
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">📄 Required - PDF, PNG, JPG, JPEG, PPT, or PPTX (Max 50MB)</p>
          </div>


          <div className="bg-yellow-50 dark:bg-yellow-900/20 border-2 border-yellow-300 dark:border-yellow-600 rounded-lg p-3">
            <p className="text-sm text-yellow-800 dark:text-yellow-300 flex items-center gap-2">
              <span className="text-lg">⚠️</span>
              <span>Fields marked with <span className="text-red-500 font-bold">*</span> are required</span>
            </p>
          </div>


          <button
            type="submit"
            disabled={uploading}
            className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold py-3.5 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 shadow-lg"
          >
            {uploading ? '⏳ Uploading...' : linkedRequest ? '🤝 Upload & Fulfill Request' : '🚀 Upload Material'}
          </button>
        </form>
      </div>


      {showProgressModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 max-w-md w-full border-2 border-indigo-500 dark:border-indigo-400">
            <div className="text-center">
              {uploadStatus === 'uploading' && (
                <>
                  <div className="text-6xl mb-4 animate-bounce">📤</div>
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Uploading...</h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-6">Please wait while we upload your material</p>
                  
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-6 mb-4 overflow-hidden">
                    <div 
                      className="bg-gradient-to-r from-indigo-600 to-purple-600 h-6 rounded-full transition-all duration-300 flex items-center justify-center text-white text-sm font-bold"
                      style={{ width: `${uploadProgress}%` }}
                    >
                      {uploadProgress}%
                    </div>
                  </div>
                  
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {uploadProgress < 50 ? 'Starting upload...' : uploadProgress < 100 ? 'Almost there...' : 'Processing...'}
                  </p>
                </>
              )}


              {uploadStatus === 'success' && uploadedMaterial && (
                <>
                  <div className="text-6xl mb-4 animate-pulse">✅</div>
                  <h3 className="text-2xl font-bold text-green-600 dark:text-green-400 mb-2">Upload Successful!</h3>
                  <p className="text-gray-800 dark:text-gray-200 font-semibold mb-2">{uploadedMaterial.title}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                    Status: <span className={`font-bold ${
                      uploadedMaterial.verificationStatus === 'approved' 
                        ? 'text-green-600 dark:text-green-400' 
                        : 'text-yellow-600 dark:text-yellow-400'
                    }`}>
                      {uploadedMaterial.verificationStatus.toUpperCase()}
                    </span>
                  </p>
                  
                  {uploadedMaterial.verificationStatus === 'approved' ? (
                    <div className="bg-green-50 dark:bg-green-900/20 border-2 border-green-300 dark:border-green-600 rounded-lg p-4">
                      <p className="text-sm text-green-800 dark:text-green-300">
                        ✨ Your material is now live and visible to everyone! 🚀
                      </p>
                    </div>
                  ) : (
                    <div className="bg-yellow-50 dark:bg-yellow-900/20 border-2 border-yellow-300 dark:border-yellow-600 rounded-lg p-4">
                      <p className="text-sm text-yellow-800 dark:text-yellow-300">
                        ⏳ Your material is pending admin approval. You'll be notified once reviewed!
                      </p>
                    </div>
                  )}
                </>
              )}


              {uploadStatus === 'error' && (
                <>
                  <div className="text-6xl mb-4">❌</div>
                  <h3 className="text-2xl font-bold text-red-600 dark:text-red-400 mb-2">Upload Failed!</h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">{message}</p>
                  <button
                    onClick={closeModal}
                    className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-semibold"
                  >
                    Close
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};


export default UploadForm;