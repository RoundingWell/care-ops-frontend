import _ from 'underscore';
import Backbone from 'backbone';
import hbs from 'handlebars-inline-precompile';
import { View } from 'marionette';

import 'sass/modules/buttons.scss';
import 'sass/modules/forms.scss';
import 'sass/modules/textarea-flex.scss';

import InputWatcherBehavior from 'js/behaviors/input-watcher';
import Optionlist from 'js/components/optionlist';

import { StateComponent, OwnerComponent, DueComponent, DurationComponent } from 'js/views/patients/actions/actions_views';

import ActionSidebarTemplate from './action-sidebar.hbs';
import ActionNameTemplate from './action-name.hbs';
import ActionDetailsTemplate from './action-details.hbs';

import './action-sidebar.scss';

const DisabledSaveView = View.extend({
  template: hbs`<button disabled>Save</button>`,
});

const SaveView = View.extend({
  template: hbs`<button class="js-cancel">Cancel</button><button class="js-save">Save</button>`,
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
    this.ui.spacer.text(newText);

    this.model.set('name', newText);
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
    this.ui.spacer.text(text);

    this.model.set('details', _.trim(text));
  },
});

const LayoutView = View.extend({
  modelEvents: {
    'change': 'showSave',
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
    activity: '[data-activity-region]',
    timestamps: '[data-timestamps-region]',
  },
  triggers: {
    'click .js-close': 'cancel',
    'click @ui.menu': 'click:menu',
  },
  ui: {
    menu: '.js-menu',
  },
  onClickMenu() {
    const menuOptions = new Backbone.Collection([
      {
        text: 'Delete Action',
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
  showState() {
    const stateComponent = new StateComponent({ model: this.model });

    this.listenTo(stateComponent, 'change:state', ({ id }) => {
      this.model.set({ _state: id });
    });

    this.showChildView('state', stateComponent);
  },
  showOwner() {
    const ownerComponent = new OwnerComponent({ model: this.model });

    this.listenTo(ownerComponent, 'change:owner', owner => {
      if (owner.type === 'clinicians') {
        this.model.set({
          _role: null,
          _clinician: owner.id,
        });
        return;
      }

      this.model.set({
        _role: owner.id,
        _clinician: null,
      });
    });

    this.showChildView('owner', ownerComponent);
  },
  showDue() {
    const dueComponent = new DueComponent({ model: this.model });

    this.listenTo(dueComponent, 'change:due', date => {
      this.model.setDue(date);
    });

    this.showChildView('due', dueComponent);
  },
  showDuration() {
    const durationComponent = new DurationComponent({ model: this.model });

    this.listenTo(durationComponent, 'change:duration', duration => {
      this.model.set({ duration });
    });

    this.showChildView('duration', durationComponent);
  },
  showSave() {
    if (!this.model.isValid()) return this.showDisabledSave();

    this.showChildView('save', new SaveView({ model: this.model }));
  },
  showDisabledSave() {
    this.showChildView('save', new DisabledSaveView());
  },
  onSave() {
    this.showDisabledSave();
  },
});

export {
  LayoutView,
};
