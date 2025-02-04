// import connection from '../configs/connectDB.js';
import jwt from 'jsonwebtoken';
import util from 'util';
import fs from 'fs';
import { v2 as cloudinary } from 'cloudinary';

export let getStartPage = async (req, res) => {
    res.render('WelcomePage.ejs');
}

export let redirectToHome = (req, res) => {
    return res.redirect('/home');
}

export let getHomePage = (req, res) => {
    return res.render('home.ejs', { userID: req.user.userId });
}

export let getProfileUser = async (req, res) => {
    let filename;

    const Rtoken = req.cookies.refresh_token;
    const RPayload = jwt.verify(Rtoken, process.env.TOKEN_SECRET);

    const hgetAsync = util.promisify(client.hGet).bind(client);
    const result = await hgetAsync(RPayload.id, "public_id");

    if (result) {
        filename = cloudinary.url(result, { width: 315, height: 315, crop: 'fill' });
    } else {
        const imageId = 'avatar/avatar7_qycgpo.png'
        filename = cloudinary.url(imageId, { width: 315, height: 315, crop: 'fill' });
    }

    let user_data = await connection.execute('SELECT * FROM `information_of_users` WHERE `userID` = ?', [RPayload.id]);
    if (user_data[0][0]) {
        return res.render('profile_user.ejs', { user: user_data[0][0], filename: filename })
    }

}

export let changeAvatar = async (req, res) => {
    try {
        const file = req.file;
        const Rtoken = req.cookies.refresh_token;
        const RPayload = jwt.verify(Rtoken, process.env.TOKEN_SECRET);

        const cloudinaryUpload = util.promisify(cloudinary.uploader.upload);

        const result = await cloudinaryUpload(file.path, { public_id: `avatar/${file.filename}` })

        fs.unlinkSync(file.path); // delete file in folder fileUpload 

        await client.hSet(RPayload.id, 'public_id', result.public_id);

        return res.redirect('/profile-user');
    } catch (error) {
        console.log(err);
        return res.status(500).send('Failed to upload image');
    }

}

export let getChatPage = async (req, res) => {
    const Rtoken = req.cookies.refresh_token;
    const RPayload = jwt.verify(Rtoken, process.env.TOKEN_SECRET);

    const hgetAsync = util.promisify(client.hGet).bind(client);
    const listFriend = await hgetAsync(RPayload.id, "List_friend");
    const friend = JSON.parse(listFriend);
    for (let i = 0; i < friend.length; i++) {
        let status = await hgetAsync(friend[i].userID, "status");
        friend[i].status = status;
    }

    const data = await connection.execute('SELECT `username` FROM `information_of_users` WHERE `userID` = ?', [RPayload.id]);

    return res.render('chatPage.ejs', { userID: RPayload.id, friend: friend, username: data[0][0].username });
}

export let showChatMessage = (req, res) => {
    const roomID = req.params.roomID;

    connection.execute('SELECT * FROM `message` WHERE `room_id` = ?', [roomID]).then(result => {
        const message = result[0][0].message;
        return res.send({ message });
    });
}

export let sendImageMessage = async (req, res) => {
    try {
        const files = req.files.file; // files is array of objects 
        const Rtoken = req.cookies.refresh_token;
        const RPayload = jwt.verify(Rtoken, process.env.TOKEN_SECRET);

        const cloudinaryUpload = util.promisify(cloudinary.uploader.upload);
        let message = [];

        for (let i = 0; i < files.length; i++) {
            const result = await cloudinaryUpload(files[i].path, { folder: req.body.room_id })
            let url = cloudinary.url(result.public_id);
            let new_message = [RPayload.id, url]; // result.public_id is src to file on cloudinary
            message.push(new_message);
            fs.unlinkSync(files[i].path); // delete file in folder fileUpload 
        }

        return res.send({ message });
    } catch (error) {
        console.log(error);
        return res.status(500).send('Failed to upload image');
    }
}

export let getVideoCall = (req, res) => {
    let friendid = req.params.friendid;
    let roomID = req.params.roomID;

    const Rtoken = req.cookies.refresh_token;
    const RPayload = jwt.verify(Rtoken, process.env.TOKEN_SECRET);
    return res.render('callvideo.ejs', { userID: RPayload.id, friendID: friendid, roomID: roomID });
}


