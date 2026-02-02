const express = require('express');
const router = express.Router();
const { protect, adminOnly } = require('../middleware/auth');
const {
  createRequest,
  getAllRequests,
  getMyRequests,
  fulfillRequest,
  deleteRequest,
  closeRequest
} = require('../controllers/requestController');

router.post('/', protect, createRequest);
router.get('/', getAllRequests);
router.get('/my', protect, getMyRequests);
router.patch('/:id/fulfill', protect, fulfillRequest);
router.patch('/:id/close', protect, closeRequest);
router.delete('/:id', protect, deleteRequest);

module.exports = router;