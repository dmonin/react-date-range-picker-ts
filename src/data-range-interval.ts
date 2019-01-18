import { LocalizedStringsMethods } from 'react-localization';
import * as moment from 'moment';

export interface DateRangePickerInterval {
  name: [string, string];
  value: number;
  unit: moment.unitOfTime.Base;
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

export const createInterval = (
  l10n: IntervalNamesLocalization,
  name: moment.unitOfTime.Base,
  value: number = 1): DateRangePickerInterval => {
  return {
    name: [l10n[name], l10n[name + 's']],
    value,
    unit: name
  };
};
