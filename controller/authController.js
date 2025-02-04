// import User from '../configs/regisUser.js';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';
dotenv.config();
import { NotFoundError } from "../services/utility.js";
import { sendEmailVerify } from '../services/email.js';
import { v4 as uuidv4 } from 'uuid';
// import checkingUser from '../configs/connectDB_passportjs.js';
// import connection from '../configs/connectDB.js';

// Register a new User
export let register = async (req, res) => {
    try {
        // check email and phone number of new user
        const data = await connection.execute('SELECT * FROM `information_of_users` WHERE email = ? OR mobilenumber = ?', [req.body.email, req.body.mobilenumber]);
        if (typeof data[0][0] !== 'undefined') {
            res.send({ message: '0' });
        } else {
            // generate random id for user
            const userID = uuidv4();
            //Hash password
            const salt = await bcrypt.genSalt(10);
            const hasPassword = await bcrypt.hash(req.body.password, salt);
            const replace_hasPassword = hasPassword.replaceAll("/", "~");
            const user = {
                mobile: req.body.mobilenumber,
                email: req.body.email,
                name: req.body.username,
                password: req.body.password,
                userID: userID,
            }
            const string_user = JSON.stringify(user);
            await client.hSet('new_user', userID, string_user);
            await sendEmailVerify(req.body.email, replace_hasPassword, userID);
            res.send({ message: '1' });
        }

    }
    catch (err) {
        res.status(500).send({ error: err });
        console.log("error in regiser user")
    }
};

export let login = async (req, res) => {
    try {
        // Check user exist
        const user = await User.login(req.body);
        if (user) {
            const validPass = await bcrypt.compare(req.body.password, user[0].password);
            // if password is wrong
            if (!validPass) {
                return res.send({ message: '0' });
            } else {
                // Create and assign token
                const Atoken = await jwt.sign({ id: user[0].userID }, process.env.TOKEN_SECRET, { expiresIn: '10m' });
                // store token in cookie so that people cant access token in brower using javascript 
                await res.cookie('access_token', Atoken, {
                    httpOnly: true,
                    //secure: true;
                })

                // create refesh token 
                const Rtoken = await jwt.sign({ id: user[0].userID }, process.env.TOKEN_SECRET, { expiresIn: '30d' });
                await res.cookie('refresh_token', Rtoken, {
                    httpOnly: true,
                    //secure: true;
                })
                res.send({ message: '1' });
            }

        } else {
            // if user dont exist
            res.send({ message: '0' });
        }
    }
    catch (err) {
        if (err instanceof NotFoundError) {
            res.status(401).send(`Mobile/Email or Password is wrong`);
        }
        else {
            console.log(err);
            let error_data = {
                entity: 'User',
                model_obj: { param: req.params, body: req.body },
                error_obj: err,
                error_msg: err.message
            };
            res.status(500).send("Error retrieving User");
        }
    }
};


export let logout = async (req, res) => {
    try {
        const Rtoken = req.cookies.refresh_token;
        const RPayload = jwt.verify(Rtoken, process.env.TOKEN_SECRET);
        const time_now = Math.round(Date.now() / 1000);
        const time_live = RPayload.exp - time_now;

        await client.hSet(RPayload.id, Rtoken, "");
        await client.expire(`${RPayload.id}:${Rtoken}`, time_live);
        return res.status(200).redirect('/');
    }
    catch (error) {
        console.log("error", error);
    }
}


export let init_RToken_AToken_for_FB_GG = async (req, res, next) => {
    var result = await checkingUser(req.user);

    // Create and assign token
    const Atoken = jwt.sign({ id: req.user.id }, process.env.TOKEN_SECRET, { expiresIn: '10m' }); // req.user is id of user
    // store token in cookie so that people cant access token in brower using javascript 
    await res.cookie('access_token', Atoken, {
        httpOnly: true,
        //secure: true;
    })

    // create refesh token 
    const Rtoken = jwt.sign({ id: req.user.id }, process.env.TOKEN_SECRET, { expiresIn: '30d' });
    await res.cookie('refresh_token', Rtoken, {
        httpOnly: true,
        //secure: true;
    })

    res.redirect('/home');
}

export let checkingCookie = (req, res, next) => {
    const refreshToken = req.cookies.refresh_token;
    const accessToken = req.cookies.access_token;
    // Check if tokens exist
    if (!refreshToken || !accessToken) {
        return res.redirect('/login-form');
    } else {
        next();
    }
}


