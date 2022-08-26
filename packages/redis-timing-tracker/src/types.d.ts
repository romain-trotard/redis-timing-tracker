import { TEST_MESSAGE_TYPE, FULL_TEST_MESSAGE_TYPE } from './constant';

export enum TimingMessageEnum {
    TEST_TIMING_MESSAGE,
    FULL_TEST_TIMING_MESSAGE,
}

type TimingMessage<TTimingMessageType extends TimingMessageEnum> = {
    duration: number;
    startTimestamp: number;
    commitSha: string | undefined;
}

export type TestTimingMessage = TimingMessage<TimingMessageEnum.TEST_DURATION_MESSAGE> & {
    type: TEST_MESSAGE_TYPE;
    name: string;
    describeNames: string[];
    hasError: boolean;
}

export type FullTestsTimingMessage = TimingMessage<TimingMessageEnum.FULL_TEST_DURATION_MESSAGE> & {
    type: FULL_TEST_MESSAGE_TYPE;
    numberOfTests: number;
}

export type AllTimingMessage = TestTimingMessage | FullTestsTimingMessage;

