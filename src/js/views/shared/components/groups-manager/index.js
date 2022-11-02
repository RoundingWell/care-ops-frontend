import Radio from 'backbone.radio';
import hbs from 'handlebars-inline-precompile';
import { CollectionView, View } from 'marionette';

import 'scss/modules/list-manager.scss';

import Droplist from 'js/components/droplist';

const GroupsItemView = View.extend({
  tagName: 'li',
  className() {
    if (this.getOption('isDisabled')) return 'list-manager__item is-disabled';

    return 'list-manager__item';
  },
  template: hbs`{{far "users"}}<span>{{name}}</span>{{#unless isDisabled}}<button class="button--icon list-manager__remove js-remove">{{far "trash-can"}}</button>{{/unless}}`,
  templateContext() {
    return {
      isDisabled: this.getOption('isDisabled'),
    };
  },
  triggers: {
    'click .js-remove': 'remove',
  },
});

const GroupsListView = CollectionView.extend({
  tagName: 'ul',
  childView: GroupsItemView,
  childViewOptions() {
    return {
      isDisabled: this.getOption('isDisabled'),
    };
  },
  childViewTriggers: {
    'remove': 'remove',
  },
  onRemove(child) {
    this.triggerMethod('remove:member', child.model);
  },
});

const GroupsDropList = Droplist.extend({
  initialize() {
    this.listenTo(this.collection, 'update', this.show);
  },
  popWidth() {
    return this.getView().$el.outerWidth();
  },
  viewOptions: {
    className: 'button-secondary list-manager__droplist',
    template: hbs`{{far "users"}}<span>{{ @intl.shared.components.groupsManager.groupsDroplist.addGroup }}</span>`,
  },
  picklistOptions: {
    attr: 'name',
  },
  onShow() {
    const isDisabled = this.getOption('isDisabled');

    this.setState({ isDisabled: isDisabled || this.collection.length === 0 });
  },
  onPicklistSelect({ model }) {
    this.triggerMethod('add:member', model);
    this.popRegion.empty();
  },
});

export default View.extend({
  className: 'list-manager__wrapper',
  template: hbs`
    <div data-groups-region></div>
    <div data-droplist-region></div>
  `,
  regions: {
    groups: '[data-groups-region]',
    droplist: '[data-droplist-region]',
  },
  initialize({ member }) {
    this.currentClinician = Radio.request('bootstrap', 'currentUser');
    this.member = member;
    this.memberGroups = this.member.getGroups();
    this.groups = this.currentClinician.getGroups();

    this.groups.remove(this.memberGroups.models);
  },
  onRender() {
    this.showGroups();
    this.showDroplist();
  },
  showGroups() {
    const groupsView = this.showChildView('groups', new GroupsListView({
      collection: this.memberGroups,
      isDisabled: this.getOption('isDisabled'),
    }));

    this.listenTo(groupsView, 'remove:member', this.removeMemberGroup);
  },
  showDroplist() {
    if (this.getOption('isDisabled')) return;

    const droplist = this.showChildView('droplist', new GroupsDropList({
      collection: this.groups,
      ...this.getOption('droplistOptions'),
    }));

    this.listenTo(droplist, 'add:member', this.addMemberGroup);
  },
  addMemberGroup(group) {
    this.memberGroups.add(group);
    this.groups.remove(group);
    this.triggerMethod('add:member', this.member, group);
  },
  removeMemberGroup(group) {
    this.memberGroups.remove(group);
    this.groups.add(group);
    this.triggerMethod('remove:member', this.member, group);
  },
});
