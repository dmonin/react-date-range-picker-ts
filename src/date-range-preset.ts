import { DateRangePickerInterval } from './data-range-interval';
import * as moment from 'moment';

export interface DateRangePickerPreset {
  name: string;
  startDate: moment.Moment;
  endDate: moment.Moment;
  interval: DateRangePickerInterval;
}
