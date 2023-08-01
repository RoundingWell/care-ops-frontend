import hbs from 'handlebars-inline-precompile';
import { View } from 'marionette';

import keyCodes from 'js/utils/formatting/key-codes';

import 'scss/modules/buttons.scss';
import 'scss/modules/forms.scss';

import './verify.scss';

const { BACKSPACE_KEY } = keyCodes;

const RequestCodeView = View.extend({
  ui: {
    submit: '.js-submit',
  },
  triggers: {
    'click @ui.submit': 'click:submit',
  },
  template: hbs`
    <div class="verify__icon verify__icon--blue">{{fat "user-lock"}}</div>
    <h2 class="verify__heading-text">Request a verification code to view this health resource.</h2>
    <p class="verify__info-text">We’ll send a text message with a verification code to the phone number XXX-XXX-{{ phoneEnd }}.</p>
    <button class="verify__submit button--green w-100 js-submit">Send Verification Code</button>
  `,
  templateContext() {
    return {
      phoneEnd: this.getOption('patientPhoneEnd'),
    };
  },
  onClickSubmit() {
    this.ui.submit.prop('disabled', true);
  },
});

const VerifyCodeView = View.extend({
  ui: {
    submit: '.js-submit',
    resend: '.js-resend',
    input: '.js-input',
  },
  triggers: {
    'click @ui.submit': 'click:submit',
    'click @ui.resend': 'click:resend',
  },
  events: {
    'input @ui.input': 'watchInput',
    'keydown @ui.input': 'watchKeydown',
  },
  template: hbs`
    <div class="verify__icon verify__icon--blue">{{fat "user-lock"}}</div>
    <h2 class="verify__heading-text">Enter your verification code.</h2>
    <p class="verify__info-text">We sent a text message with a verification code to the phone number XXX-XXX-{{ phoneEnd }}.</p>
    <div class="verify__code-fields">
      <input class="input-primary verify__code-input js-input{{#if hasInvalidCodeError}} has-error{{/if}}" />
      <input class="input-primary verify__code-input js-input{{#if hasInvalidCodeError}} has-error{{/if}}" />
      <input class="input-primary verify__code-input js-input{{#if hasInvalidCodeError}} has-error{{/if}}" />
      <input class="input-primary verify__code-input js-input{{#if hasInvalidCodeError}} has-error{{/if}}" />
    </div>
    {{#if hasInvalidCodeError}}
      <p class="verify__error-text">Incorrect verification code. Please try again.</p>
    {{/if}}
    <button class="verify__submit button--green w-100 js-submit" disabled>Confirm Code</button>
    <div class="verify__heading-text u-text-link js-resend">Send a new code</div>
  `,
  templateContext() {
    return {
      phoneEnd: this.getOption('patientPhoneEnd'),
      hasInvalidCodeError: this.getOption('hasInvalidCodeError'),
    };
  },
  watchInput(event) {
    const inputElements = this.ui.input;
    const index = inputElements.index(event.target);

    const value = String(event.target.value);
    const first = value.charAt(0);
    const rest = value.substring(1);

    event.target.value = first ?? '';

    const isLastInputEl = index === inputElements.length - 1;
    const didInsertContent = first !== undefined && value.length;

    const code = inputElements.map((i, el) => el.value).get().join('');

    this.disableSubmitButton(code.length !== inputElements.length);

    if (didInsertContent && !isLastInputEl) {
      const currentElement = inputElements.eq(index + 1);

      currentElement.focus();
      currentElement.val(rest);
      currentElement.trigger('input');
    }
  },
  watchKeydown(event) {
    const inputElements = this.ui.input;
    const index = inputElements.index(event.target);

    if (event.keyCode === BACKSPACE_KEY && event.target.value === '') {
      inputElements.eq(Math.max(0, index - 1)).focus();
    }
  },
  disableSubmitButton(shouldBeDisabled) {
    this.ui.submit.prop('disabled', shouldBeDisabled);
  },
  onClickSubmit() {
    const inputElements = this.ui.input;
    const code = inputElements.map((i, el) => el.value).get().join('');

    this.triggerMethod('submit:code', code);

    this.disableSubmitButton(true);
  },
});

const AlreadySubmittedView = View.extend({
  template: hbs`
    <div class="verify__icon verify__icon--success">{{fat "thumbs-up"}}</div>
    <div>This form has already been submitted.</div>
  `,
});

const NotAvailableView = View.extend({
  template: hbs`
    <div class="verify__icon verify__icon--error">{{fat "octagon-exclamation"}}</div>
    <div>This form is no longer shared. Nothing else to do here.</div>
  `,
});

export {
  RequestCodeView,
  VerifyCodeView,
  AlreadySubmittedView,
  NotAvailableView,
};
