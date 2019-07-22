import Radio from 'backbone.radio';
import hbs from 'handlebars-inline-precompile';
import { View, CollectionView, Region } from 'marionette';

import 'sass/modules/list-pages.scss';
import 'sass/modules/table-list.scss';

import intl from 'js/i18n';

import Droplist from 'js/components/droplist';

import { StateComponent, OwnerComponent, DueComponent } from 'js/views/patients/actions/actions_views';

import './view-list.scss';

const ItemView = View.extend({
  className: 'table-list__item',
  tagName: 'tr',
  template: hbs`
    <td class="table-list__cell w-20 view-list__patient-name js-patient">{{ patient.first_name }} {{ patient.last_name }}</td>
    <td class="table-list__cell w-40"><span class="view-list__name-icon">{{far "file-alt"}}</span>{{ name }}</td>
    <td class="table-list__cell w-25">
      <div data-state-region></div>
      <div data-owner-region></div>
      <div data-due-region></div>
    </td>
    <td class="table-list__cell w-15">{{formatMoment updated_at "TIME_OR_DAY"}}</td>
  `,
  regionClass: Region.extend({ replaceElement: true }),
  regions: {
    state: '[data-state-region]',
    owner: '[data-owner-region]',
    due: '[data-due-region]',
  },
  templateContext() {
    return {
      patient: this.model.getPatient().attributes,
    };
  },
  triggers: {
    'click': 'click',
    'click .js-patient': 'click:patient',
  },
  onClick() {
    Radio.trigger('event-router', 'patient:action', this.model.get('_patient'), this.model.id);
  },
  onClickPatient() {
    Radio.trigger('event-router', 'patient:dashboard', this.model.get('_patient'));
  },
  onRender() {
    this.showState();
    this.showOwner();
    this.showDue();
  },
  showState() {
    const stateComponent = new StateComponent({ model: this.model, isCompact: true });

    this.listenTo(stateComponent, 'change:state', ({ id }) => {
      this.model.saveState(id);
    });

    this.showChildView('state', stateComponent);
  },
  showOwner() {
    const ownerComponent = new OwnerComponent({ model: this.model, isCompact: true });

    this.listenTo(ownerComponent, 'change:owner', owner => {
      this.model.saveOwner(owner);
    });

    this.showChildView('owner', ownerComponent);
  },
  showDue() {
    const dueComponent = new DueComponent({ model: this.model, isCompact: true });

    this.listenTo(dueComponent, 'change:due', date => {
      this.model.saveDue(date);
    });

    this.showChildView('due', dueComponent);
  },
});

const LayoutView = View.extend({
  className: 'flex-region',
  template: hbs`
    <div class="list-page__header">
      <div class="list-page__title">{{formatMessage (intlGet "patients.view.viewViews.listTitles") title=viewId role=role}}<span class="list-page__header-icon js-title-info">{{fas "info-circle"}}</span></div>
      <div class="list-page__filters" data-filters-region></div>
      <table class="w-100 js-list-header"><tr>
        <td class="table-list__header w-20">{{ @intl.patients.view.viewViews.layoutView.patientHeader }}</td>
        <td class="table-list__header w-40">{{ @intl.patients.view.viewViews.layoutView.actionHeader }}</td>
        <td class="table-list__header w-25">{{ @intl.patients.view.viewViews.layoutView.attrHeader }}</td>
        <td class="table-list__header w-15">{{ @intl.patients.view.viewViews.layoutView.updatedHeader }}</td>
      </tr></table>
    </div>
    <div class="flex-region list-page__list js-list" data-list-region></div>
  `,
  templateContext() {
    const currentClinician = Radio.request('auth', 'currentUser');

    return {
      role: currentClinician.getRole().get('name'),
      viewId: this.getOption('viewId').replace(/-/g, ''),
    };
  },
  regions: {
    filters: '[data-filters-region]',
    list: '[data-list-region]',
  },
  childViewEvents: {
    'update:listDom': 'fixWidth',
  },
  ui: {
    listHeader: '.js-list-header',
    list: '.js-list',
  },
  fixWidth() {
    if (!this.isRendered()) return;

    const headerWidth = this.ui.listHeader.width();
    const listWidth = this.ui.list.contents().width();
    const listPadding = parseInt(this.ui.list.css('paddingRight'), 10);
    const scrollbarWidth = headerWidth - listWidth;

    this.ui.list.css({ paddingRight: `${ listPadding - scrollbarWidth }px` });
  },
});

const ListView = CollectionView.extend({
  className: 'table-list',
  tagName: 'table',
  childView: ItemView,
  onAttach() {
    this.triggerMethod('update:listDom', this);
  },
  onRenderChildren() {
    if (!this.isAttached()) return;
    this.triggerMethod('update:listDom', this);
  },
});

const GroupsDropList = Droplist.extend({
  viewOptions: {
    className: 'button--white',
    template: hbs`{{fas "filter"}} {{ name }} {{far "angle-down"}}`,
  },
  picklistOptions: {
    attr: 'name',
  },
});

export {
  LayoutView,
  ListView,
  GroupsDropList,
};
