import { View } from 'marionette';
import { isNull } from 'underscore';
import dayjs from 'dayjs';

import DateSelectTemplate from './date-select.hbs';

const LayoutView = View.extend({
  template: DateSelectTemplate,
  regions: {
    selectRegion: '[data-select-region]',
  },
  ui: {
    cancel: '.js-cancel',
  },
  triggers: {
    'click @ui.cancel': 'click:cancel',
  },
  formatDate() {
    const state = this.getOption('state');

    if (state.selectedDate) {
      const date = dayjs(state.selectedDate);
      return date.format('MMM DD, YYYY');
    }

    if (!isNull(state.month)) {
      const date = dayjs().month(state.month).year(state.year);
      return date.format('MMM YYYY');
    }

    return state.year;
  },
  templateContext() {
    const state = this.getOption('state');

    return {
      date: this.formatDate(),
      hasError: state.hasError,
      isDisabled: state.isDisabled,
    };
  },
});

export {
  LayoutView,
};
