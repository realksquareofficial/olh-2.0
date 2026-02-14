const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const validatePassword = (password) => {
const errors = [];
const commonPatterns = ['12345', '123456', '1234567', '12345678', 'abcdef', 'qwerty', 'password', '00000', '11111'];

if (password.length < 8) {
errors.push('Password must be at least 8 characters');
}
if (!/[a-zA-Z]/.test(password)) {
errors.push('Password must contain at least one letter');
}
if (!/[0-9]/.test(password)) {
errors.push('Password must contain at least one number');
}

const lowerPwd = password.toLowerCase();
if (commonPatterns.some(pattern => lowerPwd.includes(pattern))) {
errors.push('Password contains common patterns (avoid 12345, qwerty, etc.)');
}

if (/^[a-zA-Z]+$/.test(password) || /^[0-9]+$/.test(password)) {
errors.push('Password must mix letters and numbers together');
}

return errors;
};

exports.register = async (req, res) => {
try {
console.log('Register request body:', req.body);
const { username, email, password } = req.body;

if (!username || !email || !password) {
return res.status(400).json({ msg: 'Please provide all fields' });
}

const passwordErrors = validatePassword(password);
if (passwordErrors.length > 0) {
return res.status(400).json({ 
msg: 'Password does not meet requirements',
errors: passwordErrors 
});
}

const existingUser = await User.findOne({ email });
if (existingUser) {
return res.status(400).json({ msg: 'Email already exists' });
}

const hashedPassword = await bcrypt.hash(password, 10);
const user = await User.create({
username,
email,
password: hashedPassword
});

const token = jwt.sign(
{ id: user._id, role: user.role }, 
process.env.JWT_SECRET, 
{ expiresIn: '30d' }
);

res.status(201).json({
token,
user: {
id: user._id,
username: user.username,
email: user.email,
role: user.role
}
});
} catch (err) {
console.error('Register error:', err);
res.status(500).json({ msg: 'Server error', error: err.message });
}
};

exports.login = async (req, res) => {
try {
console.log('Login request body:', req.body);
const { email, password } = req.body;

if (!email || !password) {
console.log('Missing email or password');
return res.status(400).json({ msg: 'Please provide email and password' });
}

const user = await User.findOne({ email });
console.log('User found:', user ? 'Yes' : 'No');

if (!user) {
return res.status(400).json({ msg: 'Invalid credentials' });
}

const isMatch = await bcrypt.compare(password, user.password);
console.log('Password match:', isMatch);

if (!isMatch) {
return res.status(400).json({ msg: 'Invalid credentials' });
}

const token = jwt.sign(
{ id: user._id, role: user.role }, 
process.env.JWT_SECRET, 
{ expiresIn: '30d' }
);

res.json({
token,
user: {
id: user._id,
username: user.username,
email: user.email,
role: user.role
}
});
} catch (err) {
console.error('Login error:', err);
res.status(500).json({ msg: 'Server error', error: err.message });
}
};

exports.getMe = async (req, res) => {
try {
const token = req.headers.authorization?.split(' ')[1];
if (!token) {
return res.status(401).json({ msg: 'No token' });
}

const decoded = jwt.verify(token, process.env.JWT_SECRET);
const user = await User.findById(decoded.id).select('-password');

if (!user) {
return res.status(404).json({ msg: 'User not found' });
}

res.json({
id: user._id,
username: user.username,
email: user.email,
role: user.role
});
} catch (err) {
console.error('GetMe error:', err);
res.status(401).json({ msg: 'Invalid token' });
}
};