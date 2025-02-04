// import User from '../configs/regisUser.js';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';
dotenv.config();
import { NotFoundError } from "../services/utility.js";
import { sendEmailVerify } from '../services/email.js';
// import checkingUser from '../configs/connectDB_passportjs.js';
import dbConnection from '../configs/connectDB.js';
import redisClient from '../configs/connectRedis.js';

// Register a new User
export let register = async (req, res) => {
    try {
        const { email, mobilenumber, username, password } = req.body;
        if (!email || !mobilenumber || !username || !password) {
            return res.send({ message: '0' });
        }
        // Check if user already exist
        const [data, fields] = await dbConnection.execute('SELECT * FROM `users` WHERE `email` = ?', [email]);
        if (data.length > 0) {
            res.send({ message: '0' });
        } else {    
            // Hash password
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(password, salt);

            // Save user to database
            await dbConnection.execute('INSERT INTO `users` (`email`, `mobile_number`, `username`, `password_hash`) VALUES (?, ?, ?, ?)', [email, mobilenumber, username, hashedPassword]);
            res.send({ message: '1' });
        }

    }
    catch (err) {
        console.log(err);
        res.status(500).send({ error: err });
    }
};

export let login = async (req, res) => {
    try {
        const { email, password } = req.body;
        // Check user exist
        const [data, fields] = await dbConnection.execute('SELECT * FROM `users` WHERE `email` = ?', [email]);
        if (data.length > 0) {
            const validPass = await bcrypt.compare(password, data[0].password_hash);
            // if password is wrong
            if (!validPass) {
                return res.send({ message: '0' });
            } else {
                // create access token
                const Atoken = jwt.sign({ userId: data[0].user_id, username: data[0].username }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: process.env.ACCESS_TOKEN_EXPIRY });
                // store token in cookie so that people cant access token in brower using javascript 
                await res.cookie('access_token', Atoken, {
                    httpOnly: true,
                    //secure: true;
                })

                // create refresh token 
                const Rtoken = jwt.sign({ userId: data[0].user_id, username: data[0].username }, process.env.REFRESH_TOKEN_SECRET, { expiresIn: process.env.REFRESH_TOKEN_EXPIRY });
                await res.cookie('refresh_token', Rtoken, {
                    httpOnly: true,
                    //secure: true;
                })

                // store refresh token in redis
                await dbConnection.execute('UPDATE `users` SET `refresh_token` = ? WHERE `user_id` = ?', [Rtoken, data[0].user_id]);
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




