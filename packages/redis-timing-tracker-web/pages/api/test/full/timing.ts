import type { NextApiRequest, NextApiResponse } from 'next'
import newRedisClient from '../../../../redis/redisClient';

const JSON_FULL_TEST_INFO_PREFIX_KEY = 'fullTestRunInfo';

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    if (req.method === 'POST') {
        res.status(404).send('Not found')
    } else if (req.method === 'DELETE') {
        const { query: { timestamp } } = req;

        if (timestamp == null || Array.isArray(timestamp)) {
            res.status(200).send('Nothing to do');
            return;
        }
        const client = newRedisClient();
        await client.connect();

        const timestampNumber = parseInt(timestamp, 10);

        try {
            await Promise.all([
                client.json.del(`${JSON_FULL_TEST_INFO_PREFIX_KEY}:${timestampNumber}`),
                client.ts.del('fullTestTimeSeriesKey', timestampNumber, timestampNumber),
            ]);

            res.status(200).send('Deleted');
        } catch (e) {
            res.status(200).json(null);
        } finally {
            await client.disconnect();
        }

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
