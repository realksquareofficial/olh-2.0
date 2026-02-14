import { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../utils/axios';
import { AuthContext } from '../context/AuthContext';

const Register = () => {
const [username, setUsername] = useState('');
const [email, setEmail] = useState('');
const [password, setPassword] = useState('');
const [confirmPassword, setConfirmPassword] = useState('');
const [error, setError] = useState('');
const [passwordStrength, setPasswordStrength] = useState('');
const [passwordErrors, setPasswordErrors] = useState([]);
const { login } = useContext(AuthContext);
const navigate = useNavigate();

const validatePassword = (pwd) => {
const errors = [];
const commonPatterns = ['12345', '123456', '1234567', '12345678', 'abcdef', 'qwerty', 'password', '00000', '11111'];

if (pwd.length < 8) {
errors.push('At least 8 characters required');
}
if (!/[a-zA-Z]/.test(pwd)) {
errors.push('Must contain at least one letter');
}
if (!/[0-9]/.test(pwd)) {
errors.push('Must contain at least one number');
}

const lowerPwd = pwd.toLowerCase();
if (commonPatterns.some(pattern => lowerPwd.includes(pattern))) {
errors.push('Avoid common patterns like 12345 or qwerty');
}

if (/^[a-zA-Z]+$/.test(pwd) || /^[0-9]+$/.test(pwd)) {
errors.push('Mix letters and numbers together');
}

setPasswordErrors(errors);

if (errors.length === 0 && pwd.length >= 12) {
setPasswordStrength('Strong');
} else if (errors.length === 0) {
setPasswordStrength('Good');
} else if (pwd.length >= 6 && errors.length <= 2) {
setPasswordStrength('Weak');
} else {
setPasswordStrength('');
}

return errors.length === 0;
};

const handlePasswordChange = (e) => {
const pwd = e.target.value;
setPassword(pwd);
if (pwd) {
validatePassword(pwd);
} else {
setPasswordErrors([]);
setPasswordStrength('');
}
};

const handleRegister = async (e) => {
e.preventDefault();
setError('');

if (!validatePassword(password)) {
setError('Please fix the password issues below');
return;
}

if (password !== confirmPassword) {
setError('Passwords do not match!');
return;
}

try {
const { data } = await axiosInstance.post('/api/auth/register', { username, email, password });
localStorage.setItem('token', data.token);
login(data.user);
window.location.href = '/';
} catch (error) {
setError(error.response?.data?.message || 'Registration failed');
}
};

return (
<div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-pink-100 dark:from-gray-900 dark:to-gray-800 p-4">
<div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-2xl w-full max-w-md border-2 border-purple-200 dark:border-gray-700">
<div className="text-center mb-8">
<h2 className="text-3xl font-bold text-purple-900 dark:text-purple-300 mb-2">Join OLH 2.0! 🎉</h2>
<p className="text-gray-600 dark:text-gray-400">Create your account to get started</p>
</div>

{error && (
<div className="mb-4 p-3 bg-red-100 dark:bg-red-900/30 border border-red-400 dark:border-red-600 text-red-700 dark:text-red-300 rounded-lg">
{error}
</div>
)}

<form onSubmit={handleRegister} className="space-y-6">
<div>
<label className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">
Username
</label>
<input
type="text"
value={username}
onChange={(e) => setUsername(e.target.value)}
required
className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 dark:bg-gray-700 dark:text-white"
placeholder="Choose a username"
/>
</div>

<div>
<label className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">
Email
</label>
<input
type="email"
value={email}
onChange={(e) => setEmail(e.target.value)}
required
className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 dark:bg-gray-700 dark:text-white"
placeholder="your.email@example.com"
/>
</div>

<div>
<label className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">
Password
</label>
<input
type="password"
value={password}
onChange={handlePasswordChange}
required
className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 dark:bg-gray-700 dark:text-white"
placeholder="Create a strong password"
/>

{passwordStrength && (
<div className="mt-2 flex items-center gap-2">
<span className="text-sm font-semibold text-gray-700 dark:text-gray-300">Strength:</span>
<span className={`text-sm font-bold ${
passwordStrength === 'Strong' ? 'text-green-600 dark:text-green-400' :
passwordStrength === 'Good' ? 'text-blue-600 dark:text-blue-400' :
'text-orange-600 dark:text-orange-400'
}`}>
{passwordStrength === 'Strong' ? '💪 Strong' : passwordStrength === 'Good' ? '✅ Good' : '⚠️ Weak'}
</span>
</div>
)}

{passwordErrors.length > 0 && (
<ul className="mt-2 space-y-1">
{passwordErrors.map((err, idx) => (
<li key={idx} className="text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
<span>❌</span>
<span>{err}</span>
</li>
))}
</ul>
)}
</div>

<div>
<label className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">
Confirm Password
</label>
<input
type="password"
value={confirmPassword}
onChange={(e) => setConfirmPassword(e.target.value)}
required
className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 dark:bg-gray-700 dark:text-white"
placeholder="Confirm your password"
/>
</div>

<button
type="submit"
className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold py-3 rounded-lg transition-all duration-200 transform hover:scale-105 shadow-lg"
>
🚀 Create Account
</button>
</form>

<div className="mt-6 text-center">
<p className="text-gray-600 dark:text-gray-400">
Already have an account?{' '}
<button
onClick={() => navigate('/login')}
className="text-purple-600 dark:text-purple-400 font-semibold hover:underline"
>
Login here
</button>
</p>
</div>
</div>
</div>
);
};

export default Register;