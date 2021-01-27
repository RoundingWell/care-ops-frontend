import { View, CollectionView } from 'marionette';
import hbs from 'handlebars-inline-precompile';
import dayjs from 'dayjs';

import Tooltip from 'js/components/tooltip';

import './date-filter.scss';

const TypeView = View.extend({
  tagName: 'span',
  className: 'datepicker__filter-button',
  template: hbs`{{formatMessage (intlGet "patients.shared.components.dateFilterComponent.dateTypes") type=id }}`,
  onRender() {
    this.$el.toggleClass('is-active', this.getOption('selected') === this.model.id);
  },
  triggers: {
    'click': 'click',
  },
});

const FilterTypeView = CollectionView.extend({
  className: 'datepicker__type-filter',
  childViewContainer: '.js-types',
  childView: TypeView,
  template: hbs`
    <span class="datepicker__filter-label">Filter by Date</span>{{~ remove_whitespace ~}}
    <span class="js-types"></span>
  `,
  childViewTriggers: {
    'click': 'click',
  },
  childViewOptions() {
    return {
      selected: this.model.get('dateType'),
    };
  },
});

const DateTemplate = hbs`{{formatDateTime selectedDate "MM/DD/YYYY"}}{{far "angle-down"}}`;

const MonthTemplate = hbs`{{formatDateTime selectedMonth "MMM YYYY"}}{{far "angle-down"}}`;

const RelativeTemplate = hbs`{{formatMessage (intlGet "patients.shared.components.dateFilterComponent.dateFilterViews.relativeTemplate.relative") relativeTo=relativeDate }}{{far "angle-down"}}`;

const DefaultTemplate = hbs`{{ @intl.patients.shared.components.dateFilterComponent.dateFilterViews.defaultTemplate.thisMonth }}{{far "angle-down"}}`;

const ControllerView = View.extend({
  template: hbs`
    <button class="button-secondary--compact is-icon-only u-margin--r-8 js-prev">{{far "angle-left"}}</button>{{~ remove_whitespace ~}}
    <button class="button-filter js-date">
      {{far "calendar-alt"}}{{~ remove_whitespace ~}}
      {{formatMessage (intlGet "patients.shared.components.dateFilterComponent.dateTypes") type=dateType }}{{~ remove_whitespace ~}}:
      <span data-date-picker-label-region></span>
    </button>{{~ remove_whitespace ~}}
    <button class="button-secondary--compact is-icon-only u-margin--l-8 js-next">{{far "angle-right"}}</button>
  `,
  regions: {
    datepicker: {
      el: '[data-date-picker-label-region]',
      replaceElement: true,
    },
  },
  ui: {
    next: '.js-next',
    prev: '.js-prev',
    date: '.js-date',
  },
  triggers: {
    'click @ui.prev': 'click:prev',
    'click @ui.next': 'click:next',
    'click @ui.date': 'click:date',
  },
  getLabelTemplate() {
    if (this.model.get('selectedDate')) return DateTemplate;
    if (this.model.get('selectedMonth')) return MonthTemplate;
    if (this.model.get('relativeDate')) return RelativeTemplate;
    return DefaultTemplate;
  },
  onRender() {
    this.showChildView('datepicker', {
      tagName: 'span',
      model: this.model,
      template: this.getLabelTemplate(),
    });

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
    <button class="datepicker__button js-yesterday">{{ @intl.patients.shared.components.dateFilterComponent.dateFilterViews.actionViews.yesterday }}</button>{{~ remove_whitespace ~}}
    <button class="datepicker__button js-today">{{ @intl.patients.shared.components.dateFilterComponent.dateFilterViews.actionViews.today }}</button>{{~ remove_whitespace ~}}
    <button class="datepicker__button js-current-month">{{ @intl.patients.shared.components.dateFilterComponent.dateFilterViews.actionViews.month }}</button>
  `,
  triggers: {
    'click .js-yesterday': 'click:yesterday',
    'click .js-today': 'click:today',
    'click .js-current-month': 'click:currentMonth',
  },
});

export {
  ActionsView,
  ControllerView,
  FilterTypeView,
};
