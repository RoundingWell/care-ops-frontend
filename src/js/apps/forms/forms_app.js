import RouterApp from 'js/base/routerapp';

export default RouterApp.extend({
  eventRoutes: {
    'form:patient': {
      action: 'showForm',
      route: 'form/:id',
    },
    'form:patientAction': {
      action: 'showFormAction',
      route: 'form/:id',
    },
  },
  showForm() {
    // console.log(arguments);
  },
  showFormAction() {
    // console.log(arguments);
  },
});
