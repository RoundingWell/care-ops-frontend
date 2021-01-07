import { noop } from 'underscore';

import Component from 'js/base/component';
import Datepicker from 'js/components/datepicker';

import { DateView, MonthView, RelativeDateView, DefaultDateView, ActionsView } from './date-filter_views';
import StateModel from './date-filter_state';

const DateFilterPickerComponent = Datepicker.extend({
  getActionsView() {
    const actionsView = new ActionsView();

    this.listenTo(actionsView, {
      'click:yesterday': this.onClickYesterday,
      'click:today': this.onClickToday,
      'click:currentMonth': this.onClickCurrentMonth,
    });

    return actionsView;
  },
  onClickYesterday() {
    this.triggerMethod('select:yesterday');
  },
  onClickToday() {
    this.triggerMethod('select:today');
  },
  onClickCurrentMonth() {
    this.triggerMethod('select:currentMonth');
  },
  onSelectToday: noop,
});

export default Component.extend({
  StateModel,
  stateEvents: {
    'change': 'show',
  },
  ViewClass() {
    const state = this.getState();

    if (state.get('selectedDate')) return DateView;

    if (state.get('selectedMonth')) return MonthView;

    if (state.get('relativeDate')) return RelativeDateView;

    return DefaultDateView;
  },
  viewOptions() {
    return {
      model: this.getState(),
    };
  },
  viewTriggers: {
    'click': 'click',
  },
  onClick() {
    const state = this.getState();

    const datePicker = new DateFilterPickerComponent({
      ui: this.getView().$el,
      uiView: this.getView(),
      state: state.pick('selectedDate', 'selectedMonth'),
      canSelectMonth: true,
    });

    this.listenTo(datePicker, {
      'select:yesterday'() {
        state.setRelativeDate('yesterday');
        datePicker.destroy();
      },
      'select:today'() {
        state.setRelativeDate('today');
        datePicker.destroy();
      },
      'select:currentMonth'() {
        state.setRelativeDate(null);
        datePicker.destroy();
      },
      'change:selectedDate'(date) {
        state.setDate(date);
        datePicker.destroy();
      },
      'change:selectedMonth'(month) {
        state.setMonth(month);
        datePicker.destroy();
      },
    });

    datePicker.show();
  },
});
