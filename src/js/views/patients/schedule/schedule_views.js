import { View } from 'marionette';
import hbs from 'handlebars-inline-precompile';

import intl from 'js/i18n';

import 'sass/modules/list-pages.scss';
import 'sass/modules/table-list.scss';

import PreloadRegion from 'js/regions/preload_region';

import Tooltip from 'js/components/tooltip';

import LayoutTemplate from './layout.hbs';

const LayoutView = View.extend({
  className: 'flex-region',
  template: LayoutTemplate,
  regions: {
    filters: '[data-filters-region]',
    table: '[data-table-region]',
    list: {
      el: '[data-list-region]',
      regionClass: PreloadRegion,
    },
    selectAll: '[data-select-all-region]',
    title: '[data-title-region]',
    dateFilter: '[data-date-filter-region]',
  },
});

const ScheduleTitleView = View.extend({
  template: hbs`
    {{formatMessage (intlGet "patients.schedule.scheduleViews.scheduleTitleView.title") owner=name}}{{~ remove_whitespace ~}}
    <span class="list-page__header-icon js-title-info">{{fas "info-circle"}}</span>
  `,
  ui: {
    tooltip: '.js-title-info',
  },
  onRender() {
    new Tooltip({
      message: intl.patients.schedule.scheduleViews.scheduleTitleView.tooltip,
      uiView: this,
      ui: this.ui.tooltip,
      orientation: 'vertical',
    });
  },
});

const TableHeaderView = View.extend({
  template: hbs`
    <td class="table-list__header schedule-list__header w-25">{{ @intl.patients.schedule.scheduleViews.tableHeaderView.dueDateHeader }}</td>
    <td class="table-list__header schedule-list__header w-50">{{ @intl.patients.schedule.scheduleViews.tableHeaderView.metaHeader }}</td>
    <td class="table-list__header schedule-list__header w-10">{{ @intl.patients.schedule.scheduleViews.tableHeaderView.formheader }}</td>
    <td class="table-list__header schedule-list__header w-15">{{ @intl.patients.schedule.scheduleViews.tableHeaderView.ownerHeader }}</td>
  `,
  tagName: 'tr',
});

export {
  LayoutView,
  ScheduleTitleView,
  TableHeaderView,
};
