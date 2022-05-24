import Radio from 'backbone.radio';
import { View } from 'marionette';

import 'sass/modules/buttons.scss';
import 'sass/modules/sidebar.scss';

import PatientSidebarTemplate from './patient-sidebar.hbs';

import './patient-sidebar.scss';

const LayoutView = View.extend({
  className: 'sidebar sidebar--small flex-region',
  template: PatientSidebarTemplate,
  regions: {
    widgets: '[data-widgets-region]',
  },
  triggers: {
    'click .js-close': 'close',
    'click .js-patient': 'click:patient',
  },
  onClickPatient() {
    Radio.trigger('event-router', 'patient:dashboard', this.model.id);
  },
});

export {
  LayoutView,
};
