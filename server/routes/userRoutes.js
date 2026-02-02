const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { protect, adminOnly } = require('../middleware/auth');

router.get('/profile', protect, userController.getUserProfile);
router.get('/my-materials', protect, userController.getUserMaterials);

router.get('/all', protect, adminOnly, userController.getAllUsers);
router.patch('/:id/role', protect, adminOnly, userController.updateUserRole);
router.delete('/:id', protect, adminOnly, userController.deleteUser);

module.exports = router;