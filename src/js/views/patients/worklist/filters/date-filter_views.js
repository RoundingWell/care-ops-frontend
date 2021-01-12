import { View } from 'marionette';
import hbs from 'handlebars-inline-precompile';
import dayjs from 'dayjs';

import intl from 'js/i18n';

import Tooltip from 'js/components/tooltip';

const DateView = View.extend({
  tagName: 'button',
  className: 'button-filter js-date',
  template: hbs`
    {{far "calendar-alt"}}{{~ remove_whitespace ~}}
    {{@intl.patients.worklist.filters.dateFilterViews.added}} {{formatDateTime selectedDate "MM/DD/YYYY"}}{{far "angle-down"}}
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
    {{ @intl.patients.worklist.filters.dateFilterViews.added }} {{formatDateTime selectedMonth "MMM YYYY"}}{{far "angle-down"}}
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
    {{ @intl.patients.worklist.filters.dateFilterViews.added }} {{date}}{{far "angle-down"}}
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
    {{ @intl.patients.worklist.filters.dateFilterViews.added}} {{ @intl.patients.worklist.filters.dateFilterViews.defaultDateView.thisMonth }}{{far "angle-down"}}
  `,
  triggers: {
    'click': 'click',
  },
});

const ControllerView = View.extend({
  template: hbs`
    <button class="button-secondary--compact is-icon-only u-margin--r-8 js-prev">{{far "angle-left"}}</button>{{~ remove_whitespace ~}}
    <div class="inl-bl" data-date-picker-region></div>{{~ remove_whitespace ~}}
    <button class="button-secondary--compact is-icon-only u-margin--l-8 js-next">{{far "angle-right"}}</button>
  `,
  regions: {
    datepicker: '[data-date-picker-region]',
  },
  ui: {
    next: '.js-next',
    prev: '.js-prev',
  },
  childViewTriggers: {
    'click': 'click:date',
  },
  triggers: {
    'click @ui.prev': 'click:prev',
    'click @ui.next': 'click:next',
  },
  onRender() {
    const DatePickerViewClass = this.getOption('datePickerViewClass');
    this.showChildView('datepicker', new DatePickerViewClass({
      model: this.model,
    }));

    this.getTooltips();
  },
  getTooltips() {
    const tooltipMessages = this.getTooltipMessages();

    new Tooltip({
      message: tooltipMessages.prevMessage,
      uiView: this,
      ui: this.ui.prev,
    });

    new Tooltip({
      message: tooltipMessages.nextMessage,
      uiView: this,
      ui: this.ui.next,
    });
  },
  getTooltipMessages() {
    if (this.model.get('selectedDate')) {
      return this._getTooltipMessage(this.model.dayjs('selectedDate'), 'day', 'MM/DD/YYYY');
    }

    if (this.model.get('selectedMonth')) {
      return this._getTooltipMessage(this.model.dayjs('selectedMonth'), 'month', 'MMM YYYY');
    }

    if (this.model.get('relativeDate') === 'today') {
      return this._getTooltipMessage(dayjs(), 'day', 'MM/DD/YYYY');
    }

    if (this.model.get('relativeDate') === 'yesterday') {
      return this._getTooltipMessage(dayjs().subtract(1, 'day'), 'day', 'MM/DD/YYYY');
    }

    return this._getTooltipMessage(dayjs(), 'month', 'MMM YYYY');
  },
  _getTooltipMessage(ts, unit, format) {
    return {
      prevMessage: dayjs(ts).subtract(1, unit).format(format),
      nextMessage: dayjs(ts).add(1, unit).format(format),
    };
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
  ControllerView,
};
