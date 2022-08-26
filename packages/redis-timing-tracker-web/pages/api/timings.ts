import type { NextApiRequest, NextApiResponse } from 'next'
import newRedisClient from '../../redis/redisClient';

const JSON_TEST_INFO_PREFIX_KEY = 'testRunInfo';

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    if (req.method === 'POST') {
        res.status(404).send('Not found')
    } else if (req.method === 'DELETE') {
        const { query: { timestamp, testName } } = req;
        const testNameString = testName as string;

        if (timestamp == null || Array.isArray(timestamp)) {
            res.status(200).send('Nothing to do');
            return;
        }
        const client = newRedisClient();
        await client.connect();

        const timestampNumber = parseInt(timestamp, 10);

        try {
            const testInfoKey = `${JSON_TEST_INFO_PREFIX_KEY}:${testName}`;

            await Promise.all([
                client.json.del(testInfoKey, `$.${timestampNumber}`),
                client.ts.del(testNameString, timestampNumber, timestampNumber),
            ]);

            res.status(200).send('Deleted');
        } catch (e) {
            res.status(200).json(null);
        } finally {
            await client.disconnect();
        }

    } else {
        const { query: { testName } } = req;
        const testNameString = testName as string;

        const client = newRedisClient();
        await client.connect();

        try {
            const { firstTimestamp, lastTimestamp } = await client.ts.info(testNameString);
            const values = await client.ts.range(testNameString, firstTimestamp, lastTimestamp);

            res.status(200).json(values)
        } catch (e) {
            res.status(200).json(null);
        } finally {
            await client.disconnect();
        }
    }
}
