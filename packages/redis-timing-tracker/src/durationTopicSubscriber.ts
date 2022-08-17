import { SchemaFieldTypes } from 'redis';
import { DURATION_TOPIC, TEST_MESSAGE_TYPE, FULL_TEST_MESSAGE_TYPE } from './constant.js';
import newRedisClient from './newRedisClient.js';
import { AllDurationMessage, TestDurationMessage } from './types';
import 'dotenv/config';

const JSON_PREFIX_KEY = 'runningTests';

async function createRedisSearchIndex(redisClient: ReturnType<typeof newRedisClient>) {
    try {
        await redisClient.ft.create(
            `idx:${JSON_PREFIX_KEY}`,
            {
                '$.searchName': {
                    type: SchemaFieldTypes.TEXT,
                    SORTABLE: true,
                    AS: 'searchName'
                }
            },
            { ON: 'JSON', PREFIX: JSON_PREFIX_KEY }
        );
    } catch (e: any) {
        if (e.message !== 'Index already exists') {
            throw e;
        }
    }
}

async function createRedisTimeSeries(redisClient: ReturnType<typeof newRedisClient>, timeSeriesKey: string) {
    try {
        await redisClient.ts.create(timeSeriesKey);
    } catch (e: any) {
        if (e.message !== 'ERR TSDB: key already exists') {
            throw e;
        }
    }
}

async function run() {
    const subscribeClient = newRedisClient();
    const redisClient = newRedisClient();

    await subscribeClient.connect();
    await redisClient.connect();

    await createRedisSearchIndex(redisClient);


    await subscribeClient.subscribe(DURATION_TOPIC, async stringMessage => {
        const toto: AllDurationMessage = JSON.parse(stringMessage);

        switch (toto.type) {
            case FULL_TEST_MESSAGE_TYPE:
                // TODO rtr implement this!!
                break;
            case TEST_MESSAGE_TYPE:
                const { duration, describeNames, name, hasError, startedAt } = toto as TestDurationMessage;

                // Do nothing for the moment if there is an error on the test
                if (hasError) {
                    return;
                }

                // We concat the describe names with the test name
                const searchName = [...describeNames, name].join(' ');

                await createRedisTimeSeries(redisClient, searchName);

                await Promise.all([
                    redisClient.ts.add(searchName, startedAt, duration),
                    redisClient.json.set(`${JSON_PREFIX_KEY}:${searchName}`, '$', { describeNames, name, searchName }),
                ]);

                break;
        }
    });
}

run();

