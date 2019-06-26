import Radio from 'backbone.radio';
import hbs from 'handlebars-inline-precompile';
import { View } from 'marionette';

import PreloadRegion from 'js/regions/preload_region';

import '../patient.scss';

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
  LayoutView,
};
