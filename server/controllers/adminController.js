const User = require('../models/User');
const Material = require('../models/Material');

const getStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalMaterials = await Material.countDocuments({ verificationStatus: 'approved' });
    const pendingMaterials = await Material.countDocuments({ verificationStatus: 'pending' });
    const reportedMaterials = await Material.countDocuments({ 'reports.0': { $exists: true } });

    res.json({
      totalUsers,
      totalMaterials,
      pendingMaterials,
      reportedMaterials
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { getStats };