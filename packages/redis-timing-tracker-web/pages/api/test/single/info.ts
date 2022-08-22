import type { NextApiRequest, NextApiResponse } from 'next'
import newRedisClient from '../../../../redis/redisClient';

const JSON_TEST_INFO_PREFIX_KEY = 'testRunInfo';

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    if (req.method === 'POST') {
        res.status(404).send('Not found')
    } else {
        const { query: { testName, startedAt } } = req;

        const client = newRedisClient();
        await client.connect();

        try {

            const testInfoKey = `${JSON_TEST_INFO_PREFIX_KEY}:${testName}`;
            // TODO rtr better typing
            const infoResult: object[] | null = await client.json.get(testInfoKey, { path: `$.${startedAt}` }) as object[];

            const info = (infoResult !== null && infoResult.length > 0) ? infoResult[0] : null;

            res.status(200).json(info);
        } catch (e) {
            res.status(200).json(null);
        } finally {
            await client.disconnect();
        }

    }
}


