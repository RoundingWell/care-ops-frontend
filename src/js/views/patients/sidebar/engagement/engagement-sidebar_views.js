import hbs from 'handlebars-inline-precompile';
import { View } from 'marionette';

import { animSidebar } from 'js/anim';

import PreloadRegion from 'js/regions/preload_region';

import EngagementContentTemplate from './engagement-content.hbs';

import './engagement-sidebar.scss';

const ContentView = View.extend({
  template: EngagementContentTemplate,
  templateContext() {
    const patientEngagement = this.model.get('_patient_engagement');

    return {
      smsEnabled: patientEngagement.settings.engagement.deliveryPref === 'email_text',
      engagement: patientEngagement.engagement,
      settings: patientEngagement.settings,
    };
  },
});

const LayoutView = View.extend({
  className: 'sidebar flex-region',
  template: hbs`
    <div class="flex u-margin--b-16">
      <div class="flex-grow">
        <h3 class="engagement-sidebar__title">{{ @intl.patients.sidebar.engagement.engagementSidebarViews.layoutView.heading }}</h3>
      </div>
      <div>
        <button class="button--icon js-close">{{fas "times"}}</button>
      </div>
    </div>
    <div class="flex-grow" data-content-region></div>
  `,
  regions: {
    content: {
      el: '[data-content-region]',
      regionClass: PreloadRegion,
    },
  },
  triggers: {
    'click .js-close': 'close',
  },
  onAttach() {
    animSidebar(this.el);
  },
});

export {
  LayoutView,
  ContentView,
};
