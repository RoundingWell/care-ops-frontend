import { get } from 'underscore';
import Radio from 'backbone.radio';
import dayjs from 'dayjs';

import App from 'js/base/app';

import FormsService from 'js/services/forms';

import PatientSidebarApp from 'js/apps/patients/patient/sidebar/sidebar_app';

import { FormActionsView, LayoutView, IframeView, SaveView, ReadOnlyView, StatusView } from 'js/views/forms/form/form_views';

export default App.extend({
  childApps: {
    patient: {
      AppClass: PatientSidebarApp,
      regionName: 'sidebar',
      getOptions: ['patient'],
    },
  },
  onBeforeStart() {
    this.getRegion().startPreloader();
    this.setState({
      isExpanded: false,
    });
  },
  beforeStart({ formId, patientId }) {
    return [
      Radio.request('entities', 'fetch:patients:model', patientId),
      Radio.request('entities', 'forms:model', formId),
      Radio.request('entities', 'fetch:patientFields:collection', patientId),
    ];
  },
  onBeforeStop() {
    this.removeChildApp('formsService');
  },
  onStart(options, [patient], form) {
    this.patient = patient;
    this.form = form;
    this.isReadOnly = get(this.form.get('options'), 'read_only');

    this.startFormService();

    this.showView(new LayoutView({ model: this.form, patient }));

    this.showForm();

    this.showFormStatus();
    this.showFormSaveDisabled();
    this.showActions();

    this.showSidebar();
  },
  startFormService() {
    const formService = this.addChildApp('formsService', FormsService, {
      patient: this.patient,
      form: this.form,
    });

    this.listenTo(formService, {
      'success'(response) {
        response.set({ _created_at: dayjs().format() });

        this.showForm(response.id);
        this.showFormStatus(response);
      },
      'ready'() {
        this.showFormSave();
      },
      'error'() {
        this.showFormSave();
      },
    });
  },
  stateEvents: {
    'change:isExpanded': 'showSidebar',
  },
  showFormStatus(response) {
    if (this.isReadOnly) return;
    this.showChildView('status', new StatusView({ model: response }));
  },
  showActions() {
    const actionsView = new FormActionsView({
      model: this.getState(),
      patient: this.patient,
    });

    this.listenTo(actionsView, {
      'click:expandButton': this.onClickExpandButton,
      'click:printButton': this.onClickPrintButton,
    });

    this.showChildView('actions', actionsView);
  },
  onClickExpandButton() {
    this.toggleState('isExpanded');
  },
  onClickPrintButton() {
    Radio.request(`form${ this.form.id }`, 'send', 'print:form');
  },
  showForm(responseId) {
    this.showChildView('form', new IframeView({
      model: this.form,
      responseId,
    }));
  },
  showSidebar() {
    const isExpanded = this.getState('isExpanded');

    if (isExpanded) {
      this.stopChildApp('patient');
      this.getRegion('sidebar').empty();
      return;
    }

    this.startChildApp('patient');
  },
  showFormSaveDisabled() {
    if (this.isReadOnly) {
      this.showChildView('formAction', new ReadOnlyView());
      return;
    }

    this.showChildView('formAction', new SaveView({ isDisabled: true }));
  },
  showFormSave() {
    if (this.isReadOnly) return;
    const saveView = this.showChildView('formAction', new SaveView());

    this.listenTo(saveView, 'click', () => {
      Radio.request(`form${ this.form.id }`, 'send', 'form:submit');
    });
  },
});
