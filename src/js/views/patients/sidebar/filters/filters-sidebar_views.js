import { View, CollectionView } from 'marionette';
import hbs from 'handlebars-inline-precompile';

import 'scss/modules/buttons.scss';
import 'scss/modules/sidebar.scss';

import { animSidebar } from 'js/anim';

import Droplist from 'js/components/droplist';
import { CheckComponent } from 'js/views/patients/shared/actions_views';

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
  className: 'u-margin--t-32',
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

const StatesFilterView = View.extend({
  className: 'u-margin--b-8',
  template: hbs`
    <div class="flex flex-align-center">
      <div data-check-region class="u-margin--r-16"></div>
      <span class="action--{{ options.color }}">
        <span class="u-margin--r-8">{{fa options.iconType options.icon}}</span><span>{{ name }}</span>
      </span>
    </div>
  `,
  regions: {
    check: '[data-check-region]',
  },
  initialize({ state }) {
    this.state = state;
  },
  onRender() {
    this.showCheck();
  },
  toggleSelected(isSelected) {
    this.$el.toggleClass('is-selected', isSelected);
  },
  showCheck() {
    const stateId = this.model.get('id');
    const selectedStates = this.state.get('states');
    const isSelected = selectedStates && selectedStates.includes(stateId);

    this.toggleSelected(isSelected);

    const checkComponent = new CheckComponent({ state: { isSelected } });

    this.listenTo(checkComponent, {
      'select'() {
        this.triggerMethod('select', this.model, isSelected);
      },
      'change:selected': this.toggleSelected,
    });

    this.showChildView('check', checkComponent);
  },
});

const StatesFiltersView = CollectionView.extend({
  modelEvents: {
    'change:states': 'render',
  },
  childView: StatesFilterView,
  childViewOptions() {
    return {
      state: this.model,
    };
  },
  childViewTriggers: {
    'select': 'select:state',
  },
  className: 'sidebar__section',
  template: hbs`<h3 class="sidebar__heading u-margin--b-8">States</h3>`,
  onSelectState(model, isSelected) {
    const currentStatesList = this.model.get('states');

    if (isSelected) {
      const newStatesList = currentStatesList.filter(stateFilter => {
        return model.id !== stateFilter;
      });

      this.model.set('states', newStatesList);

      return;
    }

    this.model.set('states', [...currentStatesList, model.id]);
  },
});

const HeaderView = View.extend({
  modelEvents: {
    'change': 'render',
  },
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
    const filtersCount = this.model.getFiltersCount();

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
      <div data-custom-filters-region></div>
      <div data-states-filters-region></div>
    </div>
  `,
  regions: {
    header: {
      el: '[data-header-region]',
      replaceElement: true,
    },
    customFilters: '[data-custom-filters-region]',
    statesFilters: '[data-states-filters-region]',
  },
  triggers: {
    'click .js-close': 'close',
    'click .js-clear-filters': 'click:clearFilters',
  },
  onAttach() {
    animSidebar(this.el);
  },
});

export {
  LayoutView,
  HeaderView,
  CustomFiltersView,
  StatesFiltersView,
  groupLabelView,
};
