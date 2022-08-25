import type { NextApiRequest, NextApiResponse } from 'next'
import newRedisClient from '../../../../redis/redisClient';

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    if (req.method === 'POST') {
        res.status(404).send('Not found')
    } else {
        const client = newRedisClient();
        await client.connect();

        try {
            const { firstTimestamp, lastTimestamp } = await client.ts.info('fullTestTimeSeriesKey');

            const values = await client.ts.range('fullTestTimeSeriesKey', firstTimestamp, lastTimestamp);

            res.status(200).json(values)
        } catch (e) {
            res.status(200).json(null);
        } finally {
            await client.disconnect();
        }

    }
}
