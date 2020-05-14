import Radio from 'backbone.radio';
import hbs from 'handlebars-inline-precompile';
import { View } from 'marionette';

import CheckInTemplate from './check-in.hbs';

import './check-in.scss';

const ContextTrailView = View.extend({
  className: 'check-in__context-trail',
  template: hbs`
  <a class="js-back check-in__context-link">
    {{fas "chevron-left"}}{{ @intl.checkIns.checkInViews.contextTrailView.backBtn }}
  </a>
  {{fas "chevron-right"}}{{ patient.first_name }} {{ patient.last_name }} - {{formatHTMLMessage (intlGet "checkIns.checkInViews.contextTrailView.checkInCompleted") date=(formatMoment finished_at "LONG" inputFormat="YYYY-MM-DD") }}
  `,
  templateContext() {
    const patient = this.patient;

    return {
      patient: patient.pick('first_name', 'last_name'),
    };
  },
  triggers: {
    'click .js-back': 'click:back',
  },
  initialize({ patient }) {
    this.patient = patient;
  },
  onClickBack() {
    Radio.request('history', 'go:back');
  },
});

const EngagementSidebarView = View.extend({
  template: hbs`Patient Engagement sidebar will go here`,
});

const CheckInView = View.extend({
  template: hbs`Check-in details will go here`,
});

const LayoutView = View.extend({
  className: 'check-in__frame',
  template: CheckInTemplate,
  regions: {
    contextTrail: {
      el: '[data-context-trail-region]',
      replaceElement: true,
    },
    checkIn: '[data-check-in-region]',
    sidebar: '[data-sidebar-region]',
  },
  initialize({ patient }) {
    this.patient = patient;
  },
  onRender() {
    this.showContextTrail();
    this.showCheckInContent();
  },
  showContextTrail() {
    this.showChildView('contextTrail', new ContextTrailView({
      model: this.model,
      patient: this.patient,
    }));
  },
  showCheckInContent() {
    this.showChildView('checkIn', new CheckInView({
      model: this.model,
    }));
  },
});

export {
  LayoutView,
  EngagementSidebarView,
};
