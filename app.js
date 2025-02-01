import express from 'express';
import configViewEngine from './configs/viewEngine.js';
import initWebRoute from './route/appRoutes.js';
// import initAPIRoute from './route/apiRoute.js';
import morgan from 'morgan';
import fs from 'fs';
import path from 'path';
import util from 'util';
import cors from 'cors';
import cookies from 'cookie-parser';
import passport from 'passport';
// import connection from './configs/connectDB.js';

// import { Strategy as FacebookStrategy } from 'passport-facebook';
// import { Strategy as GoogleStrategy } from 'passport-google-oauth2';
// import { v2 as cloudinary } from 'cloudinary';

import dotenv from 'dotenv';
dotenv.config()

// const settings = process.env.NODE_ENV === "production" ? import("../settings.js") : import("../settings-dev.js")

var app = express();

// var accessLogStream = fs.createWriteStream('access.log', { flags: 'a' })
// setup the logger
// app.use(morgan('combined', { stream: accessLogStream }))
// Helmet helps you secure your Express apps by setting various HTTP headers
// app.use(helmet());
// get data from client 
app.use(express.json()); // for json
app.use(express.urlencoded({ extended: false }));
app.use(cors({
    origin: 'http://localhost:3000', //Chan tat ca cac domain khac ngoai domain nay
    credentials: true //Để bật cookie HTTP qua CORS
}))
app.use(cookies());

/************************** Authentication with Facebook and Google ***********************/
// app.use(passport.initialize());
// passport.use(new FacebookStrategy({
//     clientID: process.env.FACEBOOK_ID,
//     clientSecret: process.env.FACEBOOK_SECRET,
//     callbackURL: "http://localhost:3000/auth/facebook/callback",
//     enableProof: true, // We also set enableProof: true to include a proof of authentication in the access token.
//     profileFields: ['id', 'email', 'gender', 'link', 'locale', 'displayName', 'timezone', 'updated_time', 'verified']
// }, function (accessToken, refeshToken, profile, done) { // this function must have 4 parameters, refresh token is optional paramesters
//     var user = {
//         'name': profile.displayName,
//         'email': profile.emails[0].value,
//         'id': profile.id,
//         'accessToken': accessToken
//     }
//     return done(null, user); // value profile.id passed to route' controller as `req.user`
// }
// ));

// // authentication with google
// passport.use(new GoogleStrategy({
//     clientID: process.env.GOOGLE_ID,
//     clientSecret: process.env.GOOGLE_SECRET,
//     callbackURL: "http://localhost:3000/auth/google/callback",
//     enableProof: true, // We also set enableProof: true to include a proof of authentication in the access token.
//     profileFields: ['id', 'email', 'gender', 'link', 'locale', 'displayName', 'timezone', 'updated_time', 'verified']
// }, function (accessToken, refeshToken, profile, done) { // this function must have 4 parameters, refresh token is optional paramesters
//     var user = {
//         'name': profile.displayName,
//         'email': profile.email,
//         'id': profile.id,
//         'accessToken': accessToken
//     }
//     return done(null, user); // value profile.id passed to route' controller as `req.user`
// }
// ));

// cloudinary.config({
//     cloud_name: process.env.CLOUDINARY_NAME,
//     api_key: process.env.CLOUDINARY_API_KEY,
//     api_secret: process.env.CLOUDINARY_API_SECRET
// });


// set up view engine
configViewEngine(app);

// init web route
initWebRoute(app);


// init api route
// initAPIRoute(app);

// middleware for 404 not found
app.use((req, res) => { 
    res.status(404).render('404.ejs');
})

/*************************** Setting socket io server **********************/
import http from 'http';
var server = http.createServer(app);
const hostname = '0.0.0.0';

import { Server } from 'socket.io';

// const io = new Server(server);

// io.on('connection', (socket) => {
//     socket.on('user-connected', userID => {
//         client.hSet('socket', socket.id, userID);
//         client.hSet(userID, 'status', 'on');
//         // Emit the 'userStatusChanged' event to all connected clients
//         io.emit('updateUserStatus', { userID: userID, status: 'on' });
//     })

//     socket.on('checkID', id => {
//         if (id) {
//             const roomID = id.userID + id.friendId;
//             let room_id = roomID; // khởi tạo thêm một biến room_id là nếu roomID bị ngược thì gán room_id mới

//             let message = '[]';

//             // check user is exist in message table or not
//             connection.execute('SELECT * FROM `message` WHERE `room_id` = ? OR `room_id` = ?', [roomID, id.friendId + id.userID]).then(result => {
//                 if (result[0][0]) {
//                     room_id = result[0][0].room_id;
//                     socket.emit('roomID', { room_id, id });
//                 } else {
//                     connection.execute('INSERT INTO inboxs(user_id, room_id) VALUES(?, ?)', [id.friendId, roomID]);
//                     connection.execute('INSERT INTO message(room_id, message) VALUES(?, ?)', [roomID, message]);
//                     socket.emit('roomID', { room_id, id });

//                 }
//             });

//         }
//     })

//     let room_id = '';

//     socket.on('join', data => { // data have roomID and userID
//         room_id = data.roomID;
//         socket.join(data.roomID);
//     })

//     socket.on('leave', data => {
//         room_id = data.roomID;
//         socket.leave(room_id);
//     })

//     socket.on('chat-message', (message) => { // object message have 3 properties : userID , friendid and message
//         // query data to get message of two user
//         connection.execute('SELECT * FROM `message`WHERE `room_id` = ?', [room_id]).then(result => {
//             let mess = JSON.parse(result[0][0].message); // result[0][0].message is text => mess is array

//             let new_message = [message.userID, message.message];
//             mess.push(new_message);

//             mess = JSON.stringify(mess); // convert mess to string

//             connection.execute('UPDATE message SET message = ? WHERE room_id = ?', [mess, room_id]); // update new message to database

//             // Send a message to all sockets in the 'room_id' room
//             io.to(room_id).emit('chat-reply', { userID: message.userID, message: message.message });
//         })
//     })
//     socket.on('call-video', data => {
//         io.emit('response-to-call-video', data);
//     })
//     socket.on('reject-call-video', data => {
//         io.emit('response-reject-call-video', data);
//     })
//     socket.on('close-video-call', (friendID) => {
//         // Send a message to all sockets in the 'room_id' room except for the sender
//         io.emit('response-to-close-video-call', friendID);
//     })
//     socket.on('disconnect', async () => {
//         // get user id from disconnected socket
//         const hgetAsync = util.promisify(client.hGet).bind(client);
//         let userID = await hgetAsync('socket', socket.id);
//         // when user disconnect then delete socket in redis
//         const hdelAsync = util.promisify(client.hDel).bind(client);
//         await hdelAsync('socket', socket.id);

//         const hvalsAsync = util.promisify(client.hVals).bind(client);
//         setTimeout(async () => {
//             let allUserID = await hvalsAsync("socket");
//             if (allUserID.indexOf(userID) != -1) {
//                 // if user temporary disconnect socket (like refesh page or navigate to another route...), then let argument is null
//                 io.emit('updateUserStatus', {});
//             } else {
//                 // if user really disconnect socket, then set argument has status is off
//                 client.hSet(userID, "status", "off");
//                 io.emit('updateUserStatus', { userID: userID, status: 'off' });
//             }
//         }, 10000)
//     });

//     socket.on('send-notification-to-server', data => {
//         io.emit('send-notification-to-friend', data);
//     })
// })

server.listen(process.env.PORT || 3000, hostname, () => console.log(`Server is running on http://localhost:${process.env.PORT}`));