import redis from 'redis';
import { config as dotenv } from 'dotenv';
import workspacesRoot from "find-yarn-workspace-root";

dotenv({ path: `${workspacesRoot()}/.env` });

export default function newRedisClient() {
    return redis.createClient({
        socket: {
            host: process.env.REDIS_HOST,
            port: parseInt(process.env.REDIS_PORT as string, 10),
        },
        password: process.env.REDIS_PASSWORD,
    });
}
