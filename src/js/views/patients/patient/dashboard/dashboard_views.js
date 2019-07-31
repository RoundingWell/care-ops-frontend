import Radio from 'backbone.radio';
import { View, CollectionView, Region } from 'marionette';

import 'sass/modules/buttons.scss';

import PreloadRegion from 'js/regions/preload_region';

import { StateComponent, OwnerComponent, DueComponent } from 'js/views/patients/actions/actions_views';

import ActionItemTemplate from './action-item.hbs';
import LayoutTemplate from './layout.hbs';

import '../patient.scss';
import './dashboard.scss';

const ItemView = View.extend({
  modelEvents: {
    'editing': 'onEditing',
    'change': 'render',
  },
  className() {
    if (this.model.isNew()) return 'table-list__item is-disabled';

    return 'table-list__item';
  },
  tagName: 'tr',
  template: ActionItemTemplate,
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
    if (this.model.isNew()) return;

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


const ListView = CollectionView.extend({
  className: 'table-list',
  tagName: 'table',
  childView: ItemView,
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
