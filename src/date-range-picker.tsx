import * as React from 'react';
import * as ReactDOM from 'react-dom';

import './day-picker-original.scss';
import './day-picker.scss';

import { Modal } from './modal';
import { DateRangePresetList } from './date-range-preset-list';
import { IntervalNamesLocalization, createInterval } from './data-range-interval';
import { DateRangePickerPreset } from './date-range-preset';

import { LocalizedStringsMethods } from 'react-localization';
import bind from 'bind-decorator';
import DayPicker from 'react-day-picker';
import * as moment from 'moment';

import * as styles from './date-range-picker.scss';
import * as dpStyles from './day-picker.scss';

export interface DateRangePickerLocalization extends LocalizedStringsMethods, IntervalNamesLocalization {
  days: string;
  day: string;
}

interface DateRangePickerProps {
  name?: string;
  initialStartDate?: moment.Moment;
  initialEndDate?: moment.Moment;
  onChange?: (dateStart: moment.Moment, dateEnd: moment.Moment) => void;
  presets?: DateRangePickerPreset[];
  l10n: DateRangePickerLocalization;
}

interface DateRangePickerState {
  isRightSide: boolean;
  startDateText: string;
  endDateText: string;
  windowWidth: number;
  windowHeight: number;
  isExpanded: boolean;
  highlightStartDate: moment.Moment;
  highlightEndDate: moment.Moment;
  preset: DateRangePickerPreset;
  showCalendar: boolean;
  showPresets: boolean;
  isStartDateSelect: boolean;
}
export class DateRangePicker extends React.Component<DateRangePickerProps, DateRangePickerState> {
  domNode: HTMLDivElement | null = null;
  dateFormat: string = 'DD.MM.YY';
  startDate: moment.Moment = moment();
  endDate: moment.Moment = moment();

  constructor(props: DateRangePickerProps) {
    super(props);

    let dayInterval = 14;
    this.startDate =  this.props.initialStartDate || moment().subtract(dayInterval, 'days');
    this.endDate = this.props.initialEndDate || moment();
    dayInterval = this.endDate.diff(this.startDate, 'days') + 1;

    this.state = {
      isRightSide: false,
      windowWidth: 0,
      windowHeight: 0,
      preset: {
        name: dayInterval + ' ' + this.props.l10n.days,
        startDate: this.startDate,
        endDate: this.endDate,
        interval: createInterval(this.props.l10n, 'day', dayInterval)
      },
      startDateText: this.startDate.format(this.dateFormat),
      endDateText: this.endDate.format(this.dateFormat),
      showPresets: false,
      showCalendar: true,
      isExpanded: false,
      isStartDateSelect: true,
      highlightStartDate: this.startDate,
      highlightEndDate: this.endDate
    };
  }

