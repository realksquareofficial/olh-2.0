const Request = require('../models/Request');
const Material = require('../models/Material');

const createRequest = async (req, res) => {
  try {
    const { subject, description, materialType, regulationYear } = req.body;

    const request = new Request({
      subject,
      description,
      materialType,
      regulationYear,
      requestedBy: req.user.id
    });

    await request.save();
    
    // Fetch the saved request with populated data
    const populatedRequest = await Request.findById(request._id)
      .populate('requestedBy', 'username');

    res.status(201).json(populatedRequest);
  } catch (err) {
    console.error('Create Request Error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

const getAllRequests = async (req, res) => {
  try {
    const requests = await Request.find({ status: 'open' })
      .populate('requestedBy', 'username role')
      .sort({ createdAt: -1 });
    res.json(requests);
  } catch (err) {
    console.error('Get Requests Error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

const getMyRequests = async (req, res) => {
  try {
    const requests = await Request.find({ requestedBy: req.user.id })
      .populate('requestedBy', 'username')
      .populate('fulfilledBy')
      .sort({ createdAt: -1 });
    res.json(requests);
  } catch (err) {
    console.error('Get My Requests Error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

const fulfillRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const { materialId } = req.body;

    const request = await Request.findById(id);
    if (!request) {
      return res.status(404).json({ message: 'Request not found' });
    }

    if (request.requestedBy.toString() === req.user.id) {
      return res.status(403).json({ message: 'You cannot fulfill your own request' });
    }

    request.status = 'fulfilled';
    request.fulfilledBy = materialId;
    await request.save();

    res.json(request);
  } catch (err) {
    console.error('Fulfill Request Error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

const deleteRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const request = await Request.findById(id);

    if (!request) {
      return res.status(404).json({ message: 'Request not found' });
    }

    if (request.requestedBy.toString() !== req.user.id && !['admin', 'master'].includes(req.user.role)) {
      return res.status(403).json({ message: 'Not authorized to delete this request' });
    }

    await Request.findByIdAndDelete(id);
    res.json({ message: 'Request deleted successfully' });
  } catch (err) {
    console.error('Delete Request Error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

const closeRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const request = await Request.findById(id);

    if (!request) {
      return res.status(404).json({ message: 'Request not found' });
    }

    if (request.requestedBy.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to close this request' });
    }

    request.status = 'closed';
    await request.save();

    res.json(request);
  } catch (err) {
    console.error('Close Request Error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  createRequest,
  getAllRequests,
  getMyRequests,
  fulfillRequest,
  deleteRequest,
  closeRequest
};