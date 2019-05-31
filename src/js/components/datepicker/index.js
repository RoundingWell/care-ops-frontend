/*
    Datepicker Component init API

    uiView:                    // required - the view ui $('.selector') is in
    ui: $('.selector')         // if not defined uiView will be used
    position: {                // set by default to uiView.getBounds(ui)
        top: 1,
        left: 1,
    }

    state: {
        beginDate moment(),    // No dates selectable before this date
        endDate: moment(),     // No dates selectable after this date
        currentMonth: moment(),
        selectedDate: moment()
    }
*/

import _ from 'underscore';

import moment from 'moment';

import Component from 'js/base/component';

import { LayoutView, HeaderView, CalendarView } from './datepicker_views';

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
    'change:selectedDate': 'onChangeSelectedDate',
  },
  onChangeSelectedDate(state, selectedDate) {
    // proxy state event to component
    this.triggerMethod('state:change:selectedDate', state, selectedDate);
  },
  initialize(options) {
    this.mergeOptions(options, CLASS_OPTIONS);

    this.listenTo(this.uiView, 'render destroy', this.destroy);
  },
  ViewClass: LayoutView,
  viewEvents: {
    'click:today': 'onSelectToday',
    'click:tomorrow': 'onSelectTomorrow',
    'click:clear': 'onSelectClear',
  },
  onSelectToday() {
    this.selectDate(moment());
  },
  onSelectTomorrow() {
    this.selectDate(moment().add(1, 'days'));
  },
  onSelectClear() {
    this.selectDate(null);
  },
  onShow(datepicker, view) {
    view.showChildView('header', this.getHeaderView());
    view.showChildView('calendar', this.getCalendarView());
  },
  getHeaderView() {
    const model = this.getState();

    const headerView = new HeaderView({ model });

    this.listenTo(headerView, {
      'click:nextMonth': this.onSelectNextMonth,
      'click:prevMonth': this.onSelectPrevMonth,
    });

    return headerView;
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
    return _.extend({ popWidth: 256 }, _.result(this, 'position'));
  },
  selectDate(date) {
    if (date) {
      date = moment(date).startOf('day');
    }

    this.setState('selectedDate', date);
  },
});
