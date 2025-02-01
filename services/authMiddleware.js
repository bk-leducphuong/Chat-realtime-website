import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
dotenv.config;
import util from 'util';

/****************** Redis connection ***********************/
// import { createClient } from 'redis';

// /* Connect to redis cloud */
// const client = createClient({
//     password: process.env.REDIS_PASSWORD,
//     socket: {
//         host: process.env.REDIS_HOST,
//         port: process.env.REDIS_PORT
//     },
//     // legacyMode: true
// });

// client.on('error', err => console.log('Redis Client Error', err))
// await client.connect();


export let loggedIn = async function (req, res, next) {
    try {
        // get access token and refresh token
        const Rtoken = req.cookies.refresh_token;
        let Atoken = req.cookies.access_token;
        const RPayload = jwt.verify(Rtoken, process.env.TOKEN_SECRET); // kiểm tra xem refresh token có hợp lệ hay còn hiệu lực hay không 
        const hexistAsync = util.promisify(client.hExists).bind(client);
        const result = await hexistAsync(RPayload.id, Rtoken);

        if (result == 1) {
            res.redirect('/login-form');
        }
        const APayload = jwt.verify(Atoken, process.env.TOKEN_SECRET, { ignoreExpiration: true }); // dòng này chỉ để lấy data của access token
        const time_now = Math.round(Date.now() / 1000); //get thời gian(giây) hiện tại so với năm 1970
        // Nếu access token hết hạn thì cấp cho access token mới 
        if (time_now >= APayload.exp) {
            Atoken = jwt.sign({ id: APayload.id }, process.env.TOKEN_SECRET, { expiresIn: '10m' });
            next();
        } else if (time_now < APayload.exp) {
            next();
        }
    } catch (error) {
        console.log("error :", error);
        res.redirect('/');
    }
}

