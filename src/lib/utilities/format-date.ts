import { formatDistanceToNow, parseJSON } from 'date-fns';
import * as dateTz from 'date-fns-tz'; // `build` script fails on importing some of named CommonJS modules

import type { Timestamp } from '$types';

type ValidTime = Parameters<typeof parseJSON>[0] | Timestamp;

const pattern = 'yyyy-MM-dd z H:mm:ss:SS';

export function formatDate(
  date: ValidTime,
  timeFormat: TimeFormat = 'UTC',
): string {
  if (!date) return '';

  try {
    if (isTimestamp(date)) {
      date = timestampToDate(date);
    }

    const parsed = parseJSON(date);

    if (timeFormat === 'local') return dateTz.format(parsed, pattern);
    if (timeFormat === 'relative') return formatDistanceToNow(parsed) + ' ago';

    return dateTz.formatInTimeZone(parsed, 'UTC', pattern);
  } catch {
    return '';
  }
}

function timestampToDate(ts: Timestamp): Date {
  if (!isTimestamp(ts)) {
    throw new TypeError('provided value is not a timestamp');
  }

  const d = new Date(null);

  d.setTime(Number(ts.seconds) * 1000 + ts.nanos / 1000);

  return d;
}

function isTimestamp(arg: unknown): arg is Timestamp {
  if (typeof arg === 'object') {
    return arg['seconds'] !== undefined && arg['nanos'] !== undefined;
  }
  return false;
}
