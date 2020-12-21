/*
    Datepicker Component init API

    uiView:                    // required - the view ui $('.selector') is in
    ui: $('.selector')         // if not defined uiView will be used
    position: {                // set by default to uiView.getBounds(ui)
        top: 1,
        left: 1,
    }

    state: {
        beginDate dayjs(),    // No dates selectable before this date
        endDate: dayjs(),     // No dates selectable after this date
        currentMonth: dayjs(),
        selectedDate: dayjs()
    }
*/

import { extend, result } from 'underscore';

import dayjs from 'dayjs';

import Component from 'js/base/component';

import { ActionsView, LayoutView, MonthPickerView, CalendarView } from './datepicker_views';

import StateModel from './datepicker_state.js';

const CLASS_OPTIONS = [
  'position',
  'uiView',
  'ui',
];

export default Component.extend({
  StateModel,
  stateEvents: {
    'change': 'show',
    'change:selectedDate': 'onChangeStateSelectedDate',
  },
  onChangeStateSelectedDate(state, selectedDate) {
    this.triggerMethod('change:selectedDate', selectedDate);
  },
  constructor(options) {
    this.mergeOptions(options, CLASS_OPTIONS);

    this.listenTo(this.uiView, 'render destroy', this.destroy);

    Component.apply(this, arguments);
  },
  ViewClass: LayoutView,
  onSelectToday() {
    this.selectDate(dayjs());
  },
  onSelectTomorrow() {
    this.selectDate(dayjs().add(1, 'days'));
  },
  onSelectClear() {
    this.selectDate(null);
  },
  onBeforeShow(datepicker, view) {
    view.showChildView('monthPicker', this.getMonthPickerView());
    view.showChildView('actions', this.getActionsView());
    view.showChildView('calendar', this.getCalendarView());
  },
  getMonthPickerView() {
    const model = this.getState();

    const monthPickerView = new MonthPickerView({ model });

    this.listenTo(monthPickerView, {
      'click:nextMonth': this.onSelectNextMonth,
      'click:prevMonth': this.onSelectPrevMonth,
    });

    return monthPickerView;
  },
  getActionsView() {
    const actionsView = new ActionsView();

    this.listenTo(actionsView, {
      'click:today': this.onSelectToday,
      'click:tomorrow': this.onSelectTomorrow,
      'click:clear': this.onSelectClear,
    });

    return actionsView;
  },
  onSelectNextMonth() {
    const state = this.getState();
    state.setCurrentMonth(state.getNextMonth());
  },
  onSelectPrevMonth() {
    const state = this.getState();
    state.setCurrentMonth(state.getPrevMonth());
  },
  getCalendarView() {
    const model = this.getState();

    const calView = new CalendarView({
      model,
      collection: model.getCalendar(),
    });

    this.listenTo(calView, {
      'select:date': this.onSelectDate,
    });

    return calView;
  },
  onSelectDate({ model }) {
    const date = model.get('date');
    const currentMonth = this.getState().getCurrentMonth();

    this.selectDate(currentMonth.date(date));
  },
  position() {
    return this.uiView.getBounds(this.ui);
  },
  regionOptions() {
    return extend({ popWidth: 256 }, result(this, 'position'));
  },
  selectDate(date) {
    if (date) {
      date = dayjs(date).startOf('day');
    }

    this.setState('selectedDate', date);
  },
});