  componentDidMount() {
    this.domNode = ReactDOM.findDOMNode(this) as HTMLDivElement;
    this.updateWindowDimensions();
    window.addEventListener('resize', this.updateWindowDimensions);

    if (this.props.name) {
      const selectedType = localStorage.getItem(this.props.name + '_type');
      this.setState({
        showCalendar: selectedType == 'calendar',
        showPresets: selectedType != 'calendar'
      });
    }
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.updateWindowDimensions);
  }

  getRange(): [moment.Moment, moment.Moment] {
    return [this.state.highlightStartDate, this.state.highlightEndDate];
  }

  @bind
  handlePeriodBack(): void {
    const startDate = this.state.highlightStartDate;
    const interval = this.state.preset.interval;
    startDate.subtract(interval.value, interval.unit);
    const endDate = this.state.highlightEndDate;
    endDate.subtract(interval.value, interval.unit).endOf(interval.unit);

    const pluralIndex = interval.value == 1 ? 0 : 1;
    const preset = {
      name: interval.value + ` ${interval.name[pluralIndex]}`,
      interval,
      startDate,
      endDate
    };

    this.setState({
      highlightStartDate: startDate,
      highlightEndDate: endDate,
      preset,
      startDateText: startDate.format(this.dateFormat),
      endDateText: endDate.format(this.dateFormat)
    });

    this.setDateRange(startDate, endDate);
  }

  @bind
  handlePeriodNext(): void {
    const startDate = this.state.highlightStartDate;
    const interval = this.state.preset.interval;
    startDate.add(interval.value, interval.unit);
    const endDate = this.state.highlightEndDate;
    endDate.add(interval.value, interval.unit).endOf(interval.unit);

    const preset = this.state.preset;
    const pluralIndex = interval.value == 1 ? 0 : 1;
    preset.name = interval.value + ` ${interval.name[pluralIndex]}`;
    this.setState({
      highlightStartDate: startDate,
      highlightEndDate: endDate,
      preset,
      startDateText: startDate.format(this.dateFormat),
      endDateText: endDate.format(this.dateFormat)
    });

    this.setDateRange(startDate, endDate);
  }

  @bind
  handleToggle(e: React.MouseEvent<Element>): void {
    const target = e.target as Element;

    if (target.tagName.toLowerCase() == 'input') {
      e.stopPropagation();
      return;
    }

    const isExpanded = !this.state.isExpanded;

    this.setState({
      highlightStartDate: this.startDate,
      highlightEndDate: this.endDate,
      isExpanded
    });

    this.updateInputTexts(this.startDate, this.endDate);
  }

  @bind
  handleTogglePresets(): void {
    const isShowCalendar = !this.state.showCalendar;
    this.setState({
      showCalendar: isShowCalendar,
      showPresets: !isShowCalendar
    });

    if (this.props.name) {
      const type = isShowCalendar ? 'calendar' : 'presets';
      localStorage.setItem(this.props.name + '_type', type);
    }
  }

  @bind
  handleDayClick(day: Date): void {
    if (this.state.isStartDateSelect) {
      this.startDate = moment(day);
      this.setState({
        isStartDateSelect: false
      });
    } else {
      this.setState({
        isStartDateSelect: true,
        isExpanded: false
      });

      this.setDateRange(...this.getRange());
    }
  }

  @bind
  handleDayMouseEnter(day: Date): void {
    const preset = this.state.preset as DateRangePickerPreset;
    preset.startDate = this.startDate;
    preset.endDate = this.endDate;

    if (this.state.isStartDateSelect) {
      preset.startDate = moment(day);
      if (preset.startDate.isAfter(preset.endDate)) {
        preset.endDate = preset.startDate;
      }
    } else {
      preset.endDate = moment(day);

      if (preset.endDate.isBefore(preset.startDate)) {
        preset.startDate = preset.endDate;
      }
    }

    const days = preset.endDate.diff(preset.startDate, 'days') + 1;
    preset.name = days == 1 ? days + ' ' + this.props.l10n.day : days + ' ' + this.props.l10n.days;
    preset.interval = createInterval(this.props.l10n, 'day', days);

    this.setState({
      highlightStartDate: preset.startDate,
      highlightEndDate: preset.endDate,
      preset
    });

    this.updateInputTexts(preset.startDate, preset.endDate);
  }

  @bind
  handleDayMouseLeave(day: Date): void {
    this.setState({
      highlightStartDate: this.startDate,
      highlightEndDate: this.endDate
    });
  }

  @bind
  handleFocus(inputName: string): void {
    this.setState({
      isStartDateSelect: inputName == 'start'
    });
  }

  @bind
  handleInputDateStartChange(e: React.ChangeEvent<HTMLInputElement>): void {
    const startDate = moment(e.target.value, [this.dateFormat, 'YYYY-MM-DD']);
    const endDate = this.endDate;

    if (startDate.isValid) {
      this.setState({
        highlightStartDate: startDate,
        highlightEndDate: startDate.isAfter(this.state.highlightEndDate) ?
          startDate : endDate
      });
    }

    this.setState({
      startDateText: e.target.value
    });
  }

  @bind
  handleInputDateEndChange(e: React.ChangeEvent<HTMLInputElement>): void {
    const startDate = this.startDate;
    const endDate = moment(e.target.value, [this.dateFormat, 'YYYY-MM-DD']);

    if (endDate.isValid) {
      this.setState({
        highlightStartDate: endDate.isBefore(this.state.highlightStartDate) ?
          endDate : startDate,
        highlightEndDate: endDate
      });
    }

    this.setState({
      endDateText: e.target.value
    });
  }

  @bind
  handleInputBlur() {
    this.startDate = this.state.highlightStartDate;
    this.endDate = this.state.highlightEndDate;
    this.updateInputTexts(this.startDate, this.endDate);
    this.setDateRange(this.startDate, this.endDate);
  }

  updateInputTexts(startDate: moment.Moment, endDate: moment.Moment) {
    this.setState({
      startDateText: startDate.format(this.dateFormat),
      endDateText: endDate.format(this.dateFormat)
    });
  }

  @bind
  handlePresetSelect(preset: DateRangePickerPreset): void {
    this.setState({
      highlightStartDate: preset.startDate,
      highlightEndDate: preset.endDate,
      preset,
      isExpanded: false
    });

    this.setDateRange(preset.startDate, preset.endDate);
    this.updateInputTexts(preset.startDate, preset.endDate);
  }

  setDateRange(startDate: moment.Moment, endDate: moment.Moment) {
    this.startDate = startDate;
    this.endDate = endDate;

    if (this.props.onChange) {
      this.props.onChange(startDate, endDate);
    }
  }

  @bind
  updateWindowDimensions() {
    const windowWidth = window.innerWidth;
    if (this.domNode) {
      const rect = this.domNode.getBoundingClientRect();
      const width = 700;
      const layerLeft = rect.left;

      const isRightSide = layerLeft + width > windowWidth;

      this.setState({
        isRightSide
      });
    }

    this.setState({
      windowWidth,
      windowHeight: window.innerHeight
    });
  }

  render(): JSX.Element {

    let left = 0;
    let top = 0;
    if (this.state.isExpanded && this.domNode) {
      const rect = this.domNode.getBoundingClientRect();

      const width = 700;
      left = rect.left;
      top = rect.top;
      if (document && document.documentElement && document.documentElement.scrollTop > 0) {
        top += document.documentElement.scrollTop;
      }

      if (this.state.isRightSide) {
        left = this.state.windowWidth - width;
      }
    }

    const modifiers = {
      start: this.state.highlightStartDate.toDate(),
      end: this.state.highlightEndDate.toDate()
    };

    return <div className={`${styles.dateRangePicker} ${this.state.isExpanded ? styles.expanded : ''}`}>
      <div className={styles.dateRangePickerDisplay}>
        <div className={ styles.arrowLeft} onClick={ this.handlePeriodBack }></div>

        <div className={ styles.caption} onClick={ this.handleToggle }>
          <div className={ styles.captionPreset }>
            { this.state.preset ? this.state.preset.name : '' }
          </div>
          <div className={ styles.captionDates }>

            { this.state.isExpanded ?
              <input
                type='text'
                className={ `${styles.captionInput} ${ this.state.isStartDateSelect ? styles.focused : ''}` }
                onFocus={ () => this.handleFocus('start') }
                onBlur={ this.handleInputBlur }
                onChange={ this.handleInputDateStartChange }
                value={ this.state.startDateText } />
              :
              <div className={ styles.captionInput}>{ this.state.startDateText }</div>
            }
            <span className={ styles.arrow } />
            { this.state.isExpanded ?
              <input
                className={ `${styles.captionInput} ${ !this.state.isStartDateSelect ? styles.focused : ''}` }
                type='text'
                onFocus={ () => this.handleFocus('end') }
                onBlur={ this.handleInputBlur }
                onChange={ this.handleInputDateEndChange }
                value={ this.state.endDateText } />
              :
              <div className={ styles.captionInput}>{ this.state.endDateText }</div>
            }
          </div>
        </div>

        <div className={ styles.arrowRight} onClick={ this.handlePeriodNext }></div>
      </div>

      { this.state.isExpanded &&
        <Modal left={ left } top={ top }>
          <div className={ `${styles.dateRangePickerLayer} ${this.state.isRightSide && styles.alignRight}` }>
            <div className={ styles.actions}>
              <div className={ styles.switchButton }>
                <div className={ this.state.showCalendar ?
                  styles.switchButtonItemActive : styles.switchButtonItem }
                  onClick={ this.handleTogglePresets }>Calendar</div>
                <div className={ this.state.showPresets ?
                  styles.switchButtonItemActive : styles.switchButtonItem }
                  onClick={ this.handleTogglePresets }>Presets</div>
              </div>
            </div>

            { this.state.showPresets && this.props.presets &&
              <div className={ styles.dateRangePickerLayerContainer }>
                <DateRangePresetList onSelect={ this.handlePresetSelect } presets={ this.props.presets } />
              </div>
            }

            { this.state.showCalendar &&
            <div className={ styles.dayPickerContainer }>
              <DayPicker
                classNames={ {
                  container: dpStyles.dayPicker,
                  wrapper: dpStyles.dayPickerContainer,
                  interactionDisabled: dpStyles.dayPickerDisabled,
                  navBar: dpStyles.dayPickerNav,
                  navButtonPrev: dpStyles.dayPickerNavButtonPrev,
                  navButtonNext: dpStyles.dayPickerNavButtonNext,
                  navButtonInteractionDisabled: dpStyles.disabled,

                  months: dpStyles.dayPickerMonths,
                  month: dpStyles.dayPickerMonth,
                  caption: dpStyles.dayPickerCaption,
                  weekdays: dpStyles.dayPickerWeekdays,
                  weekdaysRow: dpStyles.dayPickerWeekdaysRow,
                  weekday: dpStyles.dayPickerWeekday,
                  body: dpStyles.dayPickerBody,
                  week: dpStyles.dayPickerWeek,
                  day: dpStyles.dayPickerDay,

                  today: dpStyles.today,
                  selected: dpStyles.selected,
                  disabled: dpStyles.disabled,
                  outside: dpStyles.outside
                } }
                numberOfMonths={ 2 }
                modifiers={ modifiers }
                selectedDays={[
                  this.state.highlightStartDate.toDate(),
                  {
                    from: this.state.highlightStartDate.toDate(),
                    to: this.state.highlightEndDate.toDate()
                  }]
                }
                onDayClick={ this.handleDayClick }
                onDayMouseEnter={ this.handleDayMouseEnter }
                onDayMouseLeave={ this.handleDayMouseLeave }
              />
            </div>
            }

            {/* <div className={ styles.compareTo }>
              <strong className={ styles.compareToLabel }>Compare to</strong>

              <div className={ styles.compareToSelectWrap }>
                <select className={ styles.compareToSelect }>
                  <option selected disabled>Please choose</option>
                  <option>A</option>
                  <option>B</option>
                  <option>C</option>
                </select>
              </div>
            </div> */}
          </div>
        </Modal>
      }

    </div>;
  }
}
