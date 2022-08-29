import type { NextApiRequest, NextApiResponse } from 'next'
import newRedisClient from '../../../redis/redisClient';

const JSON_TEST_INFO_PREFIX_KEY = 'testRunInfo';
const JSON_PREFIX_KEY = 'runningTests';

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    if (req.method === 'DELETE') {
        const { query: { testName } } = req;

        if (!testName) {
            res.status(200).send('Nothing to do');
            return;
        }

        const client = newRedisClient();
        await client.connect();

        const testNameString = testName as string;

        try {
            const { firstTimestamp, lastTimestamp } = await client.ts.info(testNameString);
            const testInfoKey = `${JSON_TEST_INFO_PREFIX_KEY}:${testName}`;

                await Promise.all([
                    client.json.del(testInfoKey, '$'),
                    client.json.del(`${JSON_PREFIX_KEY}:${testName}`, '$'),
                    client.ts.del('fullTestTimeSeriesKey', firstTimestamp, lastTimestamp),
                ]);

            res.status(200).send('Deleted');
        } catch (e) {
            res.status(200).json(null);
        } finally {
            await client.disconnect();
        }

    } else {
        res.status(404).send('Not found')
    }
}

