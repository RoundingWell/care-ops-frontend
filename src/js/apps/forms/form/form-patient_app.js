import Radio from 'backbone.radio';

import App from 'js/base/app';

import intl from 'js/i18n';

import PatientSidebarApp from 'js/apps/patients/patient/sidebar/sidebar_app';

import { LayoutView, PatientFormView } from 'js/views/forms/form/form_views';

export default App.extend({
  childApps: {
    patient: PatientSidebarApp,
  },
  onBeforeStart() {
    this.getRegion().startPreloader();
  },
  beforeStart({ formId, patientId }) {
    return [
      Radio.request('entities', 'fetch:patients:model', patientId),
      Radio.request('entities', 'forms:model', formId),
    ];
  },
  onFail() {
    Radio.request('alert', 'show:error', intl.forms.form.formApp.notFound);
    Radio.trigger('event-router', 'default');
  },
  onStart(options, [patient], form) {
    this.patient = patient;
    this.form = form;

    this.showView(new LayoutView({
      model: this.getState(),
      patient,
      form,
    }));

    const iframeView = this.showChildView('form', new PatientFormView({
      model: form,
      patient,
    }));

    Radio.reply(`form${ this.form.id }`, 'print:form', () => {
      iframeView.print();
    });

    this.setState('sidebar', true);
  },
  stateEvents: {
    'change:sidebar': 'onChangeSidebar',
  },
  viewEvents: {
    'click:expandButton': 'onClickExpandButton',
    'click:printButton': 'onClickPrintButton',
  },
  onClickExpandButton() {
    this.toggleState('sidebar');
  },
  onChangeSidebar() {
    const sidebar = this.getState('sidebar');

    if (!sidebar) {
      this.stopChildApp('patient');
      this.getRegion('sidebar').empty();
      return;
    }

    this.startChildApp('patient', {
      region: this.getRegion('sidebar'),
      patient: this.patient,
    });
  },
  onClickPrintButton() {
    Radio.request(`form${ this.form.id }`, 'print:form');
  },
});
