import { Duration } from 'luxon';

export function getHumanDurationValue(milliseconds: number) {
    const minutes = Duration.fromMillis(milliseconds).as('minutes');
    const realMinutes = Math.trunc(minutes);

    const seconds = Duration.fromObject({ minutes: minutes - realMinutes }).as('seconds');
    const realSeconds = Math.trunc(seconds);

    const ms = Duration.fromObject({ seconds: seconds - realSeconds }).as('milliseconds');
    const realMs = Math.trunc(ms);

    return Duration.fromObject({
        minutes: realMinutes === 0 ? undefined : realMinutes,
        seconds: realSeconds === 0 ? undefined : realSeconds,
        milliseconds: realMs === 0 ? undefined : realMs,
    }).toHuman({ unitDisplay: 'short' });
}
