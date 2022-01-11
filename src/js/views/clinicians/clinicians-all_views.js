import { map, sortBy } from 'underscore';
import hbs from 'handlebars-inline-precompile';
import Radio from 'backbone.radio';
import { View, CollectionView, Behavior } from 'marionette';

import PreloadRegion from 'js/regions/preload_region';
import { AccessComponent, RoleComponent, StateComponent } from 'js/views/clinicians/shared/clinicians_views';

import 'sass/modules/list-pages.scss';
import 'sass/modules/table-list.scss';

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

const EmptyView = View.extend({
  tagName: 'tr',
  template: hbs`
    <td class="table-empty-list">
      <h2>{{ @intl.clinicians.cliniciansAllViews.emptyView }}</h2>
    </td>
  `,
});

const ItemView = View.extend({
  modelEvents: {
    'change:enabled': 'render',
  },
  className: 'table-list__item',
  behaviors: [RowBehavior],
  tagName: 'tr',
  regions: {
    role: '[data-role-region]',
    access: '[data-access-region]',
    state: '[data-state-region]',
  },
  triggers: {
    'click': 'click',
  },
  template: hbs`
    <td class="table-list__cell w-20">{{#unless name}}{{ @intl.clinicians.cliniciansAllViews.itemView.newClinician }}{{/unless}}{{ name }}</td>
    <td class="table-list__cell w-30 {{#unless groups}}table-list__cell--empty{{/unless}}">{{#each groups}}{{#unless @first}}, {{/unless}}{{ this.name }}{{/each}}{{#unless groups}}{{ @intl.clinicians.cliniciansAllViews.itemView.noGroups }}{{/unless}}</td>
    <td class="table-list__cell w-30"><span class="u-margin--r-8" data-state-region></span><span class="u-margin--r-8" data-access-region></span><span data-role-region></span></td>
    <td class="table-list__cell w-20 {{#unless last_active_at}}table-list__cell--empty{{/unless}}">{{formatDateTime last_active_at "TIME_OR_DAY" defaultHtml=(intlGet "clinicians.cliniciansAllViews.itemView.noLastActive")}}</td>
  `,
  templateContext() {
    return {
      groups: sortBy(map(this.model.getGroups().models, 'attributes'), 'name'),
    };
  },
  onRender() {
    this.showRole();
    this.showAccess();
    this.showState();
  },
  onClick() {
    if (this.model.isNew()) {
      return;
    }

    Radio.trigger('event-router', 'clinician', this.model.id);
  },
  showState() {
    const isActive = this.model.isActive();
    const selectedId = this.model.get('enabled') ? 'enabled' : 'disabled';

    const stateComponent = new StateComponent({ isActive, selectedId, isCompact: true });

    this.listenTo(stateComponent, 'change:selected', selected => {
      this.model.save({ enabled: selected.id !== 'disabled' });
    });

    this.showChildView('state', stateComponent);
  },
  showAccess() {
    const accessComponent = new AccessComponent({
      access: this.model.get('access'),
      isCompact: true,
      state: { isDisabled: !this.model.get('enabled') },
    });

    this.listenTo(accessComponent, 'change:access', accessType => {
      this.model.save({ access: accessType });
    });

    this.showChildView('access', accessComponent);
  },
  showRole() {
    const roleComponent = new RoleComponent({
      role: this.model.getRole(),
      isCompact: true,
      state: { isDisabled: !this.model.get('enabled') },
    });

    this.listenTo(roleComponent, 'change:role', role => {
      this.model.saveRole(role);
    });

    this.showChildView('role', roleComponent);
  },
});

const LayoutView = View.extend({
  className: 'flex-region',
  template: hbs`
    <div class="list-page__header">
      <div class="list-page__title"><span class="list-page__title-icon">{{far "users-cog"}}</span>{{ @intl.clinicians.cliniciansAllViews.layoutView.title }}</div>
      <button class="u-margin--b-16 button-primary js-add-clinician">{{far "plus-circle"}}<span>{{ @intl.clinicians.cliniciansAllViews.layoutView.addClinicianButton }}</span></button>
    </div>
    <div class="flex-region list-page__list">
      <table class="w-100"><tr>
        <td class="table-list__header w-20">{{ @intl.clinicians.cliniciansAllViews.layoutView.clinicianHeader }}</td>
        <td class="table-list__header w-30">{{ @intl.clinicians.cliniciansAllViews.layoutView.groupsHeader }}</td>
        <td class="table-list__header w-30">{{ @intl.clinicians.cliniciansAllViews.layoutView.attributesHeader }}</td>
        <td class="table-list__header w-20">{{ @intl.clinicians.cliniciansAllViews.layoutView.lastActiveHeader }}</td>
      </tr></table>
      <div class="flex-region" data-list-region></div>
    </div>
  `,
  regions: {
    list: {
      el: '[data-list-region]',
      regionClass: PreloadRegion,
    },
    sidebar: '[data-sidebar-region]',
    addClinician: {
      el: '[data-add-region]',
      replaceElement: true,
    },
  },
  triggers: {
    'click .js-add-clinician': 'click:addClinician',
  },
});

const ListView = CollectionView.extend({
  className: 'table-list',
  tagName: 'table',
  childView: ItemView,
  emptyView: EmptyView,
  collectionEvents: {
    'change:name': 'sort',
  },
  viewComparator({ model }) {
    return String(model.get('name')).toLowerCase();
  },
});

export {
  LayoutView,
  ListView,
};
