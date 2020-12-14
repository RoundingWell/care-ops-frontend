import { isNull, map, range, times } from 'underscore';
import Backbone from 'backbone';
import hbs from 'handlebars-inline-precompile';
import dayjs from 'dayjs';

import intl from 'js/i18n';

import Component from 'js/base/component';
import Droplist from 'js/components/droplist';

import { LayoutView } from './dateselect_views';

import './date-select.scss';

const i18n = intl.components.dateSelect;

const monthsCollection = new Backbone.Collection(times(12, idx => {
  const month = dayjs().month(idx);

  return {
    value: idx,
    text: `${ month.format('MMMM') } (${ (idx + 1) })`,
  };
}));

// Possible years someone is still alive in
const thisYear = dayjs().year();
const yearRange = range(thisYear, (thisYear - 120), -1);

const yearsObj = map(yearRange, function(year) {
  return { value: year, text: String(year) };
});


const selectListOptions = ['buttonText', 'buttonClassName'];
const SelectList = Droplist.extend({
  picklistOptions: {
    isSelectlist: true,
  },
  viewOptions() {
    const buttonText = this.getOption('buttonText');
    let className = 'button-secondary date-select__button';

    if (this.getOption('buttonClassName')) {
      className = `${ className } ${ this.getOption('buttonClassName') }`;
    }

    return {
      className,
      template: hbs`{{ buttonText }}`,
      templateContext() {
        return {
          buttonText,
        };
      },
    };
  },
  initialize(options) {
    this.mergeOptions(options, selectListOptions);
  },
});

const StateModel = Backbone.Model.extend({
  defaults: {
    year: null,
    month: null,
    day: null,
    selectedDate: null,
    hasError: false,
  },
  reset() {
    this.set(this.defaults);
  },
});

export default Component.extend({
  ViewClass: LayoutView,
  StateModel,
  stateEvents: {
    'change': 'onChangeState',
    'change:selectedDate': 'onChangeSelectedDate',
    'change:hasError': 'show',
  },
  viewTriggers: {
    'click:cancel': 'click:cancel',
  },
  onChangeState() {
    if (this.getState('day') && !this.getState('selectedDate')) {
      const date = dayjs().year(this.getState('year')).month(this.getState('month')).date(this.getState('day'));
      this.setState({ selectedDate: date });
      return;
    }

    this.show();
  },
  onChangeSelectedDate(state, selectedDate) {
    this.triggerMethod('change:date', state, selectedDate);
  },
  onClickCancel() {
    this.getState().reset();
  },
  onBeforeShow(dateSelect, view) {
    if (this.getState('selectedDate')) return;

    if (!this.getState('year')) {
      this.showSelectList(this.getYearSelect(), {
        field: 'year',
        view,
      });
      return;
    }

    if (isNull(this.getState('month'))) {
      this.showSelectList(this.getMonthSelect(), {
        field: 'month',
        view,
      });
      return;
    }

    this.showSelectList(this.getDaySelect(), {
      field: 'day',
      view,
    });
  },
  getYearSelect() {
    return new SelectList({
      collection: new Backbone.Collection(yearsObj),
      buttonClassName: this.getOption('selectButtonClassName'),
      buttonText: i18n.yearPlaceholderText,
    });
  },
  getMonthSelect() {
    return new SelectList({
      collection: monthsCollection,
      buttonClassName: this.getOption('selectButtonClassName'),
      buttonText: i18n.monthPlaceholderText,
    });
  },
  getDaySelect() {
    return new SelectList({
      collection: this.getDayOpts(),
      buttonClassName: this.getOption('selectButtonClassName'),
      buttonText: i18n.dayPlaceholderText,
    });
  },
  showSelectList(component, { field, view }) {
    this.listenTo(component, 'change:selected', model => {
      this.setState(field, model.get('value'));
    });

    view.showChildView('selectRegion', component);
  },
  getDayOpts() {
    const date = dayjs().year(this.getState('year')).month(this.getState('month'));

    const daysInMonth = date.daysInMonth();
    const daysRange = range(1, daysInMonth + 1);

    const daysObj = map(daysRange, function(day) {
      return { value: day, text: String(day) };
    });

    return new Backbone.Collection(daysObj);
  },
});
