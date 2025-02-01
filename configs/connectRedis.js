import { createClient } from 'redis';

const client = createClient({
    username: 'default',
    password: 'VLdTU7ULa9qGNCHm1t80qO9wEE3OMw1t',
    socket: {
        host: 'redis-10043.crce178.ap-east-1-1.ec2.redns.redis-cloud.com',
        port: 10043
    }
});

client.on('error', err => console.log('Redis Client Error', err));

await client.connect();

export default client;

