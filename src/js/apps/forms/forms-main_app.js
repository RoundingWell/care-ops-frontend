import RouterApp from 'js/base/routerapp';

import FormApp from 'js/apps/forms/form/form_app';
import FormPreviewApp from 'js/apps/forms/form/form-preview_app';

export default RouterApp.extend({
  routerAppName: 'FormsApp',

  childApps: {
    form: FormApp,
    formPreview: FormPreviewApp,
  },

  eventRoutes: {
    'form:patientAction': {
      action: 'showFormAction',
      route: 'patient-action/:id/form/:id',
    },
    'form:preview': {
      action: 'showFormPreview',
      route: 'form/:id/preview',
    },
  },
  showFormAction(patientActionId, formId) {
    this.startCurrent('form', { formId, patientActionId });
  },
  showFormPreview(formId) {
    this.startCurrent('formPreview', { formId });
  },
});
