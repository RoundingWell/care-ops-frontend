import Radio from 'backbone.radio';
import hbs from 'handlebars-inline-precompile';
import { View, CollectionView } from 'marionette';

import 'sass/modules/list-pages.scss';
import 'sass/modules/table-list.scss';

import intl from 'js/i18n';

import './view-list.scss';

const viewViewsI18n = intl.patients.view.viewViews;

const ItemView = View.extend({
  className: 'table-list__item',
  tagName: 'tr',
  template: hbs`
    <td class="table-list__cell w-20 view-list__patient-name js-patient">{{ patient.first_name }} {{ patient.last_name }}</td>
    <td class="table-list__cell w-40"><span class="view-list__name-icon">{{far "file-alt"}}</span>{{ name }}</td>
    <td class="table-list__cell w-25"></td>
    <td class="table-list__cell w-15">{{ lastUpdated }}</td>
  `,
  templateContext() {
    return {
      patient: this.model.getPatient().attributes,
    };
  },
  triggers: {
    'click .js-patient': 'click:patient',
  },
  onClickPatient() {
    Radio.trigger('event-router', 'patient:dashboard', this.model.get('_patient'));
  },
});

const ListTitles = {
  'assigned-to-me': viewViewsI18n.listTitles.assignedToMe,
  'delegated-by-me': viewViewsI18n.listTitles.delegatedByMe,
};

const LayoutView = View.extend({
  className: 'flex-region',
  template: hbs`
    <div class="list-page__header">
      <div class="list-page__title">{{ title }}<span class="list-page__header-icon js-title-info">{{fas "info-circle"}}</span></div>
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
    return {
      title: ListTitles[this.getOption('viewId')],
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

export {
  LayoutView,
  ListView,
};
