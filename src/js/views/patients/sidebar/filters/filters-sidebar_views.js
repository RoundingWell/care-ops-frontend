import { View } from 'marionette';
import hbs from 'handlebars-inline-precompile';

import 'scss/modules/buttons.scss';
import 'scss/modules/sidebar.scss';

import { animSidebar } from 'js/anim';

import Droplist from 'js/components/droplist';

import FiltersSidebarTemplate from './filters-sidebar.hbs';

import './filters-sidebar.scss';

const SidebarGroupsDropList = Droplist.extend({
  popWidth() {
    return this.getView().$el.outerWidth();
  },
  viewOptions: {
    className: 'button-secondary w-100',
    template: hbs`{{ name }}`,
  },
  picklistOptions: {
    attr: 'name',
  },
});

const GroupsFilterView = View.extend({
  className: 'flex flex-align-center',
  template: hbs`
    <h4 class="sidebar__label">{{ @intl.patients.sidebar.filters.groups.droplistLabel }}</h4>
    <div class="flex-grow" data-filter-button></div>
  `,
  regions: {
    filterButton: '[data-filter-button]',
  },
  onRender() {
    const groups = this.getGroups();
    const selected = groups.get(this.getOption('groupId')) || groups.at(0);

    const groupsFilter = new SidebarGroupsDropList({
      collection: groups,
      state: { selected },
    });

    this.listenTo(groupsFilter.getState(), 'change:selected', (state, { id }) => {
      this.triggerMethod('select:group', id);
    });

    this.showChildView('filterButton', groupsFilter);
  },
  getGroups() {
    const groups = this.getOption('groups').clone();

    groups.unshift({
      id: null,
      name: 'All Groups',
    });

    return groups;
  },
});

const LayoutView = View.extend({
  className: 'sidebar flex-region',
  template: FiltersSidebarTemplate,
  regions: {
    groups: {
      el: '[data-groups-region]',
      replaceElement: true,
    },
  },
  triggers: {
    'click .js-close': 'close',
    'click .js-clear-filters': 'click:clear:filters',
  },
  childViewTriggers: {
    'select:group': 'select:group',
  },
  onAttach() {
    animSidebar(this.el);
  },
});

export {
  LayoutView,
  GroupsFilterView,
};
