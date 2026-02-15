const Material = require('../models/Material');
const Notification = require('../models/Notification');
const { sendNotification } = require('../utils/pushNotification');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');


const uploadMaterial = async (req, res) => {
try {
const { title, subject, description, source, regulationYear, materialType, linkedRequest } = req.body;


if (!req.file) {
return res.status(400).json({ message: 'No file uploaded' });
}


const fileUrl = `/uploads/${req.file.filename}`;
const filePath = path.join(__dirname, '..', fileUrl);


const fileBuffer = fs.readFileSync(filePath);
const fileHash = crypto.createHash('sha256').update(fileBuffer).digest('hex');


const existingMaterial = await Material.findOne({ fileHash });
if (existingMaterial) {
fs.unlinkSync(filePath);
return res.status(400).json({ message: 'This file has already been uploaded!' });
}


const verificationStatus = ['admin', 'master'].includes(req.user.role) ? 'approved' : 'pending';


const material = new Material({
title,
subject,
description,
source,
regulationYear,
materialType: materialType || 'other',
fileHash,
fileUrl,
uploadedBy: req.user.id,
verificationStatus,
linkedRequest: linkedRequest || null
});


await material.save();


if (linkedRequest) {
const Request = require('../models/Request');
const request = await Request.findByIdAndUpdate(linkedRequest, {
status: 'fulfilled',
fulfilledBy: material._id
}, { new: true });

if (request && request.requestedBy) {
await sendNotification(request.requestedBy, {
title: 'Request Fulfilled! 🎉',
body: `Your request "${request.subject}" has been fulfilled`,
url: '/'
});
}
}


res.status(201).json(material);
} catch (err) {
console.error(err);
res.status(500).json({ message: 'Server error', error: err.message });
}
};


const getAllMaterials = async (req, res) => {
try {
const materials = await Material.find({ verificationStatus: 'approved' })
.populate('uploadedBy', 'username role')
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
console.error(err);
res.status(500).json({ message: 'Server error' });
}
};


const getPendingMaterials = async (req, res) => {
try {
const materials = await Material.find({ verificationStatus: 'pending' })
.populate('uploadedBy', 'username role')
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
console.error(err);
res.status(500).json({ message: 'Server error' });
}
};


const approveMaterial = async (req, res) => {
try {
const { id } = req.params;
const material = await Material.findById(id).populate('uploadedBy', 'username');


if (!material) {
return res.status(404).json({ message: 'Material not found' });
}


material.verificationStatus = 'approved';
await material.save();


await Notification.create({
recipient: material.uploadedBy._id,
type: 'approved',
message: `Your material "${material.title}" has been approved`,
materialId: material._id,
materialTitle: material.title,
actionBy: req.user.id
});


await sendNotification(material.uploadedBy._id, {
title: 'Material Approved! ✅',
body: `Your material "${material.title}" has been approved`,
url: '/'
});


res.json(material);
} catch (err) {
console.error(err);
res.status(500).json({ message: 'Server error' });
}
};


const rejectMaterial = async (req, res) => {
try {
const { id } = req.params;
const { reason } = req.body;
const material = await Material.findById(id).populate('uploadedBy', 'username');


if (!material) {
return res.status(404).json({ message: 'Material not found' });
}


await Notification.create({
recipient: material.uploadedBy._id,
type: 'rejected',
message: `Your material "${material.title}" has been rejected`,
materialId: material._id,
materialTitle: material.title,
actionBy: req.user.id,
reason: reason || 'No reason provided'
});


await sendNotification(material.uploadedBy._id, {
title: 'Material Rejected ❌',
body: `Your material "${material.title}" has been rejected. Reason: ${reason || 'No reason provided'}`,
url: '/'
});


if (material.fileUrl) {
const filePath = path.join(__dirname, '..', material.fileUrl);
if (fs.existsSync(filePath)) {
fs.unlinkSync(filePath);
}
}


await Material.findByIdAndDelete(id);
res.json({ message: 'Material rejected and deleted' });
} catch (err) {
console.error(err);
res.status(500).json({ message: 'Server error' });
}
};


const downloadMaterial = async (req, res) => {
try {
const { id } = req.params;
const material = await Material.findById(id);


if (!material) {
return res.status(404).json({ message: 'Material not found' });
}


const filePath = path.join(__dirname, '..', material.fileUrl);
const customFileName = `from_OLH_2_0_${material.title.replace(/\s+/g, '_')}.pdf`;


res.download(filePath, customFileName);
} catch (err) {
console.error(err);
res.status(500).json({ message: 'Server error' });
}
};


