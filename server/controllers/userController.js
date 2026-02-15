const User = require('../models/User');
const Material = require('../models/Material');
const jwt = require('jsonwebtoken');

exports.getUserProfile = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ msg: 'No token provided' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select('-password');

    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }

    const uploadedCount = await Material.countDocuments({ uploadedBy: decoded.id });
    const favoritesCount = await Material.countDocuments({ favorites: decoded.id });

    res.json({
      user,
      stats: {
        uploadedCount,
        favoritesCount
      }
    });
  } catch (err) {
    console.error('getUserProfile error:', err);
    res.status(500).json({ msg: 'Server error' });
  }
};

exports.getUserMaterials = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ msg: 'No token provided' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const materials = await Material.find({ uploadedBy: decoded.id })
      .populate('uploadedBy', 'username email role')
      .populate({
        path: 'linkedRequest',
        select: 'subject description requestedBy',
        populate: {
          path: 'requestedBy',
          select: 'username'
        }
      })
      .sort({ createdAt: -1 });

    res.json(materials);
  } catch (err) {
    console.error('getUserMaterials error:', err);
    res.status(500).json({ msg: 'Server error' });
  }
};

exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    res.json(users);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.updateUserRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    if (!['user', 'admin', 'master'].includes(role)) {
      return res.status(400).json({ message: 'Invalid role' });
    }

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.role = role;
    await user.save();

    res.json({ message: 'Role updated successfully', user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    await User.findByIdAndDelete(id);
    res.json({ message: 'User deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getCurrentUser = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    res.json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
};

module.exports = {
  getUserProfile: exports.getUserProfile,
  getUserMaterials: exports.getUserMaterials,
  getAllUsers: exports.getAllUsers,
  updateUserRole: exports.updateUserRole,
  deleteUser: exports.deleteUser
};