import moment from 'moment';
import Radio from 'backbone.radio';

import hbs from 'handlebars-inline-precompile';
import { View, CollectionView, Behavior } from 'marionette';

import 'sass/modules/buttons.scss';
import 'sass/modules/table-list.scss';

import intl from 'js/i18n';

import Droplist from 'js/components/droplist';

import PreloadRegion from 'js/regions/preload_region';

import { OwnerComponent as FlowOwnerComponent } from 'js/views/admin/shared/flows_views';
import { DueDayComponent, OwnerComponent, PublishedComponent } from 'js/views/admin/shared/actions_views';

import ActionItemTemplate from './action-item.hbs';
import FlowItemTemplate from './flow-item.hbs';
import LayoutTemplate from './layout.hbs';

import 'sass/domain/program-action-state.scss';
import './workflows.scss';

const EmptyView = View.extend({
  tagName: 'tr',
  template: hbs`
    <td class="workflows__empty-list">
      <h2>{{ @intl.admin.program.workflows.workflowsViews.emptyView }}</h2>
    </td>
  `,
});

const RowBehavior = Behavior.extend({
  modelEvents: {
    'editing': 'onEditing',
    'change': 'onChange',
  },
  onChange() {
    this.view.render();
  },
  onEditing(isEditing) {
    this.$el.toggleClass('is-selected', isEditing);
  },
  onInitialize() {
    if (this.view.model.isNew()) this.$el.addClass('is-selected');
  },
});

const ActionItemView = View.extend({
  className: 'table-list__item',
  tagName: 'tr',
  behaviors: [RowBehavior],
  regions: {
    published: '[data-published-region]',
    owner: '[data-owner-region]',
    due: '[data-due-region]',
  },
  template: ActionItemTemplate,
  templateContext() {
    return {
      hasAttachment: this.model.getForm(),
    };
  },
  triggers: {
    'click': 'click',
  },
  onClick() {
    if (this.model.isNew()) {
      Radio.trigger('event-router', 'program:action:new', this.model.get('_program'));
      return;
    }

    Radio.trigger('event-router', 'program:action', this.model.get('_program'), this.model.id);
  },
  onRender() {
    this.showPublished();
    this.showOwner();
    this.showDue();
  },
  showPublished() {
    const isDisabled = this.model.isNew();
    const publishedComponent = new PublishedComponent({ status: this.model.get('status'), isCompact: true, state: { isDisabled } });

    this.listenTo(publishedComponent, 'change:status', status => {
      this.model.save({ status });
    });

    this.showChildView('published', publishedComponent);
  },
  showOwner() {
    const isDisabled = this.model.isNew();
    const ownerComponent = new OwnerComponent({ owner: this.model.getOwner(), isCompact: true, state: { isDisabled } });

    this.listenTo(ownerComponent, 'change:owner', owner => {
      this.model.saveOwner(owner);
    });

    this.showChildView('owner', ownerComponent);
  },
  showDue() {
    const isDisabled = this.model.isNew();
    const dueDayComponent = new DueDayComponent({ day: this.model.get('days_until_due'), isCompact: true, state: { isDisabled } });

    this.listenTo(dueDayComponent, 'change:day', day => {
      this.model.save({ days_until_due: day });
    });

    this.showChildView('due', dueDayComponent);
  },
});

const FlowItemView = View.extend({
  className: 'table-list__item',
  tagName: 'tr',
  behaviors: [RowBehavior],
  regions: {
    owner: '[data-owner-region]',
  },
  template: FlowItemTemplate,
  templateContext() {
    return {
      isPublished: this.model.get('status') === 'published',
    };
  },
  triggers: {
    'click': 'click',
  },
  onClick() {
    if (this.model.isNew()) {
      Radio.trigger('event-router', 'programFlow:new', this.model.get('_program'));
      return;
    }

    Radio.trigger('event-router', 'programFlow', this.model.id);
  },
  onRender() {
    this.showOwner();
  },
  showOwner() {
    const isDisabled = this.model.isNew();
    const ownerComponent = new FlowOwnerComponent({ owner: this.model.getOwner(), isCompact: true, state: { isDisabled } });

    this.listenTo(ownerComponent, 'change:owner', owner => {
      this.model.saveOwner(owner);
    });

    this.showChildView('owner', ownerComponent);
  },
});

const ListView = CollectionView.extend({
  className: 'table-list workflows__list',
  tagName: 'table',
  childView(item) {
    if (item.type === 'program-flows') {
      return FlowItemView;
    }

    return ActionItemView;
  },
  emptyView: EmptyView,
  viewComparator({ model }) {
    return - moment(model.get('updated_at')).format('x');
  },
});

const LayoutView = View.extend({
  className: 'flex-region workflows__content',
  regions: {
    content: {
      el: '[data-content-region]',
      regionClass: PreloadRegion,
      replaceElement: true,
    },
    add: '[data-add-region]',
  },
  template: LayoutTemplate,
});

const AddActionDroplist = Droplist.extend({
  popWidth: 248,
  picklistOptions() {
    return {
      className: 'picklist',
      headingText: intl.admin.program.workflows.workflowsViews.addActionHeading,
      itemTemplate: hbs`
        <span class="{{ iconClassName }}">{{fa iconType icon}}</span>
        <a class="workflows__add">{{formatMessage text}}</a>`,
    };
  },
  viewOptions: {
    className: 'button-primary workflows__button',
    template: hbs`{{far "plus-circle"}} {{ @intl.admin.program.workflows.add }}{{far "angle-down" classes="workflows__arrow"}}`,
  },
  picklistEvents: {
    'picklist:item:select': 'onSelect',
  },
  onSelect({ model }) {
    model.get('onSelect')();
  },
});

export {
  ListView,
  LayoutView,
  AddActionDroplist,
};
