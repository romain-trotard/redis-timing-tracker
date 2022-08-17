import * as redis from 'redis';
import 'dotenv/config';

export default function newRedisClient() {
    return redis.createClient({
        socket: {
            host: process.env.REDIS_HOST,
            port: parseInt(process.env.REDIS_PORT as string, 10),
        },
        password: process.env.REDIS_PASSWORD,
    });
}

