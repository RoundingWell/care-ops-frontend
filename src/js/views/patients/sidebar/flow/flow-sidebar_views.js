import _ from 'underscore';
import Backbone from 'backbone';
import hbs from 'handlebars-inline-precompile';
import { View } from 'marionette';

import intl from 'js/i18n';

import { animSidebar } from 'js/anim';

import PreloadRegion from 'js/regions/preload_region';

import Optionlist from 'js/components/optionlist';

import { StateComponent, OwnerComponent } from 'js/views/patients/actions/actions_views';

import FlowSidebarTemplate from './flow-sidebar.hbs';

import 'sass/domain/action-state.scss';
import './flow-sidebar.scss';

const TimestampsView = View.extend({
  className: 'patient-flow-sidebar__timestamps',
  template: hbs`
    <div><h4 class="patient-flow-sidebar__label">{{ @intl.patients.sidebar.flow.flowSidebarViews.timestampsView.createdAt }}</h4>{{formatMoment created_at "AT_TIME"}}</div>
    <div><h4 class="patient-flow-sidebar__label">{{ @intl.patients.sidebar.flow.flowSidebarViews.timestampsView.updatedAt }}</h4>{{formatMoment updated_at "AT_TIME"}}</div>
  `,
});

const LayoutView = View.extend({
  childViewTriggers: {
    'save': 'save',
    'cancel': 'cancel',
  },
  className: 'patient-flow-sidebar flex-region',
  template: FlowSidebarTemplate,
  regions: {
    state: '[data-state-region]',
    owner: '[data-owner-region]',
    activity: {
      el: '[data-activity-region]',
      regionClass: PreloadRegion,
    },
    timestamps: '[data-timestamps-region]',
  },
  triggers: {
    'click .js-close': 'close',
    'click @ui.menu': 'click:menu',
  },
  ui: {
    menu: '.js-menu',
  },
  onClickMenu() {
    const menuOptions = new Backbone.Collection([
      {
        onSelect: _.bind(this.triggerMethod, this, 'delete'),
      },
    ]);

    const optionlist = new Optionlist({
      ui: this.ui.menu,
      uiView: this,
      headingText: intl.patients.sidebar.flow.layoutView.menuOptions.headingText,
      itemTemplate: hbs`<span class="patient-flow-sidebar__delete-icon">{{far "trash-alt"}}</span>{{ @intl.patients.sidebar.flow.layoutView.menuOptions.delete }}`,
      lists: [{ collection: menuOptions }],
      align: 'right',
      popWidth: 248,
    });

    optionlist.show();
  },
  modelEvents: {
    'change:_state': 'showState',
    'change:_role change:_clinician': 'showOwner',
  },
  onAttach() {
    animSidebar(this.el);
  },
  onRender() {
    this.showState();
    this.showOwner();
    this.showTimestamps();
  },
  showState() {
    const stateComponent = new StateComponent({
      model: this.model,
    });

    this.listenTo(stateComponent, 'change:state', state => {
      this.model.saveState(state);
    });

    this.showChildView('state', stateComponent);
  },
  showOwner() {
    const isDisabled = this.model.isDone();
    const ownerComponent = new OwnerComponent({ model: this.model, state: { isDisabled } });

    this.listenTo(ownerComponent, 'change:owner', owner => {
      this.model.saveRole(owner);
    });

    this.showChildView('owner', ownerComponent);
  },
  showTimestamps() {
    this.showChildView('timestamps', new TimestampsView({ model: this.model }));
  },
});

export {
  LayoutView,
};
