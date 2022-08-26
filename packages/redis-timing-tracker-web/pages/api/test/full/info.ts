import type { NextApiRequest, NextApiResponse } from 'next'
import newRedisClient from '../../../../redis/redisClient';

const JSON_FULL_TEST_INFO_PREFIX_KEY = 'fullTestRunInfo';

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    if (req.method === 'POST') {
        res.status(404).send('Not found')
    } else {
        const { query: { startTimestamp } } = req;

        const client = newRedisClient();
        await client.connect();

        try {
            // TODO rtr better typing
            const info: object[] | null = await client.json.get(`${JSON_FULL_TEST_INFO_PREFIX_KEY}:${startTimestamp}`) as object[];

            res.status(200).json(info);
        } catch (e) {
            res.status(200).json(null);
        } finally {
            await client.disconnect();
        }
    }
}

