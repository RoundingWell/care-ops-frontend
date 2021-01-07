import { View } from 'marionette';
import hbs from 'handlebars-inline-precompile';

import intl from 'js/i18n';

const DateView = View.extend({
  tagName: 'button',
  className: 'button-filter js-date',
  template: hbs`
    {{far "calendar-alt"}}{{~ remove_whitespace ~}}
    {{@intl.patients.worklist.filters.dateFilterViews.added}} {{formatDateTime selectedDate "MM/DD/YYYY"}}
  `,
  triggers: {
    'click': 'click',
  },
});

const MonthView = View.extend({
  tagName: 'button',
  className: 'button-filter js-date',
  template: hbs`
    {{far "calendar-alt"}}{{~ remove_whitespace ~}}
    {{ @intl.patients.worklist.filters.dateFilterViews.added }} {{formatDateTime selectedMonth "MMM YYYY"}}
  `,
  triggers: {
    'click': 'click',
  },
});

const RelativeDateView = View.extend({
  tagName: 'button',
  className: 'button-filter js-date',
  template: hbs`
    {{far "calendar-alt"}}{{~ remove_whitespace ~}}
    {{ @intl.patients.worklist.filters.dateFilterViews.added }} {{date}}
  `,
  templateContext() {
    return {
      date: intl.patients.worklist.filters.dateFilterViews.relativeDateView[this.model.get('relativeDate')],
    };
  },
  triggers: {
    'click': 'click',
  },
});

const DefaultDateView = View.extend({
  tagName: 'button',
  className: 'button-filter js-date',
  template: hbs`
    {{far "calendar-alt"}}{{~ remove_whitespace ~}}
    {{ @intl.patients.worklist.filters.dateFilterViews.added}} {{ @intl.patients.worklist.filters.dateFilterViews.defaultDateView.thisMonth }}
  `,
  triggers: {
    'click': 'click',
  },
});

const ActionsView = View.extend({
  template: hbs`
    <button class="datepicker__button js-yesterday">{{ @intl.patients.worklist.filters.dateFilterViews.actionViews.yesterday }}</button>{{~ remove_whitespace ~}}
    <button class="datepicker__button js-today">{{ @intl.patients.worklist.filters.dateFilterViews.actionViews.today }}</button>{{~ remove_whitespace ~}}
    <button class="datepicker__button js-current-month">{{ @intl.patients.worklist.filters.dateFilterViews.actionViews.month }}</button>
  `,
  triggers: {
    'click .js-yesterday': 'click:yesterday',
    'click .js-today': 'click:today',
    'click .js-current-month': 'click:currentMonth',
  },
});

export {
  DateView,
  MonthView,
  RelativeDateView,
  DefaultDateView,
  ActionsView,
};
