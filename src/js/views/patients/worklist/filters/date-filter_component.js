import { noop } from 'underscore';

import Component from 'js/base/component';
import Datepicker from 'js/components/datepicker';

import { DateView, MonthView, RelativeDateView, DefaultDateView, ControllerView, ActionsView } from './date-filter_views';
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
  ViewClass: ControllerView,
  viewOptions() {
    const state = this.getState();
    let datePickerViewClass = DefaultDateView;

    if (state.get('selectedDate')) datePickerViewClass = DateView;

    if (state.get('selectedMonth')) datePickerViewClass = MonthView;

    if (state.get('relativeDate')) datePickerViewClass = RelativeDateView;

    return {
      model: this.getState(),
      datePickerViewClass,
    };
  },
  viewTriggers: {
    'click:date': 'click:date',
  },
  viewEvents: {
    'click:prev'() {
      this.getState().incrementBackward();
    },
    'click:next'() {
      this.getState().incrementForward();
    },
  },
  onClickDate() {
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
