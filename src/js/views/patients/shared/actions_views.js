import Radio from 'backbone.radio';
import hbs from 'handlebars-inline-precompile';
import { View } from 'marionette';

import 'sass/modules/buttons.scss';

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

export {
  StateComponent,
  OwnerComponent,
  DueComponent,
  TimeComponent,
  DurationComponent,
  FormButton,
};
