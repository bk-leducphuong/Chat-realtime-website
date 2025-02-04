import dotenv from 'dotenv';
import util from 'util';
import jwt from 'jsonwebtoken';
import dbConnection from '../configs/connectDB.js';

dotenv.config();

export const validateUserToken = async (req, res, next) => {
    try {
        const { refresh_token: Rtoken, access_token: Atoken } = req.cookies;

        if (!Atoken) {
            return res.redirect('/login-form');
        }

        // Verify the access token
        jwt.verify(Atoken, process.env.ACCESS_TOKEN_SECRET, async (err, decoded) => {
            if (err) {
                // If access token is invalid, check the refresh token
                if (!Rtoken) {
                    return res.redirect('/login-form');
                }

                // Verify the refresh token
                jwt.verify(Rtoken, process.env.REFRESH_TOKEN_SECRET, async (err, decodedRefresh) => {
                    if (err) {
                        return res.redirect('/login-form');
                    }

                    // Check if the refresh token is in the database
                    const [data, fields] = await dbConnection.execute('SELECT * FROM `users` WHERE `user_id` = ?', [decodedRefresh.userId]);

                    if (data[0].refresh_token !== Rtoken) {
                        return res.redirect('/login-form');
                    }

                    // Generate a new access token
                    const newAccessToken = jwt.sign({ userId: decodedRefresh.userId }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: process.env.ACCESS_TOKEN_EXPIRY });
                    res.cookie('access_token', newAccessToken, { httpOnly: true, secure: process.env.NODE_ENV === 'production' });

                    req.user = decodedRefresh;
                    next();
                });
            } else {
                req.user = decoded;
                next();
            }
        });
    } catch (error) {
        console.log("Error:", error);
        res.redirect('/login-form');
    }
};
