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

        const { total, documents } = await client.ft.search('idx:runningTests', !search ? '*' : `@searchName:${search}`, { LIMIT: { from: 0, size: 15 }});

        let values: string[] = [];
        if (total > 0) {
            values = documents.map(({ value }) => value.searchName) as string[];
        }

        await client.disconnect();

        res.status(200).json(values)
    }
}
