import type { NextApiRequest, NextApiResponse } from 'next'
import newRedisClient from '../../../../redis/redisClient';


const JSON_FULL_TEST_KEY = 'fullTests';

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
            // TODO rtr to see later why TS not happy
            // @ts-ignore
            const latestRunEntry = await client.ft.search(`idx:${JSON_FULL_TEST_KEY}`, '*', {
                LIMIT: {
                    from: 0,
                    size: 1,
                },
                SORTBY: {
                    BY: 'startedAt',
                    DIRECTION: 'DESC',
                },
            });

            const valueToParse = latestRunEntry.documents[0].value['$'];
            const latestRunInfo = valueToParse !== null ? JSON.parse(valueToParse.toString()) : null;

            res.status(200).json(latestRunInfo)
        } catch (e) {
            res.status(200).json(null);
        } finally {
            await client.disconnect();
        }
    }
}

