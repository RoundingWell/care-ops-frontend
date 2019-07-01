import Radio from 'backbone.radio';
import hbs from 'handlebars-inline-precompile';
import { View, CollectionView } from 'marionette';

import PreloadRegion from 'js/regions/preload_region';

import '../patient.scss';

const ItemView = View.extend({
  className: 'table-list__item',
  tagName: 'tr',
  template: hbs`
    <td class="table-list__cell w-50"><span class="view-list__name-icon">{{far "file-alt"}}</span>{{ name }}</td>
    <td class="table-list__cell w-50 u-text-align--right">
      <div data-state-region></div>
      <div data-owner-region></div>
      <div data-due-region></div>
      {{ lastUpdated }}
    </td>
  `,
  regions: {
    state: '[data-state-region]',
    owner: '[data-owner-region]',
    due: '[data-due-region]',
  },
  triggers: {
    'click': 'click',
  },
  onClick() {
    Radio.trigger('event-router', 'patient:action', this.model.get('_patient'), this.model.id);
  },
});

const ListView = CollectionView.extend({
  className: 'table-list',
  tagName: 'table',
  childView: ItemView,
});

const LayoutView = View.extend({
  regions: {
    content: {
      el: '[data-content-region]',
      regionClass: PreloadRegion,
    },
  },
  template: hbs`
    <div class="patient-tabs">
      <button class="patient-tab js-dashboard">
        {{~ @intl.patients.patient.dataEvents.dataEventsViews.dashboardBtn ~}}
      </button>
      <span class="patient-tab--selected">
        {{~ @intl.patients.patient.dataEvents.dataEventsViews.dataEventsBtn ~}}
      </span>
    </div>
    <div data-content-region></div>
  `,
  triggers: {
    'click .js-dashboard': 'click:dashboard',
  },
  onClickDashboard() {
    Radio.trigger('event-router', 'patient:dashboard', this.model.id);
  },
});

export {
  ListView,
  LayoutView,
};
