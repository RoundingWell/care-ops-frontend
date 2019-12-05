import Radio from 'backbone.radio';
import hbs from 'handlebars-inline-precompile';
import { View } from 'marionette';

import { OwnerComponent, PublishedComponent } from 'js/views/admin/actions/actions_views';

import PreloadRegion from 'js/regions/preload_region';

import HeaderTemplate from './header.hbs';

import './program-flow.scss';

const ContextTrailView = View.extend({
  modelEvents: {
    'change:name': 'render',
  },
  className: 'program-flow__context-trail',
  template: hbs`
    {{#if hasLatestList}}
      <a class="js-back program-flow__context-link">
        {{fas "chevron-left"}}{{ @intl.admin.program.programViews.contextBackBtn }}
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
    const program = this.getOption('program');
    Radio.trigger('event-router', 'program:details', program.id);
  },
  templateContext() {
    const program = this.getOption('program');

    return {
      hasLatestList: Radio.request('history', 'has:latestList'),
      programName: program.get('name'),
      programId: program.id,
    };
  },
});

const HeaderView = View.extend({
  template: HeaderTemplate,
  regions: {
    published: '[data-published-region]',
    owner: '[data-owner-region]',
  },
  onRender() {
    this.showPublished();
    this.showOwner();
  },
  showPublished() {
    const publishedComponent = new PublishedComponent({ model: this.model, isCompact: true });

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

const LayoutView = View.extend({
  className: 'program-flow__frame',
  template: hbs`
    <div class="program-flow__layout">
      <div data-context-trail-region></div>
      <div class="program-flow__header" data-header-region></div>
      <div data-action-list-region></div>
    </div>
    <div class="program__sidebar" data-sidebar-region></div>
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
};
