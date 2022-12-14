import type { NextApiRequest, NextApiResponse } from 'next'
import newRedisClient from '../../redis/redisClient';

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    if (req.method === 'POST') {
        res.status(404).send('Not found')
    } else {
        const { query: { search } } = req;

        const client = newRedisClient();
        await client.connect();

        try {
            const { total, documents } = await client.ft.search('idx:runningTests', !search ? '*' : `@uniqueTestName:${search}`, { LIMIT: { from: 0, size: 15 } });

            let values: string[] = [];
            if (total > 0) {
                values = documents.map(({ value }) => value.uniqueTestName) as string[];
            }

            res.status(200).json(values)
        } catch (e) {
            res.status(200).json([]);
        } finally {
            await client.disconnect();
        }
    }
}
