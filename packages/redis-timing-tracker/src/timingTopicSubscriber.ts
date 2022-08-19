import { SchemaFieldTypes } from 'redis';
import { TIMING_TOPIC, TEST_MESSAGE_TYPE, FULL_TEST_MESSAGE_TYPE, FULL_TEST_TIME_SERIES_KEY } from './constant.js';
import newRedisClient from './newRedisClient.js';
import { AllTimingMessage, FullTestsTimingMessage, TestTimingMessage } from './types';
import 'dotenv/config';

const JSON_PREFIX_KEY = 'runningTests';
const JSON_FULL_TEST_KEY = 'fullTests';

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

async function createFullTestSearchIndex(redisClient: ReturnType<typeof newRedisClient>) {
    try {
        await redisClient.ft.create(
            // Actually it works so let's remove the TS error
            // @ts-ignore
            `idx:${JSON_FULL_TEST_KEY}`,
            {
                // '$.toto': {
                //     type: SchemaFieldTypes.TEXT,
                //     SORTABLE: true,
                //     AS: 'searchName'
                // },
                // '$.startedAt': {
                //     type: SchemaFieldTypes.NUMERIC,
                // }
                // startedAt: SchemaFieldTypes.NUMERIC,
                '$.startedAt': {
                    type: SchemaFieldTypes.NUMERIC,
                    SORTABLE: true,
                    AS: 'startedAt',
                }
            },
            { ON: 'JSON', PREFIX: JSON_FULL_TEST_KEY}
        );
    } catch (e: any) {
        if (e.message !== 'Index already exists') {
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


    await subscribeClient.subscribe(TIMING_TOPIC, async stringMessage => {
        const message: AllTimingMessage = JSON.parse(stringMessage);

        switch (message.type) {
            case FULL_TEST_MESSAGE_TYPE: {
                const { duration, startedAt, numberOfTests } = message as FullTestsTimingMessage;

                await Promise.all([
                    // initializeFullTestJSON(redisClient),
                    createFullTestSearchIndex(redisClient),
                    createRedisTimeSeries(redisClient, FULL_TEST_TIME_SERIES_KEY),
                ]);


                await Promise.all([
                    redisClient.ts.add(FULL_TEST_TIME_SERIES_KEY, startedAt, duration),
                    // Actually this is not what I have tot do!!
                    // redisClient.json.arrAppend(JSON_FULL_TEST_KEY, '$', { startedAt, duration, numberOfTests }),
                    redisClient.json.set(`${JSON_FULL_TEST_KEY}:${startedAt}`, '$', { startedAt, duration, numberOfTests }),
                ]);

                break;
            }
            case TEST_MESSAGE_TYPE: {
                const { duration, describeNames, name, hasError, startedAt } = message as TestTimingMessage;

                // Do nothing for the moment if there is an error on the test
                if (hasError) {
                    return;
                }

                // We concat the describe names with the test name
                const searchName = [...describeNames, name].join(' ');

                await createRedisTimeSeries(redisClient, searchName);

                await Promise.all([
                    redisClient.ts.add(searchName, startedAt, duration),
                    redisClient.json.set(`${JSON_PREFIX_KEY}:${searchName}`, '$', { describeNames, name, searchName, latestRunTimestamp: startedAt }),
                ]);

                break;
            }
        }
    });
}

run();

