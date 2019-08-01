import Radio from 'backbone.radio';
import hbs from 'handlebars-inline-precompile';
import { View, CollectionView, Region } from 'marionette';

import PreloadRegion from 'js/regions/preload_region';

import { StateComponent, OwnerComponent, DueComponent } from 'js/views/patients/actions/actions_views';

import '../patient.scss';

const ItemView = View.extend({
  modelEvents: {
    'editing': 'onEditing',
    'change': 'render',
  },
  className: 'table-list__item',
  tagName: 'tr',
  template: hbs`
    <td class="table-list__cell w-50"><span class="view-list__name-icon">{{far "file-alt"}}</span>{{ name }}</td>
    <td class="table-list__cell w-50 u-text-align--right">
      <div data-state-region></div>
      <div data-owner-region></div>
      <div data-due-region></div>
      {{ lastUpdated }}
    </td>
  `,
  regions: {
    state: '[data-state-region]',
    owner: '[data-owner-region]',
    due: '[data-due-region]',
  },
  regionClass: Region.extend({ replaceElement: true }),
  triggers: {
    'click': 'click',
  },
  onClick() {
    Radio.trigger('event-router', 'patient:action', this.model.get('_patient'), this.model.id);
  },
  onEditing(isEditing) {
    this.$el.toggleClass('is-disabled', isEditing);
  },
  onRender() {
    this.showState();
    this.showOwner();
    this.showDue();
  },
  showState() {
    const stateComponent = new StateComponent({ model: this.model, isCompact: true });

    this.listenTo(stateComponent, 'change:state', ({ id }) => {
      this.model.saveState(id);
    });

    this.showChildView('state', stateComponent);
  },
  showOwner() {
    const ownerComponent = new OwnerComponent({ model: this.model, isCompact: true, isDisabled: true });

    this.showChildView('owner', ownerComponent);
  },
  showDue() {
    const dueComponent = new DueComponent({ model: this.model, isCompact: true, isDisabled: true });

    this.showChildView('due', dueComponent);
  },
});

const ListView = CollectionView.extend({
  className: 'table-list',
  tagName: 'table',
  childView: ItemView,
  viewFilter({ model }) {
    return model.isDone();
  },
});

const LayoutView = View.extend({
  regions: {
    content: {
      el: '[data-content-region]',
      regionClass: PreloadRegion,
    },
  },
  template: hbs`
    <div class="patient-tabs">
      <button class="patient-tab js-dashboard">
        {{~ @intl.patients.patient.dataEvents.dataEventsViews.dashboardBtn ~}}
      </button>
      <span class="patient-tab--selected">
        {{~ @intl.patients.patient.dataEvents.dataEventsViews.dataEventsBtn ~}}
      </span>
    </div>
    <div data-content-region></div>
  `,
  triggers: {
    'click .js-dashboard': 'click:dashboard',
  },
  onClickDashboard() {
    Radio.trigger('event-router', 'patient:dashboard', this.model.id);
  },
});

export {
  ListView,
  LayoutView,
};
