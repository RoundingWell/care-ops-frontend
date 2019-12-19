import moment from 'moment';
import Radio from 'backbone.radio';

import hbs from 'handlebars-inline-precompile';
import { View, CollectionView } from 'marionette';

import 'sass/modules/buttons.scss';

import intl from 'js/i18n';

import Droplist from 'js/components/droplist';

import PreloadRegion from 'js/regions/preload_region';

import { DueDayComponent, OwnerComponent, PublishedComponent } from 'js/views/admin/actions/actions_views';

import ActionItemTemplate from './action-item.hbs';
import FlowItemTemplate from './flow-item.hbs';
import LayoutTemplate from './layout.hbs';

import './workflows.scss';

const EmptyView = View.extend({
  tagName: 'tr',
  template: hbs`
    <td class="workflows__empty-list">
      <h2>{{ @intl.admin.program.workflows.workflowsViews.emptyView }}</h2>
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
  regions: {
    published: '[data-published-region]',
    owner: '[data-owner-region]',
    due: '[data-due-region]',
  },
  triggers() {
    if (this.model.isNew()) return;
    return {
      'click': 'click',
    };
  },
  onEditing(isEditing) {
    this.$el.toggleClass('is-selected', isEditing);
  },
  showPublished() {
    const isDisabled = this.model.isNew();
    const publishedComponent = new PublishedComponent({ model: this.model, isCompact: true, state: { isDisabled } });

    this.listenTo(publishedComponent, 'change:status', status => {
      this.model.save({ status });
    });

    this.showChildView('published', publishedComponent);
  },
  showOwner() {
    const isDisabled = this.model.isNew();
    const ownerComponent = new OwnerComponent({ model: this.model, isCompact: true, state: { isDisabled } });

    this.listenTo(ownerComponent, 'change:owner', owner => {
      this.model.saveRole(owner);
    });

    this.showChildView('owner', ownerComponent);
  },
});

const ActionItemView = ItemView.extend({
  template: ActionItemTemplate,
  onClick() {
    Radio.trigger('event-router', 'program:action', this.model.get('_program'), this.model.id);
  },
  onRender() {
    this.showPublished();
    this.showOwner();
    this.showDue();
  },
  showDue() {
    const isDisabled = this.model.isNew();
    const dueDayComponent = new DueDayComponent({ model: this.model, isCompact: true, state: { isDisabled } });

    this.listenTo(dueDayComponent, 'change:days_until_due', day => {
      this.model.save({ days_until_due: day });
    });

    this.showChildView('due', dueDayComponent);
  },
});

const FlowItemView = ItemView.extend({
  template: FlowItemTemplate,
  templateContext() {
    return {
      isPublished: this.model.get('status') === 'published',
    };
  },
  onRender() {
    this.showOwner();
  },
  onClick() {
    Radio.trigger('event-router', 'programFlow', this.model.get('_program'), this.model.id);
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
    return - moment(model.get('updated_at')).format('X');
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
      className: 'picklist workflows__picklist',
      headingText: intl.admin.program.workflows.workflowsViews.addActionHeading,
      itemTemplate: hbs`
        <span class="{{ iconClassName }}">{{#if isFas}}{{fas icon}}{{else}}{{far icon}}{{/if}}</span>
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
