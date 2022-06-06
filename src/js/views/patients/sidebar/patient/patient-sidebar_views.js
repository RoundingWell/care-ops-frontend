import Radio from 'backbone.radio';
import { View } from 'marionette';

import 'sass/modules/buttons.scss';
import 'sass/modules/sidebar.scss';

import { animSidebar } from 'js/anim';

import PreloadRegion from 'js/regions/preload_region';

import PatientSidebarTemplate from './patient-sidebar.hbs';

import { WidgetCollectionView } from 'js/views/patients/widgets/widgets_views';

import 'sass/domain/patient-sidebar.scss';
import './patient-sidebar.scss';

const SidebarWidgetsView = WidgetCollectionView.extend({
  itemClassName: 'patient-sidebar__section',
});

const LayoutView = View.extend({
  className: 'sidebar sidebar--small flex-region',
  template: PatientSidebarTemplate,
  regions: {
    widgets: {
      el: '[data-widgets-region]',
      regionClass: PreloadRegion,
    },
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
