import { createClient } from 'redis';

const redisClient = createClient({
    username: 'default',
    password: 'VLdTU7ULa9qGNCHm1t80qO9wEE3OMw1t',
    socket: {
        host: 'redis-10043.crce178.ap-east-1-1.ec2.redns.redis-cloud.com',
        port: 10043
    }
});

redisClient.on('error', err => console.log('Redis Client Error', err));

await redisClient.connect();

export default redisClient;