const incrementView = async (req, res) => {
try {
const { id } = req.params;
const material = await Material.findById(id);


if (!material) {
return res.status(404).json({ message: 'Material not found' });
}


material.views += 1;
await material.save();


res.json({ views: material.views });
} catch (err) {
console.error(err);
res.status(500).json({ message: 'Server error' });
}
};


const voteMaterial = async (req, res) => {
try {
const { id } = req.params;
const { voteType } = req.body;
const userId = req.user.id;


const material = await Material.findById(id);
if (!material) {
return res.status(404).json({ message: 'Material not found' });
}


if (!Array.isArray(material.votes)) {
material.votes = [];
}


const isOwnMaterial = material.uploadedBy.toString() === userId.toString();
if (isOwnMaterial) {
return res.status(403).json({ message: "You can't vote on your own material" });
}


const existingVote = material.votes.find(
(v) => v.user.toString() === userId.toString()
);


if (existingVote) {
return res.status(400).json({ message: 'You have already voted on this material' });
}


material.votes.push({ user: userId, voteType });


const upvotes = material.votes.filter((v) => v.voteType === 'upvote').length;
const downvotes = material.votes.filter((v) => v.voteType === 'downvote').length;
material.trustScore = upvotes - downvotes;


await material.save();
res.json(material);
} catch (err) {
console.error(err);
res.status(500).json({ message: 'Server error' });
}
};


const toggleFavorite = async (req, res) => {
try {
const { id } = req.params;
const userId = req.user.id;


const material = await Material.findById(id);
if (!material) {
return res.status(404).json({ message: 'Material not found' });
}


const isFavorited = material.favorites.some(fav => fav.toString() === userId.toString());


if (isFavorited) {
material.favorites = material.favorites.filter(fav => fav.toString() !== userId.toString());
} else {
material.favorites.push(userId);
}


await material.save();
res.json(material);
} catch (err) {
console.error(err);
res.status(500).json({ message: 'Server error' });
}
};


const getUserFavorites = async (req, res) => {
try {
const userId = req.user.id;
const materials = await Material.find({ favorites: userId })
.populate('uploadedBy', 'username')
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
console.error(err);
res.status(500).json({ message: 'Server error' });
}
};


const reportMaterial = async (req, res) => {
try {
const { id } = req.params;
const { reason } = req.body;
const userId = req.user.id;


const material = await Material.findById(id);
if (!material) {
return res.status(404).json({ message: 'Material not found' });
}


const existingReport = material.reports.find(r => r.reportedBy.toString() === userId.toString());
if (existingReport) {
return res.status(400).json({ message: 'You have already reported this material' });
}


material.reports.push({ reportedBy: userId, reason });
await material.save();


res.json({ message: 'Report submitted successfully' });
} catch (err) {
console.error(err);
res.status(500).json({ message: 'Server error' });
}
};


const getReports = async (req, res) => {
try {
const materials = await Material.find({ 'reports.0': { $exists: true } })
.populate('uploadedBy', 'username')
.populate('reports.reportedBy', 'username')
.sort({ 'reports.createdAt': -1 });
res.json(materials);
} catch (err) {
console.error(err);
res.status(500).json({ message: 'Server error' });
}
};


const deleteMaterial = async (req, res) => {
try {
const { id } = req.params;


const material = await Material.findById(id);
if (!material) {
return res.status(404).json({ message: 'Material not found' });
}


const isOwner = material.uploadedBy.toString() === req.user.id;
const isAdmin = ['admin', 'master'].includes(req.user.role);


if (!isOwner && !isAdmin) {
return res.status(403).json({ message: 'Not authorized to delete this material' });
}


if (material.fileUrl) {
const filePath = path.join(__dirname, '..', material.fileUrl);
if (fs.existsSync(filePath)) {
fs.unlinkSync(filePath);
}
}


await Material.findByIdAndDelete(id);
res.json({ message: 'Material deleted successfully' });
} catch (err) {
console.error('Delete Error:', err);
res.status(500).json({ message: 'Server error', error: err.message });
}
};


const ignoreReports = async (req, res) => {
try {
const { id } = req.params;


const material = await Material.findById(id);
if (!material) {
return res.status(404).json({ message: 'Material not found' });
}


material.reports = [];
await material.save();


res.json({ message: 'Reports cleared successfully', material });
} catch (err) {
console.error('Ignore Reports Error:', err);
res.status(500).json({ message: 'Server error', error: err.message });
}
};


module.exports = {
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
};