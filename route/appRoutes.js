import express from 'express';
import { redirectToHome, getStartPage, getLoginForm, getSignupForm, getHomePage, getProfileUser, getChatPage, showChatMessage, sendImageMessage, changeAvatar, getVideoCall, getListFriend, searchListFriend, editProfile, saveProfile } from '../controller/homeController.js';
import {login, logout, register, init_RToken_AToken_for_FB_GG } from '../controller/authController.js';
import multer from "multer";
import path from 'path';
import passport from 'passport';
import { validateUserToken } from '../services/authMiddleware.js';
import jwt from 'jsonwebtoken';
import { verify } from 'crypto';
import { verifyEmail } from '../services/email.js';
import { validateInput } from '../services/utility.js';



let router = express.Router();// Use the express.Router class to create modular, mountable route handlers

// This code below will create a router as a module, loads a middleware function in it, defines some routes, and mounts the router module on a path in the main app.
const initWebRoute = (app) => {
    router.get('/checking-before-login', validateUserToken, redirectToHome);
    router.get('/', getStartPage);
    // routes for login and sign up
    router.get('/login-form', getLoginForm);
    router.get('/signup-form', getSignupForm);

    router.get('/home',  validateUserToken, getHomePage);

    router.get('/profile-user',  validateUserToken, getProfileUser);

    router.get('/chat',  validateUserToken, getChatPage);
    router.get('/chat/:roomID',  validateUserToken, showChatMessage);

    router.get('/list_friend',  validateUserToken, getListFriend);
    router.post('/getListFriend',  validateUserToken, searchListFriend);
    router.get('/edit-profile',  validateUserToken, editProfile)
    router.post('/save-profile',  validateUserToken, saveProfile);


    //cấu hình lưu trữ file khi upload xong
    const storage = multer.diskStorage({
        destination: function (req, file, cb) {
            cb(null, 'D:\\Nodejs\\src\\public\\fileUpload'); // cb is a callback function 
        },
        filename: function (req, file, cb) {
            const Rtoken = req.cookies.refresh_token;
            const RPayload = jwt.verify(Rtoken, process.env.TOKEN_SECRET);
            const time_now = Math.round(Date.now());
            const filename = time_now + "-" + RPayload.id;
            // fieldname is field name specified in the form
            // The path.extname() method returns the extension of the path
            cb(null, filename);
        }
    })

    let upload = multer({ storage: storage });

    router.post('/chat/image-message', upload.fields([{ name: 'file', maxCount: undefined }]), sendImageMessage);
    router.get('/videocall/:friendid/:roomID',  validateUserToken, getVideoCall);

    router.post('/profile-user/change-avatar', upload.single('mySingleFile'), changeAvatar); // this is  a route handler with multiple callback functions


    // route for login 


    router.post('/login', login);

    router.post('/sign-up', register);
    router.get('/verify/:userID/:token', verifyEmail);
    router.post('/validate', validateInput);
    router.get('/logout',  validateUserToken, logout);

    // authentication with facebook
    router.get('/auth/facebook', passport.authenticate('facebook', { scope: 'email', session: false }));
    router.get('/auth/facebook/callback', passport.authenticate('facebook', { failureRedirect: '/login-form', session: false }), init_RToken_AToken_for_FB_GG);

    // authenticaton with google
    router.get('/auth/google', passport.authenticate('google', { scope: ['email', 'profile'], session: false }));
    router.get('/auth/google/callback', passport.authenticate('google', { failureRedirect: '/login-form', session: false }), init_RToken_AToken_for_FB_GG);
    return app.use('/', router)
}


export default initWebRoute;