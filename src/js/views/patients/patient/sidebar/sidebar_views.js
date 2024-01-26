import { bind } from 'underscore';
import Backbone from 'backbone';
import { View } from 'marionette';
import hbs from 'handlebars-inline-precompile';

import intl from 'js/i18n';

import PreloadRegion from 'js/regions/preload_region';

import 'scss/modules/widgets.scss';

import Optionlist from 'js/components/optionlist';

import { WidgetCollectionView } from 'js/views/patients/widgets/widgets_views';

import 'scss/domain/patient-sidebar.scss';
import './patient-sidebar.scss';

const i18n = intl.patients.patient.sidebar.sidebarViews;

const NameView = View.extend({
  tagName: 'h1',
  className: 'patient-sidebar__name',
  template: hbs`{{ first_name }} {{ last_name }}`,
  modelEvents: {
    'change': 'render',
  },
});

const SidebarView = View.extend({
  className: 'patient-sidebar flex-region',
  template: hbs`
    <div data-name-region></div>
    <span class="patient-sidebar__icon">{{far "address-card"}}</span>
    <button class="button--icon patient-sidebar__menu js-menu">{{far "ellipsis"}}</button>
    <div class="patient-sidebar__widgets" data-widgets-region></div>
  `,
  regions: {
    name: '[data-name-region]',
    widgets: {
      el: '[data-widgets-region]',
      regionClass: PreloadRegion,
    },
  },
  onRender() {
    this.showChildView('name', new NameView({
      model: this.model,
    }));

    this.showChildView('widgets', new WidgetCollectionView({
      model: this.model,
      collection: this.collection,
      itemClassName: 'patient-sidebar__section',
    }));
  },
  triggers: {
    'click @ui.menu': 'click:menu',
  },
  ui: {
    menu: '.js-menu',
  },
  onClickMenu() {
    const canEdit = this.model.canEdit();
    const patientStatus = this.model.getStatus();
    const canManagePatients = this.getOption('canManagePatients');

    const menuOptions = new Backbone.Collection([
      {
        text: canEdit ? i18n.menuOptions.edit : i18n.menuOptions.view,
        onSelect: bind(this.triggerMethod, this, canEdit ? 'click:patientEdit' : 'click:patientView'),
      },
    ]);

    if (canEdit && canManagePatients) {
      menuOptions.push({
        text: patientStatus !== 'active' ? i18n.menuOptions.activate : i18n.menuOptions.inactivate,
        onSelect: bind(this.triggerMethod, this, 'click:activeStatus'),
      });

      if (patientStatus !== 'archived') {
        menuOptions.push({
          text: i18n.menuOptions.archive,
          onSelect: bind(this.triggerMethod, this, 'click:archivedStatus'),
        });
      }
    }

    const optionlist = new Optionlist({
      ui: this.ui.menu,
      uiView: this,
      headingText: i18n.menuOptions.headingText,
      itemTemplate: hbs`{{ text }}`,
      lists: [{ collection: menuOptions }],
      align: 'right',
      popWidth: 248,
    });

    optionlist.show();
  },
});

export {
  SidebarView,
};
