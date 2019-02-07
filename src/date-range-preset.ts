import { DateTime } from 'luxon';
import { DateRangePickerInterval } from './data-range-interval';

export interface DateRangePickerPreset {
  name: string;
  startDate: DateTime;
  endDate: DateTime;
  interval: DateRangePickerInterval;
}
