import { LocalizedStringsMethods } from 'react-localization';
import { Duration } from 'luxon';

type IntervalName = 'day' | 'week' | 'month' | 'year';

export class DateRangePickerInterval {
  name: IntervalName = 'day';
  duration: Duration = Duration.fromObject({ days: 1 });

  constructor(unit: IntervalName, duration: Duration) {
    this.name = unit;
    this.duration = duration;
  }

  get value() {
    return this.duration.as(this.name);
  }
}

export interface IntervalNamesLocalization extends LocalizedStringsMethods {
  day: string;
  days: string;
  week: string;
  weeks: string;
  month: string;
  months: string;
  year: string;
  years: string;
}
