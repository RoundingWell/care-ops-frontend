import hbs from 'handlebars-inline-precompile';
import { View } from 'marionette';

import 'scss/modules/buttons.scss';

const LoginView = View.extend({
  ui: {
    date: '.js-date',
    submit: '.js-submit',
  },
  triggers: {
    'change @ui.date': 'change:date',
    'blur @ui.date': 'blur:date',
    'click @ui.submit': 'click:submit',
  },
  modelEvents: {
    'change:hasError': 'render',
  },
  template: hbs`
    <div class="dialog__icon">{{far "lock-keyhole"}}</div>
    <div>Enter your date of birth to access this form.</div>
    <div><input type="date" class="js-date dialog__input{{#if hasError}} has-error{{/if}}" required pattern="\d{4}-\d{2}-\d{2}" placeholder="Your Date of Birth" value="{{ dob }}"></div>
    {{#if hasError}}<div class="dialog__error">That date of birth does not match our records. Please try again.</div>{{/if}}
    <div><button class="button--green dialog__button js-submit" {{#unless dob}}disabled{{/unless}}>Continue to Form {{fas "right-to-bracket"}}</button></div>
  `,
  onChangeDate() {
    const dob = this.ui.date.val();
    this.model.set({ dob });
    this.ui.submit.prop('disabled', !dob);
  },
  onBlurDate() {
    this.model.set({ hasError: false });
  },
});

const ResponseErrorView = View.extend({
  template: hbs`
    <div class="dialog__icon--success">{{fas "circle-check"}}</div>
    <div>This form has already been submitted.</div>
  `,
});

const NotAvailableView = View.extend({
  template: hbs`
    <div class="dialog__icon--warn">{{far "octagon-minus"}}</div>
    <div>This form is no longer shared. Nothing else to do here.</div>
  `,
});

export {
  LoginView,
  ResponseErrorView,
  NotAvailableView,
};
