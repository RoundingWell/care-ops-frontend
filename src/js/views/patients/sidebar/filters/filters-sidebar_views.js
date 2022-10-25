import { size, isNull } from 'underscore';
import { View, CollectionView } from 'marionette';
import hbs from 'handlebars-inline-precompile';

import 'scss/modules/buttons.scss';
import 'scss/modules/sidebar.scss';

import { animSidebar } from 'js/anim';

import Droplist from 'js/components/droplist';

import intl from 'js/i18n';

import FiltersSidebarTemplate from './filters-sidebar.hbs';

import './filters-sidebar.scss';

const groupLabelView = intl.patients.sidebar.filters.filtersSidebarViews.groupLabelView;

const CustomFilterDropList = Droplist.extend({
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

const CustomFilterView = View.extend({
  className: 'flex flex-align-center u-margin--b-8',
  template: hbs`
    <h4 class="sidebar__label">{{ name }}</h4>
    <div class="flex-grow" data-filter-button></div>
  `,
  regions: {
    filterButton: '[data-filter-button]',
  },
  initialize({ state }) {
    this.state = state;
    this.slug = this.model.get('slug');

    this.listenTo(state, `change:${ this.slug }`, this.render);
  },
  onRender() {
    const options = this.getOptions();
    const selected = options.get(this.state.get(this.slug)) || options.at(0);

    const customFilter = new CustomFilterDropList({
      collection: options,
      state: { selected },
    });

    this.listenTo(customFilter.getState(), 'change:selected', (state, { id }) => {
      this.state.set(this.slug, id);
    });

    this.showChildView('filterButton', customFilter);
  },
  getOptions() {
    const options = this.model.getOptions().clone();

    options.unshift({
      id: null,
      name: intl.patients.sidebar.filters.filtersSidebarViews.customFilterView.defaultText,
    });

    return options;
  },
});

const CustomFiltersView = CollectionView.extend({
  childView: CustomFilterView,
  childViewOptions() {
    return {
      state: this.getOption('state'),
    };
  },
});

const FiltersCountView = View.extend({
  tagName: 'span',
  template: hbs`({{filtersCount}})`,
  templateContext() {
    return {
      filtersCount: this.getOption('filtersCount'),
    };
  },
});

const LayoutView = View.extend({
  className: 'sidebar flex-region',
  template: FiltersSidebarTemplate,
  modelEvents: {
    'change': 'showFiltersCountView',
  },
  regions: {
    customFilters: '[data-custom-filters-region]',
    count: {
      el: '[data-count-region]',
      replaceElement: true,
    },
  },
  triggers: {
    'click .js-close': 'close',
    'click .js-clear-filters': 'click:clearFilters',
  },
  onAttach() {
    animSidebar(this.el);
  },
  onRender() {
    this.showFiltersCountView();
  },
  showFiltersCountView() {
    const filtersCount = size(this.model.omit(isNull));

    if (!filtersCount) {
      this.getRegion('count').empty();
      return;
    }

    this.showChildView('count', new FiltersCountView({ filtersCount }));
  },
});

export {
  LayoutView,
  CustomFiltersView,
  groupLabelView,
};
