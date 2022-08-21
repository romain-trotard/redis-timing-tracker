import { DateTime } from "luxon";

export function getDisplayDateTime(timestamp: number) {
    return DateTime.fromMillis(timestamp).toLocaleString(DateTime.DATETIME_SHORT);
}

