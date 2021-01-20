import { noop } from 'underscore';

import Component from 'js/base/component';
import Datepicker from 'js/components/datepicker';

import { DateView, MonthView, RelativeDateView, DefaultDateView, ControllerView, ActionsView, FilterTypeView } from './date-filter_views';
import StateModel from './date-filter_state';

const DateFilterPickerComponent = Datepicker.extend({
  stateEvents: {
    'change': 'show',
    'change:selectedDate': 'onChangeStateSelectedDate',
    'change:selectedMonth': 'onChangeStateSelectedMonth',
    'change:dateType': 'onChangeDateType',
  },
  onBeforeShow(datepicker, view) {
    view.showChildView('header', this.getFilterTypeView());
    view.showChildView('monthPicker', this.getMonthPickerView());
    view.showChildView('actions', this.getActionsView());
    view.showChildView('calendar', this.getCalendarView());
  },
  getFilterTypeView() {
    const filterTypeView = new FilterTypeView({
      model: this.getState(),
    });

    this.listenTo(filterTypeView, {
      'click:created': () => this.onClickType('created_at'),
      'click:updated': () => this.onClickType('updated_at'),
      'click:due': () => this.onClickType('due_date'),
    });

    return filterTypeView;
  },
  getActionsView() {
    const actionsView = new ActionsView();

    this.listenTo(actionsView, {
      'click:yesterday': this.onClickYesterday,
      'click:today': this.onClickToday,
      'click:currentMonth': this.onClickCurrentMonth,
    });

    return actionsView;
  },
  onChangeDateType() {
    this.getView().showChildView('header', this.getFilterTypeView());
  },
  onClickYesterday() {
    this.triggerMethod('select:yesterday', this.getState('dateType'));
  },
  onClickToday() {
    this.triggerMethod('select:today', this.getState('dateType'));
  },
  onClickCurrentMonth() {
    this.triggerMethod('select:currentMonth', this.getState('dateType'));
  },
  onClickType(type) {
    this.setState('dateType', type);
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
    this.showDatePicker(this.getState().pick('selectedDate', 'selectedMonth', 'dateType'));
  },
  showDatePicker(currentState) {
    const state = this.getState();

    const datePicker = new DateFilterPickerComponent({
      ui: this.getView().$el,
      uiView: this.getView(),
      state: currentState,
      canSelectMonth: true,
    });

    this.listenTo(datePicker, {
      'select:yesterday'() {
        state.setRelativeDate('yesterday', currentState.dateType);
        datePicker.destroy();
      },
      'select:today'() {
        state.setRelativeDate('today', currentState.dateType);
        datePicker.destroy();
      },
      'select:currentMonth'() {
        state.setRelativeDate(null, currentState.dateType);
        datePicker.destroy();
      },
      'change:selectedDate'(date) {
        state.setDate(date, currentState.dateType);
        datePicker.destroy();
      },
      'change:selectedMonth'(month) {
        state.setMonth(month, currentState.dateType);
        datePicker.destroy();
      },
    });

    this.listenTo(datePicker.getState(), 'change:dateType', (datepickerState, dateType) => {
      this.showDatePicker({ dateType });
    });

    datePicker.show();
  },
});
