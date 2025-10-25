const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');

dotenv.config();

const login = (req, res) => {
    try {
        const { email, password } = req.body;

        // Dummy authentication logic
        if (email === 'admin' && password === 'admin') {
            // Generate a JWT token
            const token = jwt.sign({ email }, process.env.JWTSECRET, { expiresIn: '1h' });

            res.cookie('token', token, {
                httpOnly: true,
                secure: false,
                sameSite: 'lax',
                maxAge: 60 * 60 * 1000 // 1 hour
            });

            return res.status(200).json({ message: 'Login successful' });
        }
        return res.status(401).json({ message: 'Invalid credentials' });
    } catch (error) {
        return res.status(500).json({ message: 'Internal server error' });
    }
};

const logout = (req, res) => {
    try {
        const isProd = process.env.NODE_ENV === 'production';
        // clear the token cookie
        res.clearCookie('token', {
            httpOnly: true,
            secure: isProd,
            sameSite: isProd ? 'none' : 'lax'
        });
        return res.status(200).json({ message: 'Logged out' });
    } catch (err) {
        return res.status(500).json({ message: 'Failed to logout' });
    }
};

module.exports = {
    login,
    logout
};