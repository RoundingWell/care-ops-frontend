import { times } from 'underscore';
import dayjs from 'dayjs';
import hbs from 'handlebars-inline-precompile';
import { View, CollectionView, Region } from 'marionette';

import './datepicker.scss';

const LayoutView = View.extend({
  className: 'datepicker',
  regionClass: Region.extend({ replaceElement: true }),
  regions: {
    header: '[data-header-region]',
    calendar: '[data-calendar-region]',
    monthPicker: '[data-month-picker-region]',
    actions: '[data-actions-region]',
  },
  template: hbs`
    <div data-header-region></div>
    <div data-month-picker-region></div>
    <div class="datepicker__body">
      {{#each dayOfWeek}}<div class="datepicker__day">{{formatDateTime this "dd"}}</div>{{/each}}
      <div data-calendar-region></div>
    </div>
    <div data-actions-region></div>
  `,
  templateContext() {
    const dayOfWeek = times(7, index => {
      return dayjs().weekday(index);
    });

    return { dayOfWeek };
  },
});

const ActionsView = View.extend({
  template: hbs`
    <button class="datepicker__button js-today">{{ @intl.components.datepicker.today }}</button>{{~ remove_whitespace ~}}
    <button class="datepicker__button js-tomorrow">{{ @intl.components.datepicker.tomorrow }}</button>{{~ remove_whitespace ~}}
    <button class="datepicker__button js-clear">{{ @intl.components.datepicker.clear }}</button>
  `,
  triggers: {
    'click .js-today': 'click:today',
    'click .js-tomorrow': 'click:tomorrow',
    'click .js-clear': 'click:clear',
  },
});

const MonthPickerView = View.extend({
  className: 'datepicker__header',
  triggers: {
    'click .js-next': 'click:nextMonth',
    'click .js-prev': 'click:prevMonth',
  },
  template: hbs`
    {{formatDateTime currentMonth "MMM YYYY"}}
    <span class="datepicker__nav">
      <button class="js-prev">{{fas "caret-left"}} {{formatDateTime prevMonth "MMM"}}</button>
      <button class="js-next">{{formatDateTime nextMonth "MMM"}} {{fas "caret-right"}}</button>
    </span>
  `,
  templateContext() {
    return {
      nextMonth: this.model.getNextMonth(),
      prevMonth: this.model.getPrevMonth(),
    };
  },
});

const CellView = View.extend({
  className() {
    if (this.model.get('isOtherMonth')) {
      return 'is-other-month';
    }
    if (this.model.get('isDisabled')) {
      return 'is-disabled';
    }
  },
  tagName: 'li',
  getTemplate() {
    if (this.model.get('isOtherMonth') || this.model.get('isDisabled')) {
      return hbs`{{ date }}`;
    }

    return hbs`<a class="{{#if isSelected}}is-selected{{/if}}{{#if isToday}} is-today{{/if}}">{{ date }}</a>`;
  },
  triggers: {
    'click a': 'select',
  },
});

const CalendarView = CollectionView.extend({
  className: 'datepicker__days',
  tagName: 'ul',
  childView: CellView,
  childViewTriggers: {
    'select': 'select:date',
  },
});

export {
  ActionsView,
  LayoutView,
  MonthPickerView,
  CalendarView,
};
