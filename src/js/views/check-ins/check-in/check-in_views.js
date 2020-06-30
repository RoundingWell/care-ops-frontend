import Radio from 'backbone.radio';
import hbs from 'handlebars-inline-precompile';
import { View, CollectionView } from 'marionette';

import CheckInTemplate from './check-in.hbs';

import './check-in.scss';

const ContextTrailView = View.extend({
  className: 'check-in__context-trail',
  template: hbs`
  <a class="js-back check-in__context-link">
    {{fas "chevron-left"}}{{ @intl.checkIns.checkInViews.contextTrailView.backBtn }}
  </a>
  {{fas "chevron-right"}}{{ patient.first_name }} {{ patient.last_name }} - {{formatHTMLMessage (intlGet "checkIns.checkInViews.contextTrailView.checkInCompleted") date=(formatMoment finishedTs "LONG") utc=true }}
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

const MessageItemView = View.extend({
  className: 'check-in__item check-in__message-item',
  template: hbs`
    <strong>{{{ label_html }}}</strong>
    <div>{{{ body_html }}}</div>
  `,
  templateContext: {
    label_html() {
      return this.content.label;
    },
    body_html() {
      return this.content.body;
    },
  },
});

const CheckInItemView = View.extend({
  className: 'check-in__item',
  template: hbs`
    <div>{{{ question_html }}}</div>
    <strong class="check-in__patient-answer">{{{ answer_html }}}</strong>
  `,
  templateContext: {
    question_html() {
      return this.content.label;
    },
    answer_html() {
      return this._answer;
    },
  },
});

const CheckInView = CollectionView.extend({
  childView(item) {
    if (item.get('type') === 'message' || item.get('type') === 'copy') {
      return MessageItemView;
    }

    return CheckInItemView;
  },
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
      collection: this.model.getContent(),
    }));
  },
});

export {
  LayoutView,
  EngagementSidebarView,
};