export let editProfile = async (req, res) => {
    // By default, the llen command takes a callback function that is called with two arguments: an error object (or null if no error occurred) and the length of the list
    // However, since we want to use the llen command with promises, we need to convert it to
    // a function that returns a promise. This is where util.promisify comes in. 
    // `util.promisify` takes a function that takes a callback as its last argument and returns a 
    // new function that returns a promise instead
    // In the code above, we pass client.llen (the original llen function) to `util.promisify`
    // to create a new function that returns a promise-based version of the `llen` command. We
    // then use `.bind(client)` to bind the this value of the new function to client, so that it   
    // can be called with `this` referring to the Redis client instance.
    // Finally, we assign the new function to the `llenAsync` variable so that we can use it later in
    // our code with promises instead of callbacks.
    let filename;

    const Rtoken = req.cookies.refresh_token;
    const RPayload = jwt.verify(Rtoken, process.env.TOKEN_SECRET);

    const hgetAsync = util.promisify(client.hGet).bind(client);
    const result = await hgetAsync(RPayload.id, "public_id");

    if (result) {
        filename = cloudinary.url(result, { width: 315, height: 315, crop: 'fill' });
    } else {
        const imageId = 'avatar/avatar7_qycgpo.png'
        filename = cloudinary.url(imageId, { width: 315, height: 315, crop: 'fill' });
    }
    let user_data = await connection.execute('SELECT * FROM `information_of_users` WHERE `userID` = ?', [RPayload.id]);
    if (user_data[0][0]) {
        return res.render('editProfile.ejs', { user: user_data[0][0], filename: filename })
    }
}

export let saveProfile = async (req, res) => {
    const Rtoken = req.cookies.refresh_token;
    const RPayload = jwt.verify(Rtoken, process.env.TOKEN_SECRET);

    const user = req.body;

    let user_data = await connection.execute('SELECT * FROM `information_of_users` WHERE `userID` = ?', [RPayload.id]);
    if (user_data[0][0]) {
        await connection.execute('UPDATE information_of_users SET username = ?, email = ?, mobilenumber = ?, gender = ?, address = ?, birthday = ?, link_fb = ?, link_website = ?, link_github = ?, link_insta = ?, link_twitter = ? WHERE userID = ?', [user.username, user.email, user.mobilenumber, user.gender, user.address, user.birthday, user.link_facebook, user.link_website, user.link_github, user.link_instagram, user.link_twitter, RPayload.id])
    }
    return res.redirect('/profile-user');
}

export let getListFriend = async (req, res) => {
    const Rtoken = req.cookies.refresh_token;
    const RPayload = jwt.verify(Rtoken, process.env.TOKEN_SECRET);

    const hgetAsync = util.promisify(client.hGet).bind(client);
    const listFriend_str = await hgetAsync(RPayload.id, "List_friend");
    const friend = JSON.parse(listFriend_str);

    return res.render('listFriend.ejs', { friend: friend, userID: RPayload.id });
}

export let searchListFriend = async (req, res) => {
    const Rtoken = req.cookies.refresh_token;
    const RPayload = jwt.verify(Rtoken, process.env.TOKEN_SECRET);

    const hgetAsync = util.promisify(client.hGet).bind(client);
    const listFriend_str = await hgetAsync(RPayload.id, "List_friend");
    const listFriend_obj = JSON.parse(listFriend_str);

    const payload = req.body.payload;

    new Promise((resolve, reject) => {
        let friend = [];
        for (let i = 0; i < listFriend_obj.length; i++) {
            let username = listFriend_obj[i].username;
            if (username.startsWith(payload)) {
                friend.push(username);
            }
        }
        resolve(friend);
    })
        .then((friend) => {
            res.send({ friend });
        })
        .catch((err) => {
            console.error(err);
            res.status(500).send('Error occurred');
        });
}


// login form
export let getLoginForm = (req, res) => {
    return res.render('LoginPage.ejs')
}

export let getSignupForm = (req, res) => {
    return res.render('SignupPage.ejs')
}

export let logout = (req, res) => {
    return res.redirect('/');
}
