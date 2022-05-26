import Radio from 'backbone.radio';
import { View } from 'marionette';

import 'sass/modules/buttons.scss';
import 'sass/modules/sidebar.scss';
import 'sass/domain/patient-sidebar.scss';

import { animSidebar } from 'js/anim';

import PatientSidebarTemplate from './patient-sidebar.hbs';

import { WidgetCollectionView } from 'js/views/patients/widgets/widgets_views';

import './patient-sidebar.scss';

const SidebarWidgetsView = WidgetCollectionView.extend({
  itemClassName: 'patient-sidebar__section',
});

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
  onAttach() {
    animSidebar(this.el);
  },
  onClickPatient() {
    Radio.trigger('event-router', 'patient:dashboard', this.model.id);
  },
});

export {
  LayoutView,
  SidebarWidgetsView,
};
