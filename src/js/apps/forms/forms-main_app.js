import RouterApp from 'js/base/routerapp';

import FormApp from 'js/apps/forms/form/form_app';

export default RouterApp.extend({
  routerAppName: 'FormsApp',

  childApps: {
    form: FormApp,
  },

  eventRoutes: {
    'form:patientAction': {
      action: 'showFormAction',
      route: 'form/:id',
    },
  },
  showFormAction(formId) {
    this.startCurrent('form', { formId });
  },
});
