import { SchemaFieldTypes } from 'redis';
import { TIMING_TOPIC, TEST_MESSAGE_TYPE, FULL_TEST_MESSAGE_TYPE, FULL_TEST_TIME_SERIES_KEY } from './constant.js';
import newRedisClient from './newRedisClient.js';
import { AllTimingMessage, FullTestsTimingMessage, TestTimingMessage } from './types';

const JSON_PREFIX_KEY = 'runningTests';
const JSON_TEST_INFO_PREFIX_KEY = 'testRunInfo';
const JSON_FULL_TEST_INFO_PREFIX_KEY = 'fullTestRunInfo';

async function createRedisSearchIndex(redisClient: ReturnType<typeof newRedisClient>) {
    try {
        await redisClient.ft.create(
            `idx:${JSON_PREFIX_KEY}`,
            {
                '$.uniqueTestName': {
                    type: SchemaFieldTypes.TEXT,
                    SORTABLE: true,
                    AS: 'uniqueTestName'
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
            `idx:${JSON_FULL_TEST_INFO_PREFIX_KEY}`,
            {
                '$.startTimestamp': {
                    type: SchemaFieldTypes.NUMERIC,
                    SORTABLE: true,
                    AS: 'startTimestamp',
                }
            },
            { ON: 'JSON', PREFIX: JSON_FULL_TEST_INFO_PREFIX_KEY }
        );
    } catch (e: any) {
        if (e.message !== 'Index already exists') {
            throw e;
        }
    }
}

async function createTestInfoByRunJson(redisClient: ReturnType<typeof newRedisClient>, key: string) {
    const info = await redisClient.json.type(key);

    if (info === null) {
        await redisClient.json.set(key, '$', {});
    }
}

async function run() {
    const subscribeClient = newRedisClient();
    const redisClient = newRedisClient();

    await subscribeClient.connect();
    await redisClient.connect();

    await Promise.all([
        // Init for full tests
        createFullTestSearchIndex(redisClient),
        createRedisTimeSeries(redisClient, FULL_TEST_TIME_SERIES_KEY),
        // Init for single tests
        createRedisSearchIndex(redisClient),
    ]);


    await subscribeClient.subscribe(TIMING_TOPIC, async stringMessage => {
        const message: AllTimingMessage = JSON.parse(stringMessage);

        try {
            switch (message.type) {
                case FULL_TEST_MESSAGE_TYPE: {
                    const { duration, startTimestamp, numberOfTests, commitSha } = message as FullTestsTimingMessage;

                    await Promise.all([
                        redisClient.ts.add(FULL_TEST_TIME_SERIES_KEY, startTimestamp, duration),
                        redisClient.json.set(`${JSON_FULL_TEST_INFO_PREFIX_KEY}:${startTimestamp}`, '$', { startTimestamp, commitSha: commitSha ?? null, duration, numberOfTests }),
                    ]);

                    break;
                }
                case TEST_MESSAGE_TYPE: {
                    const { duration, describeNames, name, hasError, startTimestamp, commitSha } = message as TestTimingMessage;

                    // Do nothing for the moment if there is an error on the test
                    if (hasError) {
                        return;
                    }

                    // We concat the describe names with the test name
                    const uniqueTestName = [...describeNames, name].join(' ');
                    const testInfoKey = `${JSON_TEST_INFO_PREFIX_KEY}:${uniqueTestName}`;


                    // Init for each test (depends on the name of the test)
                    await Promise.all([
                        createRedisTimeSeries(redisClient, uniqueTestName),
                        createTestInfoByRunJson(redisClient, testInfoKey),
                    ]);

                    await Promise.all([
                        // The key is when the test has been started, because it's unique
                        redisClient.json.set(testInfoKey, `$.${startTimestamp}`, { startTimestamp, commitSha: commitSha ?? null, duration }),
                        redisClient.ts.add(uniqueTestName, startTimestamp, duration),
                        redisClient.json.set(`${JSON_PREFIX_KEY}:${uniqueTestName}`, '$', { describeNames, name, uniqueTestName, latestRunTimestamp: startTimestamp }),
                    ]);

                    break;
                }
            }
        } catch (e) {
            console.error('An error occured', e);
        }
    });
}

run();

