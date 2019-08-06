import _ from 'underscore';
import anime from 'animejs';
import Backbone from 'backbone';
import hbs from 'handlebars-inline-precompile';
import { View } from 'marionette';

import 'sass/modules/buttons.scss';
import 'sass/modules/forms.scss';
import 'sass/modules/textarea-flex.scss';

import intl from 'js/i18n';

import PreloadRegion from 'js/regions/preload_region';

import InputWatcherBehavior from 'js/behaviors/input-watcher';
import Optionlist from 'js/components/optionlist';

import { StateComponent, OwnerComponent, DueComponent, DurationComponent } from 'js/views/patients/actions/actions_views';

import ActionSidebarTemplate from './action-sidebar.hbs';
import ActionNameTemplate from './action-name.hbs';
import ActionDetailsTemplate from './action-details.hbs';

import './action-sidebar.scss';

const DisabledSaveView = View.extend({
  template: hbs`<button disabled>{{ @intl.patients.sidebar.action.actionSidebarViews.disabledSaveView.saveBtn }}</button>`,
});

const SaveView = View.extend({
  template: hbs`<button class="js-cancel">{{ @intl.patients.sidebar.action.actionSidebarViews.saveView.cancelBtn }}</button><button class="js-save">{{ @intl.patients.sidebar.action.actionSidebarViews.saveView.saveBtn }}</button>`,
  triggers: {
    'click .js-cancel': 'cancel',
    'click .js-save': 'save',
  },
});

const NameView = View.extend({
  className: 'pos--relative',
  template: ActionNameTemplate,
  behaviors: [InputWatcherBehavior],
  ui: {
    input: '.js-input',
    spacer: '.js-spacer',
  },
  onWatchKeydown(evt) {
    if (evt.which === _.ENTER_KEY) {
      evt.preventDefault();
      return;
    }
  },
  onWatchChange(text) {
    const newText = _.removeNewline(text);
    this.ui.input.val(newText);
    this.ui.spacer.text(newText || ' ');

    this.model.set('name', newText);
  },
  templateContext() {
    return {
      isNew: this.model.isNew(),
    };
  },
});

const DetailsView = View.extend({
  className: 'pos--relative',
  template: ActionDetailsTemplate,
  behaviors: [InputWatcherBehavior],
  ui: {
    input: '.js-input',
    spacer: '.js-spacer',
  },
  onWatchChange(text) {
    this.ui.input.val(text);
    this.ui.spacer.text(text || ' ');

    this.model.set('details', _.trim(text));
  },
});

const LayoutView = View.extend({
  modelEvents: {
    'change:name change:details': 'showSave',
  },
  childViewTriggers: {
    'save': 'save',
    'cancel': 'cancel',
  },
  className: 'action-sidebar',
  template: ActionSidebarTemplate,
  regions: {
    name: '[data-name-region]',
    details: '[data-details-region]',
    state: '[data-state-region]',
    owner: '[data-owner-region]',
    due: '[data-due-region]',
    duration: '[data-duration-region]',
    save: '[data-save-region]',
    activity: {
      el: '[data-activity-region]',
      regionClass: PreloadRegion,
    },
    timestamps: '[data-timestamps-region]',
  },
  triggers: {
    'click .js-close': 'close',
    'click @ui.menu': 'click:menu',
  },
  ui: {
    menu: '.js-menu',
  },
  onClickMenu() {
    const menuOptions = new Backbone.Collection([
      {
        text: intl.patients.sidebar.action.actionSidebarViews.layoutView.menuOptions.delete,
        onSelect: _.bind(this.triggerMethod, this, 'delete'),
      },
    ]);

    const optionlist = new Optionlist({
      ui: this.ui.menu,
      uiView: this,
      lists: [{ collection: menuOptions }],
    });

    optionlist.show();
  },
  templateContext() {
    return {
      isNew: this.model.isNew(),
    };
  },
  initialize({ action }) {
    this.action = action;
  },
  onAttach() {
    anime({
      targets: this.el,
      translateX: [{ value: 20, duration: 0 }, { value: 0, duration: 200 }],
      opacity: [{ value: 0, duration: 0 }, { value: 1, duration: 300 }],
      easing: 'easeInOutQuad',
    });
  },
  onRender() {
    this.showName();
    this.showDetails();
    this.showState();
    this.showOwner();
    this.showDue();
    this.showDuration();
    this.showDisabledSave();
  },
  showName() {
    this.showChildView('name', new NameView({ model: this.model }));
  },
  showDetails() {
    this.showChildView('details', new DetailsView({ model: this.model }));
  },
  showMetaComponent(regionName, MetaComponent) {
    const metaComponent = new MetaComponent({
      model: this.action,
      state: { isDisabled: this.action.isNew() },
    });

    this.showChildView(regionName, metaComponent);

    return metaComponent;
  },
  showState() {
    const stateComponent = this.showMetaComponent('state', StateComponent);

    this.listenTo(stateComponent, 'change:state', ({ id }) => {
      this.action.saveState(id);
    });
  },
  showOwner() {
    const ownerComponent = this.showMetaComponent('owner', OwnerComponent);

    this.listenTo(ownerComponent, 'change:owner', owner => {
      this.action.saveOwner(owner);
    });
  },
  showDue() {
    const dueComponent = this.showMetaComponent('due', DueComponent);

    this.listenTo(dueComponent, 'change:due', date => {
      this.action.saveDue(date);
    });
  },
  showDuration() {
    const durationComponent = this.showMetaComponent('duration', DurationComponent);

    this.listenTo(durationComponent, 'change:duration', duration => {
      this.action.save({ duration });
    });
  },
  showSave() {
    if (!this.model.isValid()) return this.showDisabledSave();

    this.showChildView('save', new SaveView({ model: this.model }));
  },
  showDisabledSave() {
    if (!this.model.isNew()) return;
    this.showChildView('save', new DisabledSaveView());
  },
  onSave() {
    this.getRegion('save').empty();
  },
  onCancel() {
    this.model.set(this.action.attributes);
    this.getRegion('save').empty();
    this.showName();
    this.showDetails();
  },
});

export {
  LayoutView,
};
