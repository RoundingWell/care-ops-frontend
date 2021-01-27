import { noop } from 'underscore';
import Backbone from 'backbone';

import collectionOf from 'js/utils/formatting/collection-of';
import Component from 'js/base/component';
import Datepicker from 'js/components/datepicker';

import { ControllerView, ActionsView, FilterTypeView } from './date-filter_views';
import StateModel from './date-filter_state';

const dateTypes = ['create_at', 'updated_at', 'due_date'];

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
      collection: this.getOption('collection'),
    });

    this.listenTo(filterTypeView, 'click', this.onClickType);

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
  onClickType({ model }) {
    this.setState('dateType', model.id);
  },
  onSelectToday: noop,
});

export default Component.extend({
  dateTypes,
  StateModel,
  stateEvents: {
    'change': 'show',
  },
  ViewClass: ControllerView,
  viewOptions() {
    return {
      model: this.getState(),
    };
  },
  viewEvents: {
    'click:date'() {
      this.showDatePicker(this.getState().pick('selectedDate', 'selectedMonth', 'dateType'));
    },
    'click:prev'() {
      this.getState().incrementBackward();
    },
    'click:next'() {
      this.getState().incrementForward();
    },
  },
  initialize() {
    this.dateTypes = new Backbone.Collection(collectionOf(this.getOption('dateTypes'), 'id'));
  },
  showDatePicker(currentState) {
    const state = this.getState();

    const datePicker = new DateFilterPickerComponent({
      ui: this.getView().$el,
      uiView: this.getView(),
      state: currentState,
      canSelectMonth: true,
      collection: this.dateTypes,
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
