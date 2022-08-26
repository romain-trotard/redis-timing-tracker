import { AggregatedResult, AssertionResult, TestContext } from '@jest/test-result';
import newRedisClient from './newRedisClient.js';
import { FULL_TEST_MESSAGE_TYPE, TEST_MESSAGE_TYPE, TIMING_TOPIC } from './constant.js';
import { FullTestsTimingMessage, TestTimingMessage } from './types.js';
import child_process from 'child_process';

function getCurrentCommitSha() {
    try {
        return child_process.execSync('git rev-parse HEAD')
            .toString().trim();
    } catch (e) {
        return undefined;
    }
}

export default class JestTimingReporter {
    redisClient: ReturnType<typeof newRedisClient>;
    commitSha: string | undefined;

    constructor() {
        this.redisClient = newRedisClient();
        this.commitSha = getCurrentCommitSha();
    }

    async processSingleTest(test: AssertionResult, startTimestamp: number) {
        const { duration, title: name, failureMessages: errors, ancestorTitles: describeNames } = test;

        if (duration != null) {
            const message: TestTimingMessage = { type: TEST_MESSAGE_TYPE, duration, describeNames, name, hasError: errors.length > 0, startTimestamp, commitSha: this.commitSha };

            await this.redisClient.publish(TIMING_TOPIC, JSON.stringify(message));
        }
    }

    async processWholeTestResult(startTimestamp: number, endedAt: number, numberOfTests: number) {
        const message: FullTestsTimingMessage = { type: FULL_TEST_MESSAGE_TYPE, duration: endedAt - startTimestamp, startTimestamp, numberOfTests, commitSha: this.commitSha };

        await this.redisClient.publish(TIMING_TOPIC, JSON.stringify(message));
    }

    async process(results: AggregatedResult) {
        await this.redisClient.connect();

        const hasFailingTest = results.numFailedTests > 0;
        const numberOfTests = results.numTotalTests;

        await Promise.all([
            ...results.testResults.flatMap(testFile => testFile.testResults.map(test => this.processSingleTest(test, testFile.perfStats.start))),
            // For now do not send timing when there are some tests with errors
            hasFailingTest ? undefined : this.processWholeTestResult(results.startTime, new Date().getTime(), numberOfTests),
        ]);

        await this.redisClient.disconnect();
    }

    onRunComplete(_: Set<TestContext>, results: AggregatedResult) {
        this.process(results);
    }

    getLastError() { }
}

