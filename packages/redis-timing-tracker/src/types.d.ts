import { TEST_MESSAGE_TYPE, FULL_TEST_MESSAGE_TYPE } from './constant';

export enum DurationMessageEnum {
    TEST_DURATION_MESSAGE,
    FULL_TEST_DURATION_MESSAGE,
}

type DurationMessage<TDurationMessageType extends DurationMessageEnum> = {
    duration: number;
    startedAt: number;
}

export type TestDurationMessage = DurationMessage<DurationMessageEnum.TEST_DURATION_MESSAGE> & {
    type: TEST_MESSAGE_TYPE;
    name: string;
    describeNames: string[];
    hasError: boolean;
}

export type FullTestsDurationMessage = DurationMessage<DurationMessageEnum.FULL_TEST_DURATION_MESSAGE> & {
    type: FULL_TEST_MESSAGE_TYPE;
}

export type AllDurationMessage = TestDurationMessage | FullTestsDurationMessage;

