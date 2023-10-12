import hbs from 'handlebars-inline-precompile';
import { View } from 'marionette';

export default View.extend({
  tagName: 'button',
  attributes() {
    return {
      'disabled': this.getOption('isDisabled'),
    };
  },
  className() {
    const classNames = ['program-action-sidebar__toggle button-secondary'];

    if (this.getOption('status')) classNames.push('is-on');

    return classNames.join(' ');
  },
  template: hbs`
    {{#if status}}{{fas "toggle-on"}}{{else}}{{far "toggle-off"}}{{/if}}
    {{formatMessage (intlGet "programs.shared.components.toggleComponent.toggle") status=status}}
  `,
  templateContext() {
    return {
      status: this.getOption('status'),
    };
  },
  triggers: {
    'click': 'click',
  },
});
