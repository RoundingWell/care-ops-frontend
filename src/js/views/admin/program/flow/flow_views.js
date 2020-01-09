import Radio from 'backbone.radio';
import hbs from 'handlebars-inline-precompile';
import { View, CollectionView } from 'marionette';

import PreloadRegion from 'js/regions/preload_region';

import { DueDayComponent, OwnerComponent, PublishedComponent } from 'js/views/admin/actions/actions_views';

import HeaderTemplate from './header.hbs';
import ActionItemTemplate from './action-item.hbs';

import './program-flow.scss';

const ContextTrailView = View.extend({
  modelEvents: {
    'change:name': 'render',
  },
  initialize({ program }) {
    this.program = program;

    this.listenTo(this.program, 'change:name', this.render);
  },
  className: 'program-flow__context-trail',
  template: hbs`
    {{#if hasLatestList}}
      <a class="js-back program-flow__context-link">
        {{fas "chevron-left"}}{{ @intl.admin.program.flowViews.contextBackBtn }}
      </a>
      {{fas "chevron-right"}}
    {{/if}}
    <a class="js-program program-flow__context-link">{{ programName }}</a>{{fas "chevron-right"}}{{ name }}
  `,
  triggers: {
    'click .js-back': 'click:back',
    'click .js-program': 'click:program',
  },
  onClickBack() {
    Radio.request('history', 'go:latestList');
  },
  onClickProgram() {
    Radio.trigger('event-router', 'program:details', this.program.id);
  },
  templateContext() {
    return {
      hasLatestList: Radio.request('history', 'has:latestList'),
      programName: this.program.get('name'),
    };
  },
});

const HeaderView = View.extend({
  modelEvents: {
    'editing': 'onEditing',
    'change': 'render',
  },
  onEditing(isEditing) {
    this.ui.flow.toggleClass('is-selected', isEditing);
  },
  template: HeaderTemplate,
  regions: {
    published: '[data-published-region]',
    owner: '[data-owner-region]',
  },
  triggers: {
    'click @ui.flow': 'edit',
    'click .js-add-action': 'click:addAction',
  },
  ui: {
    flow: '.js-flow',
  },
  onRender() {
    this.showPublished();
    this.showOwner();
  },
  showPublished() {
    const publishedComponent = new PublishedComponent({
      model: this.model,
      isCompact: true,
    });

    this.listenTo(publishedComponent, 'change:status', status => {
      this.model.save({ status });
    });

    this.showChildView('published', publishedComponent);
  },
  showOwner() {
    const ownerComponent = new OwnerComponent({ model: this.model, isCompact: true });

    this.listenTo(ownerComponent, 'change:owner', owner => {
      this.model.saveRole(owner);
    });

    this.showChildView('owner', ownerComponent);
  },
});

const EmptyView = View.extend({
  tagName: 'tr',
  template: hbs`
    <td class="workflows__empty-list">
      <h2>{{ @intl.admin.program.flowViews.emptyView }}</h2>
    </td>
  `,
});

const ActionItemView = View.extend({
  modelEvents: {
    'change:id': 'render',
  },
  className() {
    if (this.model.isNew()) return 'table-list__item is-selected';

    return 'table-list__item';
  },
  initialize() {
    this.action = this.model.getAction();

    this.listenTo(this.action, {
      'change'() {
        if (this.model.isNew()) return;
        this.render();
      },
      'editing': this.onEditing,
    });
  },
  template: ActionItemTemplate,
  templateContext() {
    const programAction = this.model.getAction();
    return {
      hasAttachment: programAction.getForm(),
    };
  },
  serializeData() {
    return this.model.getAction().attributes;
  },
  tagName: 'tr',
  regions: {
    published: '[data-published-region]',
    owner: '[data-owner-region]',
    due: '[data-due-region]',
  },
  triggers: {
    'click': 'click',
  },
  onClick() {
    if (this.model.isNew()) {
      Radio.trigger('event-router', 'programFlow:action:new', this.model.get('_program_flow'));
      return;
    }
    Radio.trigger('event-router', 'programFlow:action', this.model.get('_program_flow'), this.model.get('_program_action'));
  },
  onEditing(isEditing) {
    this.$el.toggleClass('is-selected', isEditing);
  },
  onRender() {
    this.showPublished();
    this.showOwner();
    this.showDue();
  },
  showDue() {
    const isDisabled = this.model.isNew();
    const dueDayComponent = new DueDayComponent({ model: this.action, isCompact: true, state: { isDisabled } });

    this.listenTo(dueDayComponent, 'change:days_until_due', day => {
      this.action.save({ days_until_due: day });
    });

    this.showChildView('due', dueDayComponent);
  },
  showPublished() {
    const isDisabled = this.model.isNew();
    const publishedComponent = new PublishedComponent({ model: this.action, isCompact: true, state: { isDisabled } });

    this.listenTo(publishedComponent, 'change:status', status => {
      this.action.save({ status });
    });

    this.showChildView('published', publishedComponent);
  },
  showOwner() {
    const isDisabled = this.model.isNew();
    const ownerComponent = new OwnerComponent({ model: this.action, isCompact: true, state: { isDisabled } });

    this.listenTo(ownerComponent, 'change:owner', owner => {
      this.action.saveRole(owner);
    });

    this.showChildView('owner', ownerComponent);
  },
});

const ListView = CollectionView.extend({
  className: 'table-list program-flow__list',
  tagName: 'table',
  childView: ActionItemView,
  emptyView: EmptyView,
});

const LayoutView = View.extend({
  className: 'program-flow__frame',
  template: hbs`
    <div class="program-flow__layout">
      <div data-context-trail-region></div>
      <div data-header-region></div>
      <div data-action-list-region></div>
    </div>
    <div class="program-flow__sidebar" data-sidebar-region></div>
  `,
  regions: {
    contextTrail: {
      el: '[data-context-trail-region]',
      replaceElement: true,
    },
    header: '[data-header-region]',
    sidebar: {
      el: '[data-sidebar-region]',
      replaceElement: true,
    },
    actionList: {
      el: '[data-action-list-region]',
      regionClass: PreloadRegion,
      replaceElement: true,
    },
  },
});

export {
  LayoutView,
  ContextTrailView,
  HeaderView,
  ListView,
};
