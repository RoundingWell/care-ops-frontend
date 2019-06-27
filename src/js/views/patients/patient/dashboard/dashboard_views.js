import Radio from 'backbone.radio';
import hbs from 'handlebars-inline-precompile';
import { View } from 'marionette';

import PreloadRegion from 'js/regions/preload_region';

import '../patient.scss';

const LayoutView = View.extend({
  className: 'flex-region',
  regions: {
    content: {
      el: '[data-content-region]',
      regionClass: PreloadRegion,
      replaceElement: true,
    },
  },
  template: hbs`
    <div class="patient-tabs">
      <span class="patient-tab--selected">
        {{~ @intl.patients.patient.dashboard.dashboardViews.dashboardBtn ~}}
      </span>
      <button class="patient-tab js-data-events">
        {{~ @intl.patients.patient.dashboard.dashboardViews.dataEventsBtn ~}}
      </button>
    </div>
    <div data-content-region></div>
  `,
  triggers: {
    'click .js-data-events': 'click:dataEvents',
  },
  onClickDataEvents() {
    Radio.trigger('event-router', 'patient:dataEvents', this.model.id);
  },
});

export {
  LayoutView,
};
