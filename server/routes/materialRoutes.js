const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { protect, adminOnly } = require('../middleware/auth');
const { 
  uploadMaterial,
  getAllMaterials,
  getPendingMaterials,
  approveMaterial,
  rejectMaterial,
  downloadMaterial,
  incrementView,
  voteMaterial,
  toggleFavorite,
  getUserFavorites,
  reportMaterial,
  getReports,
  deleteMaterial,
  ignoreReports
} = require('../controllers/materialController');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage,
  limits: { fileSize: 50 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowedExtensions = /pdf|png|jpg|jpeg|ppt|pptx/;
    const extname = allowedExtensions.test(path.extname(file.originalname).toLowerCase());
    
    const allowedMimeTypes = [
      'application/pdf',
      'image/png',
      'image/jpg',
      'image/jpeg',
      'application/vnd.ms-powerpoint',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation'
    ];
    const mimetype = allowedMimeTypes.includes(file.mimetype);
    
    if (extname && mimetype) {
      return cb(null, true);
    } else {
      cb(new Error('Only PDF, PNG, JPG, JPEG, PPT, and PPTX files are allowed!'));
    }
  }
});

router.delete('/:id', protect, adminOnly, deleteMaterial);
router.patch('/:id/ignore-reports', protect, adminOnly, ignoreReports);

router.post('/upload', protect, upload.single('material'), uploadMaterial);
router.get('/', getAllMaterials);
router.get('/pending/all', protect, adminOnly, getPendingMaterials);
router.patch('/:id/approve', protect, adminOnly, approveMaterial);
router.patch('/:id/reject', protect, adminOnly, rejectMaterial);
router.get('/:id/download', downloadMaterial);
router.patch('/:id/view', incrementView);
router.post('/:id/vote', protect, voteMaterial);

router.post('/:id/favorite', protect, toggleFavorite);
router.get('/favorites/my', protect, getUserFavorites);

router.post('/:id/report', protect, reportMaterial);
router.get('/reports/all', protect, adminOnly, getReports);

module.exports = router;