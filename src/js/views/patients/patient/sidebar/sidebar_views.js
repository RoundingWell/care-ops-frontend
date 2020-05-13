import _ from 'underscore';
import anime from 'animejs';
import moment from 'moment';

import hbs from 'handlebars-inline-precompile';
import { View, CollectionView, Region } from 'marionette';

import intl, { renderTemplate } from 'js/i18n';
import ModelRender from 'js/behaviors/model-render';

import PatientSidebarTemplate from './patient-sidebar.hbs';
import PatientSidebarGroupsTemplate from './patient-sidebar-groups.hbs';

import './patient-sidebar.scss';
import 'sass/domain/engagement-status.scss';

const i18n = intl.patients.patient.sidebar.sidebarViews;

const patientSet = [
  {
    heading: i18n.dobLabel,
    template: hbs`{{formatHTMLMessage (intlGet "patients.patient.sidebar.sidebarViews.dob") dob=(formatMoment dob "LONG" inputFormat="YYYY-MM-DD") age=age}}`,
    data(patient) {
      const dob = patient.get('birth_date');

      const age = moment().diff(moment(dob, 'YYYY-MM-DD'), 'years');

      return { dob, age };
    },
  },
  {
    heading: i18n.sexLabel,
    template: hbs`{{formatMessage (intlGet "patients.patient.sidebar.sidebarViews.sex") sex=sex}}`,
  },
];

const InfoView = CollectionView.extend({
  className: 'patient-sidebar__section',
  showView(type, text) {
    /* istanbul ignore next: prevents "null" string */
    if (!text) text = '';

    const view = new View({
      className: `patient-sidebar__${ type }`,
      template: _.constant(_.trim(text)),
    });

    this.addChildView(view);
  },
  onRender() {
    _.each(patientSet, this.showItem, this);

    this.showPatientFields();
  },
  showItem({ heading, data = _.constant(this.model.attributes), template }) {
    this.showView('heading', heading);
    this.showView('item', renderTemplate(template, data(this.model)));
  },
  showPatientFields() {
    /* istanbul ignore next */
    if (!_DEVELOP_) return;

    const fields = this.model.getFields();

    fields.each(field => {
      this.showView('heading', field.get('name'));
      this.showView('item', field.get('value'));
    });
  },
});

const GroupsView = View.extend({
  behaviors: [
    {
      behaviorClass: ModelRender,
      changeAttributes: ['_groups'],
    },
  ],
  className: 'patient-sidebar__section',
  template: PatientSidebarGroupsTemplate,
  templateContext() {
    return {
      groups: _.map(this.model.getGroups().models, 'attributes'),
    };
  },
});

const EngagementStatusPreloadView = View.extend({
  template: hbs`{{ @intl.patients.patient.sidebar.sidebarViews.engagementStatusPreloadView.loading }}`,
  onRender() {
    anime({
      targets: this.el,
      opacity: 0.5,
      loop: true,
      easing: 'easeInOutSine',
      duration: 400,
      direction: 'alternate',
    });
  },
});

const EngagementStatusView = View.extend({
  template: hbs`
    {{#if engagement.status}}
      <span class="engagement-status__icon {{ engagement.status }} u-margin--r-4">{{fas "circle"}}</span>{{formatMessage (intlGet "patients.patient.sidebar.sidebarViews.engagementStatusView.status") status=engagement.status}}
    {{else}}
      <span class="patient-sidebar__no-engagement">{{ @intl.patients.patient.sidebar.sidebarViews.engagementStatusView.notAvailable }}</span>
    {{/if}}
  `,
});

const SidebarView = View.extend({
  className: 'patient-sidebar flex-region',
  template: PatientSidebarTemplate,
  regionClass: Region.extend({ replaceElement: true }),
  regions: {
    info: '[data-info-region]',
    groups: '[data-groups-region]',
    engagement: '[data-engagement-region]',
  },
  onRender() {
    const model = this.model;

    this.showChildView('info', new InfoView({ model }));
    this.showChildView('groups', new GroupsView({ model }));
  },
});

export {
  SidebarView,
  EngagementStatusPreloadView,
  EngagementStatusView,
};
