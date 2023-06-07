import Radio from 'backbone.radio';
import hbs from 'handlebars-inline-precompile';
import { View } from 'marionette';

import 'scss/modules/table-list.scss';
import 'scss/modules/progress-bar.scss';

import { CheckComponent, FlowStateComponent, OwnerComponent } from 'js/views/patients/shared/flows_views';

import FlowItemTemplate from './flow-item.hbs';

import 'scss/domain/action-state.scss';
import './worklist-list.scss';

const FlowTooltipTemplate = hbs`{{formatMessage (intlGet "patients.worklist.flowViews.flowListTooltips") title=worklistId team=owner}}`;

const FlowEmptyView = View.extend({
  tagName: 'tr',
  template: hbs`
    <td class="table-empty-list">
      <h2>{{ @intl.patients.worklist.flowViews.flowEmptyView }}</h2>
    </td>
  `,
});

const ReadOnlyStateView = View.extend({
  tagName: 'span',
  className: 'worklist-list__readonly worklist-list__status',
  template: hbs`<span class="action--{{ stateOptions.color }}">{{fa stateOptions.iconType stateOptions.icon}}</span>{{~ remove_whitespace ~}}`,
  templateContext() {
    const stateOptions = this.model.getState().get('options');

    return {
      stateOptions,
    };
  },
});

const ReadOnlyOwnerView = View.extend({
  tagName: 'span',
  className: 'worklist-list__readonly worklist-list__owner',
  template: hbs`{{far "circle-user" classes="u-margin--r-8"}}<span>{{ owner }}</span>`,
  templateContext() {
    return {
      owner: this.model.getOwner().get('name'),
    };
  },
});

const FlowItemView = View.extend({
  className: 'table-list__item work-list__item',
  tagName: 'tr',
  template: FlowItemTemplate,
  regions: {
    check: '[data-check-region]',
    state: '[data-state-region]',
    owner: '[data-owner-region]',
  },
  templateContext() {
    return {
      patient: this.model.getPatient().attributes,
      owner: this.model.getOwner().get('name'),
      state: this.model.getState().get('name'),
    };
  },
  modelEvents: {
    'change': 'render',
  },
  triggers: {
    'click': 'click',
    'click .js-patient-sidebar-button': 'click:patientSidebarButton',
    'click .js-patient': 'click:patient',
    'click .js-no-click': 'prevent-row-click',
  },
  initialize({ state }) {
    this.state = state;

    this.listenTo(state, {
      'select:multiple': this.showCheck,
      'select:none': this.showCheck,
    });
  },
  onClick() {
    Radio.trigger('event-router', 'flow', this.model.id);
  },
  onClickPatient() {
    Radio.trigger('event-router', 'patient:dashboard', this.model.get('_patient'));
  },
  onRender() {
    const canEdit = this.canEdit;
    this.canEdit = this.model.canEdit();

    this.showCheck();
    this.showState();
    this.showOwner();

    if (canEdit !== this.canEdit) {
      if (!this.canEdit) this.toggleSelected(false);
      this.triggerMethod('change:canEdit');
    }
  },
  toggleSelected(isSelected) {
    this.$el.toggleClass('is-selected', isSelected);
  },
  showCheck() {
    if (!this.canEdit) return;

    const isSelected = this.state.isSelected(this.model);
    this.toggleSelected(isSelected);
    const checkComponent = new CheckComponent({ state: { isSelected } });

    this.listenTo(checkComponent, {
      'select'(domEvent) {
        this.triggerMethod('select', this, !!domEvent.shiftKey);
      },
      'change:isSelected': this.toggleSelected,
    });

    this.showChildView('check', checkComponent);
  },
  showState() {
    if (!this.model.isDone() || !this.canEdit) {
      const readOnlyStateView = new ReadOnlyStateView({ model: this.model });
      this.showChildView('state', readOnlyStateView);
      return;
    }

    const stateComponent = new FlowStateComponent({
      stateId: this.model.get('_state'),
      isCompact: true,
    });

    this.listenTo(stateComponent, 'change:state', state => {
      this.model.saveState(state);
    });

    this.showChildView('state', stateComponent);
  },
  showOwner() {
    if (!this.canEdit) {
      const readOnlyOwnerView = new ReadOnlyOwnerView({ model: this.model });
      this.showChildView('owner', readOnlyOwnerView);
      return;
    }

    const isDisabled = this.model.isDone();
    this.ownerComponent = new OwnerComponent({
      owner: this.model.getOwner(),
      isCompact: true,
      state: { isDisabled },
    });

    this.listenTo(this.ownerComponent, 'change:owner', owner => {
      this.model.saveOwner(owner);
    });

    this.showChildView('owner', this.ownerComponent);
  },
});

export {
  FlowTooltipTemplate,
  FlowEmptyView,
  FlowItemView,
};
