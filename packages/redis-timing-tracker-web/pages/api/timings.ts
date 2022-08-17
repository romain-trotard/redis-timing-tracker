import type { NextApiRequest, NextApiResponse } from 'next'
import newRedisClient from '../../redis/redisClient';

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    if (req.method === 'POST') {
        res.status(404).send('Not found')
    } else {
        const { query: { testName } } = req;
        const testNameString = testName as string;

        const client = newRedisClient(); 
        await client.connect();

        const { firstTimestamp, lastTimestamp } = await client.ts.info(testNameString);
        const values = await client.ts.range(testNameString, firstTimestamp, lastTimestamp);

        await client.disconnect();

        res.status(200).json(values)
    }
}
