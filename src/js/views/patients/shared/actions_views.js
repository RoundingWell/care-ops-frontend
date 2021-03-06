import Radio from 'backbone.radio';
import hbs from 'handlebars-inline-precompile';
import { View } from 'marionette';

import { renderTemplate } from 'js/i18n';

import 'sass/modules/buttons.scss';

import Tooltip from 'js/components/tooltip';

import trim from 'js/utils/formatting/trim';

import StateComponent from './components/state_component';
import OwnerComponent from './components/owner_component';
import DueComponent from './components/due_component';
import TimeComponent from './components/time_component';
import DurationComponent from './components/duration_component';

const FormButton = View.extend({
  className: 'button-secondary--compact is-icon-only',
  tagName: 'button',
  template: hbs`{{far "poll-h"}}`,
  triggers: {
    'click': 'click',
  },
  onClick() {
    Radio.trigger('event-router', 'form:patientAction', this.model.id, this.model.getForm().id);
  },
});

const DetailsTooltip = View.extend({
  template: hbs`{{far "info-circle"}}`,
  onRender() {
    const template = hbs`
      {{#if flowName}}<p class="action-tooltip__flow"><span class="action-tooltip__flow-icon">{{fas "folder"}}</span>{{ flowName }}</p>{{/if}}
      <p><span class="action-tooltip__action-icon">{{far "file-alt"}}</span><span class="action-tooltip__action-name">{{ name }}</span></p>
      <p class="action-tooltip__action-details">{{ details }}</p>
    `;

    const flow = this.model.getFlow();

    new Tooltip({
      messageHtml: renderTemplate(template, {
        name: this.model.get('name'),
        flowName: flow ? flow.get('name') : null,
        details: this._formatDetails(this.model.get('details')),
      }),
      uiView: this,
      ui: this.$el,
    });
  },
  _formatDetails(details) {
    if (!details || details.length <= 140) return details;

    return `${ trim(details.slice(0, 140)) }...`;
  },
});

export {
  StateComponent,
  OwnerComponent,
  DueComponent,
  TimeComponent,
  DurationComponent,
  FormButton,
  DetailsTooltip,
};
