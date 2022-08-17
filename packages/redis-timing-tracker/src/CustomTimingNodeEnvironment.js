import { TestEnvironment as NodeEnvironment } from 'jest-environment-node';
import { TIMING_TOPIC, FULL_TEST_MESSAGE_TYPE, TEST_MESSAGE_TYPE } from './constant.js';
import newRedisClient from './newRedisClient.js';
import 'dotenv/config';

const client = newRedisClient();
client.on('error', err => console.log('Redis Client Error', err));

export default class CustomTimingNodeEnvironment extends NodeEnvironment {
    constructor(config, context) {
        super(config, context);
        this.startTime = new Date();
    }

    async setup() {
        await client.connect();
        await super.setup();
    }

    async teardown() {
        await client.disconnect();
        await super.teardown();
    }

    async handleTestEvent(event) {
        if (event.name === 'test_done') {
            const { test } = event;
            const { duration, name, errors, startedAt } = test;
            let { parent } = test;
            let describeNames = [];

            while (parent.name !== 'ROOT_DESCRIBE_BLOCK') {
                describeNames.push(parent.name);
                parent = parent.parent;
            }

            const message = { type: TEST_MESSAGE_TYPE, duration, describeNames, name, hasError: errors.length > 0, startedAt };

            await client.publish(TIMING_TOPIC, JSON.stringify(message));
        } else if (event.name === 'teardown') {
            const message = { type: FULL_TEST_MESSAGE_TYPE, duration: new Date() - this.startTime, startedAt: this.startTime.getTime() };
            await client.publish(TIMING_TOPIC, JSON.stringify(message));
        }
    }
}

