import Radio from 'backbone.radio';
import hbs from 'handlebars-inline-precompile';
import { View } from 'marionette';

import 'sass/modules/table-list.scss';
import 'sass/modules/progress-bar.scss';

import { FlowStateComponent, OwnerComponent } from 'js/views/patients/shared/flows_views';

import FlowItemTemplate from './flow-item.hbs';

import 'sass/domain/action-state.scss';
import './worklist-list.scss';

const FlowTooltipTemplate = hbs`{{formatMessage (intlGet "patients.worklist.flowViews.flowListTooltips") title=worklistId role=role}}`;

const FlowEmptyView = View.extend({
  tagName: 'tr',
  template: hbs`
    <td class="table-empty-list">
      <h2>{{ @intl.patients.worklist.flowViews.flowEmptyView }}</h2>
    </td>
  `,
});

const ReadOnlyFlowStateView = View.extend({
  tagName: 'span',
  className: 'worklist-list__flow-status',
  template: hbs`<span class="action--{{ stateOptions.color }}">{{fa stateOptions.iconType stateOptions.icon}}</span>{{~ remove_whitespace ~}}`,
  templateContext() {
    const stateOptions = this.model.getState().get('options');

    return {
      stateOptions,
    };
  },
});

const FlowItemView = View.extend({
  className() {
    const state = this.getOption('state');
    const className = 'table-list__item work-list__item';

    if (state.isSelected(this.model)) {
      return `${ className } is-selected`;
    }

    return className;
  },
  tagName: 'tr',
  template: FlowItemTemplate,
  regions: {
    state: '[data-state-region]',
    owner: '[data-owner-region]',
  },
  templateContext() {
    return {
      patient: this.model.getPatient().attributes,
      isSelected: this.state.isSelected(this.model),
      owner: this.model.getOwner().get('name'),
      state: this.model.getState().get('name'),
    };
  },
  triggers: {
    'click': 'click',
    'click .js-patient': 'click:patient',
    'click .js-select': 'click:select',
    'click .js-no-click': 'prevent-row-click',
  },
  initialize({ state }) {
    this.state = state;

    this.listenTo(state, {
      'select:all': this.render,
      'select:none': this.render,
    });
  },
  onClick() {
    Radio.trigger('event-router', 'flow', this.model.id);
  },
  onClickPatient() {
    Radio.trigger('event-router', 'patient:dashboard', this.model.get('_patient'));
  },
  onClickSelect() {
    const isSelected = this.state.isSelected(this.model);
    this.$el.toggleClass('is-selected', !isSelected);
    this.state.toggleSelected(this.model, !isSelected);
    this.render();
  },
  onRender() {
    this.showState();
    this.showOwner();
    this.searchString = this.$el.text();
  },
  showState() {
    if (!this.model.isDone()) {
      const readOnlyStateView = new ReadOnlyFlowStateView({ model: this.model });
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
    const isDisabled = this.model.isDone();
    const ownerComponent = new OwnerComponent({
      owner: this.model.getOwner(),
      groups: this.model.getPatient().getGroups(),
      isCompact: true,
      state: { isDisabled },
    });

    this.listenTo(ownerComponent, 'change:owner', owner => {
      this.model.saveOwner(owner);
    });

    this.showChildView('owner', ownerComponent);
  },
});

export {
  FlowTooltipTemplate,
  FlowEmptyView,
  FlowItemView,
};
