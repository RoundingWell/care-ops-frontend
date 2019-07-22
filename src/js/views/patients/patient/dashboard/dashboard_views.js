import Radio from 'backbone.radio';
import hbs from 'handlebars-inline-precompile';
import { View, CollectionView } from 'marionette';

import 'sass/modules/buttons.scss';

import PreloadRegion from 'js/regions/preload_region';

import { StateComponent, OwnerComponent, DueComponent } from 'js/views/patients/actions/actions_views';

import '../patient.scss';

const ItemView = View.extend({
  modelEvents: {
    'editing': 'onEditing',
  },
  className: 'table-list__item',
  tagName: 'tr',
  template: hbs`
  <td class="table-list__cell w-50"><span class="view-list__name-icon">{{far "file-alt"}}</span>{{ name }}</td>
  <td class="table-list__cell w-50 u-text-align--right">
    <div data-state-region></div>
    <div data-owner-region></div>
    <div data-due-region></div>
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

    this.listenTo(stateComponent, 'change:state', ({ id }) => {
      this.model.saveState(id);
    });

    this.showChildView('state', stateComponent);
  },
  showOwner() {
    const ownerComponent = new OwnerComponent({ model: this.model, isCompact: true });

    this.listenTo(ownerComponent, 'change:owner', owner => {
      this.model.saveOwner(owner);
    });

    this.showChildView('owner', ownerComponent);
  },
  showDue() {
    const dueComponent = new DueComponent({ model: this.model, isCompact: true });

    this.listenTo(dueComponent, 'change:due', date => {
      this.model.saveDue(date);
    });

    this.showChildView('due', dueComponent);
  },
});

const NewItemView = View.extend({
  className: 'table-list__item is-disabled',
  tagName: 'tr',
  template: hbs`
    <td class="table-list__cell"><span class="view-list__name-icon">{{far "file-alt"}}</span><em>{{ @intl.patients.patient.dashboard.dashboardViews.newAction }}</em></td>
    <td></td>
  `,
});

const ListView = CollectionView.extend({
  className: 'table-list',
  tagName: 'table',
  childView(model) {
    if (model.isNew()) return NewItemView;

    return ItemView;
  },
});

const LayoutView = View.extend({
  className: 'flex-region',
  regions: {
    content: {
      el: '[data-content-region]',
      regionClass: PreloadRegion,
      replaceElement: true,
    },
  },
  template: hbs`
    <div class="patient-tabs">
      <span class="patient-tab--selected">
        {{~ @intl.patients.patient.dashboard.dashboardViews.dashboardBtn ~}}
      </span>
      <button class="patient-tab js-data-events">
        {{~ @intl.patients.patient.dashboard.dashboardViews.dataEventsBtn ~}}
      </button>
    </div>
    <div class="patient__actions">
      <button class="button small button--white js-add">{{far "plus-circle"}} {{ @intl.patients.patient.dashboard.dashboardViews.addActionBtn }}</button>
    </div>
    <div data-content-region></div>
  `,
  triggers: {
    'click .js-data-events': 'click:dataEvents',
    'click .js-add': 'click:add',
  },
  onClickDataEvents() {
    Radio.trigger('event-router', 'patient:dataEvents', this.model.id);
  },
});

export {
  ListView,
  LayoutView,
};
