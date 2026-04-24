import 'dotenv/config'
import jwt from 'jsonwebtoken'

const get_user_info_cookies = (req, res, next) => {
    const token = req.cookies?.data;
    const isUseDefualtPassword = req.headers['default']?.toLowerCase() === 'true';

    // ✅ Case 1: No token
    if (!token) {
        req.has_token = false;

        // ❌ Only block if default password is requested
        if (isUseDefualtPassword) {
            return res.status(400).json({
                message: "Cookies not set. Please set credentials or use custom password"
            });
        }

        return next(); // ✅ allow custom password flow
    }

    // ✅ Case 2: Token exists
    try {
        const verify = jwt.verify(token, process.env.JWT_SECRET);

        req.has_token = true;
        req.user_data = {
            fullname: verify.fullname,
            dob: verify.dob
        };

        return next();
    } catch (err) {
        console.log("JWT verify failed:", err.message);

        req.has_token = false;

        // ❌ Only block if default password requested
        if (isUseDefualtPassword) {
            return res.status(400).json({
                message: "Invalid/Expired token. Please reset credentials"
            });
        }

        return next(); // ✅ allow custom password
    }
};

export default get_user_info_cookies;