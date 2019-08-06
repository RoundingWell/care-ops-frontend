import Radio from 'backbone.radio';

import hbs from 'handlebars-inline-precompile';
import { View, CollectionView } from 'marionette';

import 'sass/modules/buttons.scss';

import PreloadRegion from 'js/regions/preload_region';

import { StateComponent, OwnerComponent, DueComponent } from 'js/views/patients/actions/actions_views';

import ActionItemTemplate from './action-item.hbs';
import LayoutTemplate from './layout.hbs';

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
  className() {
    if (this.model.isNew()) return 'table-list__item is-selected';

    return 'table-list__item';
  },
  tagName: 'tr',
  template: ActionItemTemplate,
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
    this.$el.toggleClass('is-selected', isEditing);
  },
  onRender() {
    this.showState();
    this.showOwner();
    this.showDue();
  },
  showState() {
    const isDisabled = this.model.isNew();
    const stateComponent = new StateComponent({ model: this.model, isCompact: true, state: { isDisabled } });

    this.listenTo(stateComponent, 'change:state', state => {
      this.model.saveState(state);
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


const ListView = CollectionView.extend({
  className: 'table-list',
  tagName: 'table',
  childView: ItemView,
  emptyView: EmptyView,
  viewFilter({ model }) {
    return !model.isDone();
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
  template: LayoutTemplate,
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
