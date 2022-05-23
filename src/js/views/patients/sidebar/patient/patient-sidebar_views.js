import Radio from 'backbone.radio';
import { View } from 'marionette';

import 'sass/modules/buttons.scss';
import 'sass/modules/forms.scss';
import 'sass/modules/textarea-flex.scss';
import 'sass/modules/sidebar.scss';

import PatientSidebarTemplate from './patient-sidebar.hbs';

import { WidgetCollectionView } from 'js/views/patients/widgets/widgets_views';

import './patient-sidebar.scss';

const LayoutView = View.extend({
  childViewTriggers: {},
  className: 'sidebar flex-region',
  template: PatientSidebarTemplate,
  regions: {
    widgets: '[data-widgets-region]',
  },
  triggers: {
    'click .js-close': 'close',
    'click .js-patient': 'click:patient',
  },
  templateContext() {
    return {
      firstName: this.patient.get('first_name'),
      lastName: this.patient.get('last_name'),
    };
  },
  initialize({ patient, widgets }) {
    this.patient = patient;
    this.widgets = widgets;
  },
  onRender() {
    this.showChildView('widgets', new WidgetCollectionView({
      model: this.patient,
      collection: this.widgets,
      itemClassName: 'patient-sidebar__section',
    }));
  },
  onClickPatient() {
    Radio.trigger('event-router', 'patient:dashboard', this.patient.id);
  },
});

export {
  LayoutView,
};
