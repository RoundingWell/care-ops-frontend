import { size, isNull } from 'underscore';
import { View, CollectionView } from 'marionette';
import hbs from 'handlebars-inline-precompile';

import 'scss/modules/buttons.scss';
import 'scss/modules/sidebar.scss';

import { animSidebar } from 'js/anim';

import Droplist from 'js/components/droplist';

import intl from 'js/i18n';

import './filters-sidebar.scss';

const i18n = intl.patients.sidebar.filters.filtersSidebarViews;

const groupLabelView = i18n.groupLabelView;

const CustomFilterDropList = Droplist.extend({
  popWidth() {
    return this.getView().$el.outerWidth();
  },
  viewOptions: {
    className: 'button-secondary w-100',
    template: hbs`{{ name }}`,
  },
  picklistOptions() {
    return {
      attr: 'name',
      isSelectlist: true,
      headingText: i18n.customFilterDropList.headingText,
      placeholderText: `${ this.getOption('filterTitle') }...`,
    };
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
      filterTitle: this.model.get('name'),
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
      name: i18n.customFilterView.defaultText,
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
  viewComparator({ model }) {
    return String(model.get('name')).toLowerCase();
  },
});

const HeaderView = View.extend({
  template: hbs`
    <div class="flex flex-align-center">
      <div class="flex-grow">
        <h3 class="sidebar__heading">
          <span class="u-margin--r-8">{{far "sliders"}}</span>{{ @intl.patients.sidebar.filters.filtersSidebarViews.headerView.allFiltersLabel }}
          {{#if filtersCount}}<span>({{filtersCount}})</span>{{/if}}
        </h3>
      </div>
      <div class="flex flex-align-center">
        <button class="filters-sidebar__clear-filters js-clear-filters" {{#if isClearDisabled}}disabled{{/if}}>
          {{ @intl.patients.sidebar.filters.filtersSidebarViews.headerView.clearFilters }}
        </button>
        <button class="filters-sidebar__close button--icon js-close">{{fas "xmark"}}</button>
      </div>
    </div>
  `,
  templateContext() {
    const filtersCount = this.getOption('filtersCount');

    return {
      filtersCount,
      isClearDisabled: !filtersCount,
    };
  },
});

const LayoutView = View.extend({
  className: 'sidebar flex-region',
  template: hbs`
    <div class="flex-grow">
      <div data-header-region></div>
      <div class="u-margin--t-32" data-custom-filters-region></div>
    </div>
  `,
  modelEvents: {
    'change': 'showHeaderView',
  },
  regions: {
    header: {
      el: '[data-header-region]',
      replaceElement: true,
    },
    customFilters: '[data-custom-filters-region]',
  },
  triggers: {
    'click .js-close': 'close',
    'click .js-clear-filters': 'click:clearFilters',
  },
  onAttach() {
    animSidebar(this.el);
  },
  onRender() {
    this.showHeaderView();
  },
  showHeaderView() {
    this.showChildView('header', new HeaderView({
      filtersCount: size(this.model.omit(isNull)),
    }));
  },
});

export {
  LayoutView,
  CustomFiltersView,
  groupLabelView,
};
