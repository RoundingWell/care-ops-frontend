import anime from 'animejs';
import moment from 'moment';
import Radio from 'backbone.radio';

import hbs from 'handlebars-inline-precompile';
import { View, CollectionView } from 'marionette';

import 'sass/modules/buttons.scss';

import PreloadRegion from 'js/regions/preload_region';

import { StateComponent, OwnerComponent, DueComponent, AttachmentButton } from 'js/views/patients/actions/actions_views';

import ActionItemTemplate from './action-item.hbs';
import LayoutTemplate from './layout.hbs';

import '../patient.scss';

const EmptyView = View.extend({
  tagName: 'tr',
  template: hbs`
    <td class="patient__empty-list">
      <h2>{{ @intl.patients.patient.dashboard.dashboardViews.emptyView }}</h2>
    </td>
  `,
});

const ItemView = View.extend({
  modelEvents: {
    'editing': 'onEditing',
    'change': 'render',
    'change:_state': 'onChangeState',
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
    attachment: '[data-attachment-region]',
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
    this.showAttachment();
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
    const isDisabled = this.model.isNew();
    const ownerComponent = new OwnerComponent({ model: this.model, isCompact: true, state: { isDisabled } });

    this.listenTo(ownerComponent, 'change:owner', owner => {
      this.model.saveOwner(owner);
    });

    this.showChildView('owner', ownerComponent);
  },
  showDue() {
    const isDisabled = this.model.isNew();
    const dueComponent = new DueComponent({ model: this.model, isCompact: true, state: { isDisabled } });

    this.listenTo(dueComponent, 'change:due', date => {
      this.model.saveDue(date);
    });

    this.showChildView('due', dueComponent);
  },
  showAttachment() {
    if (!this.model.getForm()) return;

    this.showChildView('attachment', new AttachmentButton({ model: this.model }));
  },
  onChangeState() {
    if (this.model.isDone()) {
      anime({
        targets: this.el,
        delay: 300,
        duration: 500,
        opacity: [1, 0],
        easing: 'easeOutQuad',
        complete: () => {
          this.triggerMethod('change:visible');
        },
      });
      return;
    }

    this.$el.css({
      opacity: 1,
    });

    this.triggerMethod('change:visible');
  },
});


const ListView = CollectionView.extend({
  childViewEvents: {
    'change:visible': 'filter',
  },
  className: 'table-list patient__list',
  tagName: 'table',
  childView: ItemView,
  emptyView: EmptyView,
  viewComparator({ model }) {
    return - moment(model.get('updated_at')).format('X');
  },
  viewFilter({ model }) {
    return !model.isDone();
  },
});

const LayoutView = View.extend({
  className: 'flex-region patient__content',
  regions: {
    content: {
      el: '[data-content-region]',
      regionClass: PreloadRegion,
      replaceElement: true,
    },
    addWorkflow: '[data-add-workflow-region]',
  },
  ui: {
    loading: '.js-loading',
  },
  template: LayoutTemplate,
  triggers: {
    'click .js-data-events': 'click:dataEvents',
  },
  onClickDataEvents() {
    Radio.trigger('event-router', 'patient:dataEvents', this.model.id);
  },
  onRender() {
    anime({
      targets: this.ui.loading[0],
      opacity: 0.5,
      loop: true,
      easing: 'easeInOutSine',
      duration: 400,
      direction: 'alternate',
    });
  },
});

export {
  ListView,
  LayoutView,
};
