import { useState, useEffect, useContext } from 'react';
import axiosInstance from '../utils/axios';
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
        message: 'Invalid file type! Only PDF, PNG, JPG, JPEG, PPT, and PPTX allowed.'
      };
    }

    if (file.size > maxSize) {
      return {
        valid: false,
        message: 'File too large! Maximum size is 50MB.'
      };
    }

    return { valid: true };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      setMessage('Please select a file to upload');
      return;
    }

    const validation = validateFile(file);
    if (!validation.valid) {
      setMessage(validation.message);
      return;
    }

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
      const response = await axiosInstance.post('/api/materials/upload', data, {
        headers: { 
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
      const errorMessage = err.response?.data?.message || err.message || 'Upload failed';
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
      <div className="bg-white dark:bg-gray-800 rounded-tl-3xl rounded-br-3xl border-2 border-sky-300 dark:border-sky-700 p-8">
        <h2 className="text-3xl font-black mb-6 text-gray-900 dark:text-white flex items-center gap-3 border-b-4 border-sky-600 dark:border-sky-400 pb-4">
          <span>📤</span>
          Upload Material
        </h2>

        {linkedRequest && (
          <div className="mb-6 p-5 bg-orange-50 dark:bg-orange-950 border-l-4 border-orange-500">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-2xl">🤝</span>
              <h3 className="font-black text-orange-900 dark:text-orange-300 text-lg">Fulfilling Request</h3>
            </div>
            <p className="text-sm text-orange-800 dark:text-orange-200 mb-1">
              <span className="font-bold">Requested by:</span> {linkedRequest.requestedBy?.username}
            </p>
            <p className="text-sm text-orange-800 dark:text-orange-200">
              <span className="font-bold">Details:</span> {linkedRequest.description || 'No additional details'}
            </p>
          </div>
        )}

        {isAdmin && (
          <div className="mb-6 p-4 bg-emerald-50 dark:bg-emerald-950 border-l-4 border-emerald-500">
            <p className="text-sm text-emerald-800 dark:text-emerald-300 flex items-center gap-2 font-bold">
              <span className="text-lg">✅</span>
              Admin privilege: Your uploads are auto-approved
            </p>
          </div>
        )}

        {message && (
          <div className={`mb-6 px-5 py-4 border-l-4 font-semibold ${
            message.includes('successful') 
              ? 'bg-emerald-50 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border-emerald-500' 
              : 'bg-red-50 dark:bg-red-950 text-red-800 dark:text-red-300 border-red-500'
          }`}>
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-bold mb-2 text-gray-900 dark:text-white uppercase tracking-wide">
              Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              placeholder="e.g., DSP Unit 3 Notes"
              required
              className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:border-sky-600 dark:focus:border-sky-400 transition-colors"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-sm font-bold mb-2 text-gray-900 dark:text-white uppercase tracking-wide">
              Subject <span className="text-red-500">*</span>
              {linkedRequest && <span className="text-xs text-orange-600 dark:text-orange-400 ml-2 normal-case">(Locked from request)</span>}
            </label>
            <input
              type="text"
              placeholder="e.g., Digital Signal Processing"
              required
              disabled={!!linkedRequest}
              className={`w-full px-4 py-3 border-2 text-gray-900 dark:text-white focus:outline-none transition-colors ${
                linkedRequest 
                  ? 'border-orange-300 dark:border-orange-700 bg-orange-50 dark:bg-orange-950 cursor-not-allowed' 
                  : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 focus:border-sky-600 dark:focus:border-sky-400'
              }`}
              value={formData.subject}
              onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-sm font-bold mb-2 text-gray-900 dark:text-white uppercase tracking-wide">
              Regulation Year <span className="text-red-500">*</span>
              {linkedRequest && <span className="text-xs text-orange-600 dark:text-orange-400 ml-2 normal-case">(Locked from request)</span>}
            </label>
            <select
              value={formData.regulationYear}
              onChange={(e) => setFormData({ ...formData, regulationYear: e.target.value })}
              disabled={!!linkedRequest}
              className={`w-full px-4 py-3 border-2 text-gray-900 dark:text-white focus:outline-none transition-colors ${
                linkedRequest 
                  ? 'border-orange-300 dark:border-orange-700 bg-orange-50 dark:bg-orange-950 cursor-not-allowed' 
                  : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 focus:border-sky-600 dark:focus:border-sky-400'
              }`}
              required
            >
              <option value="">Select Regulation Year</option>
              <option value="2019">2019</option>
              <option value="2023">2023</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-bold mb-2 text-gray-900 dark:text-white uppercase tracking-wide">
              Material Type
            </label>
            <select
              value={formData.materialType}
              onChange={(e) => setFormData({ ...formData, materialType: e.target.value })}
              className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:border-sky-600 dark:focus:border-sky-400"
            >
              <option value="other">Other</option>
              <option value="notes">Notes</option>
              <option value="question-paper">Question Paper</option>
              <option value="syllabus">Syllabus</option>
              <option value="reference-book">Reference Book</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-bold mb-3 text-gray-900 dark:text-white uppercase tracking-wide">
              Source <span className="text-red-500">*</span>
            </label>
            <div className="flex flex-wrap gap-3">
              <label className="flex items-center gap-2 cursor-pointer bg-white dark:bg-gray-900 px-5 py-3 border-2 border-gray-300 dark:border-gray-600 hover:border-sky-600 dark:hover:border-sky-400 transition-all">
                <input
                  type="radio"
                  name="source"
                  value="internet"
                  checked={formData.source === 'internet'}
                  onChange={(e) => setFormData({ ...formData, source: e.target.value })}
                  className="w-4 h-4 text-sky-600 focus:ring-sky-500"
                  required
                />
                <span className="text-gray-900 dark:text-white font-bold text-sm">🌐 Internet</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer bg-white dark:bg-gray-900 px-5 py-3 border-2 border-gray-300 dark:border-gray-600 hover:border-sky-600 dark:hover:border-sky-400 transition-all">
                <input
                  type="radio"
                  name="source"
                  value="written"
                  checked={formData.source === 'written'}
                  onChange={(e) => setFormData({ ...formData, source: e.target.value })}
                  className="w-4 h-4 text-sky-600 focus:ring-sky-500"
                  required
                />
                <span className="text-gray-900 dark:text-white font-bold text-sm">✍️ Written</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer bg-white dark:bg-gray-900 px-5 py-3 border-2 border-gray-300 dark:border-gray-600 hover:border-sky-600 dark:hover:border-sky-400 transition-all">
                <input
                  type="radio"
                  name="source"
                  value="others"
                  checked={formData.source === 'others'}
                  onChange={(e) => setFormData({ ...formData, source: e.target.value })}
                  className="w-4 h-4 text-sky-600 focus:ring-sky-500"
                  required
                />
                <span className="text-gray-900 dark:text-white font-bold text-sm">📦 Others</span>
              </label>
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold mb-2 text-gray-900 dark:text-white uppercase tracking-wide">
              Description <span className="text-gray-500 text-xs normal-case">(Optional)</span>
            </label>
            <textarea
              placeholder="Add details about the material..."
              rows="3"
              className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:border-sky-600 dark:focus:border-sky-400 transition-colors resize-none"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-sm font-bold mb-2 text-gray-900 dark:text-white uppercase tracking-wide">
              File <span className="text-red-500">*</span>
            </label>
            <input
              id="fileInput"
              type="file"
              accept=".pdf,.png,.jpg,.jpeg,.ppt,.pptx"
              required
              className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:border-sky-600 dark:focus:border-sky-400 file:mr-4 file:py-2 file:px-4 file:border-0 file:bg-sky-600 dark:file:bg-sky-500 file:text-white file:font-bold file:cursor-pointer hover:file:bg-sky-700 dark:hover:file:bg-sky-600"
              onChange={(e) => setFile(e.target.files[0])}
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">PDF, PNG, JPG, JPEG, PPT, or PPTX • Max 50MB</p>
          </div>

          <div className="bg-amber-50 dark:bg-amber-950 border-l-4 border-amber-500 p-4">
            <p className="text-sm text-amber-800 dark:text-amber-300 font-semibold">
              ⚠️ Fields marked with <span className="text-red-500">*</span> are required
            </p>
          </div>

          <button
            type="submit"
            disabled={uploading}
            className="w-full bg-sky-600 hover:bg-sky-700 dark:bg-sky-500 dark:hover:bg-sky-600 text-white font-black py-4 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed hover:-translate-y-1 shadow-lg text-lg"
          >
            {uploading ? 'Uploading...' : linkedRequest ? '🤝 Upload & Fulfill Request' : '🚀 Upload Material'}
          </button>
        </form>
      </div>

      {showProgressModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl p-10 max-w-md w-full border-4 border-sky-400">
            <div className="text-center">
              {uploadStatus === 'uploading' && (
                <>
                  <div className="text-6xl mb-4 animate-bounce">📤</div>
                  <h3 className="text-2xl font-black text-gray-900 dark:text-white mb-2">Uploading</h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-6 font-semibold">Please wait...</p>

                  <div className="w-full bg-gray-200 dark:bg-gray-700 h-8 mb-4 overflow-hidden">
                    <div 
                      className="bg-sky-600 dark:bg-sky-500 h-8 transition-all duration-300 flex items-center justify-center text-white text-sm font-black"
                      style={{ width: `${uploadProgress}%` }}
                    >
                      {uploadProgress}%
                    </div>
                  </div>

                  <p className="text-sm text-gray-500 dark:text-gray-400 font-semibold">
                    {uploadProgress < 50 ? 'Starting...' : uploadProgress < 100 ? 'Almost there...' : 'Processing...'}
                  </p>
                </>
              )}

              {uploadStatus === 'success' && uploadedMaterial && (
                <>
                  <div className="text-6xl mb-4">✅</div>
                  <h3 className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mb-2">Upload Successful!</h3>
                  <p className="text-gray-900 dark:text-white font-bold mb-2">{uploadedMaterial.title}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 font-semibold">
                    Status: <span className={`font-black ${
                      uploadedMaterial.verificationStatus === 'approved' 
                        ? 'text-emerald-600 dark:text-emerald-400' 
                        : 'text-amber-600 dark:text-amber-400'
                    }`}>
                      {uploadedMaterial.verificationStatus.toUpperCase()}
                    </span>
                  </p>

                  {uploadedMaterial.verificationStatus === 'approved' ? (
                    <div className="bg-emerald-50 dark:bg-emerald-950 border-l-4 border-emerald-500 p-4">
                      <p className="text-sm text-emerald-800 dark:text-emerald-300 font-bold">
                        Your material is now live! 🚀
                      </p>
                    </div>
                  ) : (
                    <div className="bg-amber-50 dark:bg-amber-950 border-l-4 border-amber-500 p-4">
                      <p className="text-sm text-amber-800 dark:text-amber-300 font-bold">
                        Pending admin approval ⏳
                      </p>
                    </div>
                  )}
                </>
              )}

              {uploadStatus === 'error' && (
                <>
                  <div className="text-6xl mb-4">❌</div>
                  <h3 className="text-2xl font-black text-red-600 dark:text-red-400 mb-2">Upload Failed</h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-6 font-semibold">{message}</p>
                  <button
                    onClick={closeModal}
                    className="px-8 py-3 bg-red-600 hover:bg-red-700 text-white font-bold transition-colors"
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