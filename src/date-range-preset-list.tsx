import * as React from 'react';

// import 'react-day-picker/lib/style.css';
import * as styles from './date-range-preset-list.scss';

import bind from 'bind-decorator';
import { DateRangePickerPreset } from './date-range-preset';

interface DateRangePresetListProps {
  onSelect?: (preset: DateRangePickerPreset) => void;
  presets: DateRangePickerPreset[];
}

export class DateRangePresetList extends React.Component<DateRangePresetListProps, {}> {

  @bind
  handlePresetClick(preset: DateRangePickerPreset) {
    if (this.props.onSelect) {
      this.props.onSelect(preset);
    }
  }

  render(): JSX.Element {
    const presetItems = this.props.presets.map(
      (preset) => <div
          key={ preset.name }
          className={ styles.dateRangePreset }
          onClick={ () => this.handlePresetClick(preset)}>
            <h3 className={ styles.dateRangePresetName }>{ preset.name }</h3>
            <p className={ styles.dateRangePresetRange }>
              <span>{ preset.startDate.format('DD.MM.YYYY') }</span>
              <span className={ styles.dateRangePresetRangeArrow } aria-label='until'></span>
              <span>{ preset.endDate.format('DD.MM.YYYY') }</span>
            </p>
        </div>
    );
    return <div className={ styles.dateRangePresetList }>
      { presetItems }
    </div>;
  }
}
