import Radio from 'backbone.radio';
import hbs from 'handlebars-inline-precompile';
import { View, CollectionView } from 'marionette';

import PreloadRegion from 'js/regions/preload_region';

import { StateComponent, OwnerComponent, DueComponent } from 'js/views/patients/actions/actions_views';

import '../patient.scss';

const EmptyView = View.extend({
  tagName: 'tr',
  template: hbs`
    <td class="patient-empty-list">
      <h2>{{ @intl.patients.patient.dataEvents.dataEventsViews.emptyView }}</h2>
    </td>
  `,
});

const ItemView = View.extend({
  modelEvents: {
    'editing': 'onEditing',
    'change': 'render',
  },
  className: 'table-list__item',
  tagName: 'tr',
  template: hbs`
    <td class="table-list__cell w-40"><span class="patient__action-list-icon">{{far "file-alt"}}</span><span class="u-v-align--middle">{{ name }}</span></td>
    <td class="table-list__cell w-60">
      <span class="table-list__meta" data-state-region></span><span class="table-list__meta" data-owner-region></span><span class="table-list__meta" data-due-region></span>
      <span class="patient__action-ts">{{formatMoment updated_at "TIME_OR_DAY"}}</span>
    </td>
  `,
  regions: {
    state: '[data-state-region]',
    owner: '[data-owner-region]',
    due: '[data-due-region]',
  },
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

    this.listenTo(stateComponent, 'change:state', state => {
      this.model.saveState(state);
    });

    this.showChildView('state', stateComponent);
  },
  showOwner() {
    const ownerComponent = new OwnerComponent({ model: this.model, isCompact: true, state: { isDisabled: true } });

    this.showChildView('owner', ownerComponent);
  },
  showDue() {
    const dueComponent = new DueComponent({ model: this.model, isCompact: true, state: { isDisabled: true } });

    this.showChildView('due', dueComponent);
  },
});

const ListView = CollectionView.extend({
  className: 'table-list',
  collectionEvents: {
    'change:_state': 'filter',
  },
  tagName: 'table',
  childView: ItemView,
  emptyView: EmptyView,
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
    <div class="flex-region" data-content-region></div>
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
