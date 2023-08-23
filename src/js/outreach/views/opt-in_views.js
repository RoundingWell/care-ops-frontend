import hbs from 'handlebars-inline-precompile';
import { View } from 'marionette';
import parsePhoneNumber from 'libphonenumber-js/min';

import 'scss/modules/buttons.scss';
import 'scss/modules/forms.scss';

import './opt-in.scss';

const OptInView = View.extend({
  template: hbs`
    <div class="opt-in__icon opt-in__icon--warn">{{fat "hand-wave"}}</div>
    <h2 class="opt-in__heading-text">Hi, we need to confirm your contact info. Please enter your information below, so that we can share health resources with you.</h2>
    <div class="opt-in__field">
      <label class="opt-in__field-label">Your first name</label>
      <input
        type="text"
        class="input-primary opt-in__field-input js-first-name"
        placeholder="Enter your first name"
        value="{{ first_name }}"
      />
    </div>
    <div class="opt-in__field">
      <label class="opt-in__field-label">Your last name</label>
      <input
        type="text"
        class="input-primary opt-in__field-input js-last-name"
        placeholder="Enter your last name"
        value="{{ last_name }}"
      />
    </div>
    <div class="opt-in__field">
      <label class="opt-in__field-label">Your date of birth</label>
      <input
        type="date"
        class="input-primary opt-in__field-input js-birth-date"
        placeholder="Enter your date of birth"
        value="{{ birth_date }}"
      />
    </div>
    <h3 class="opt-in__heading-text u-margin--t-32 u-margin--b-16">How may we share health resources with you?</h3>
    <div class="opt-in__field">
      <label class="opt-in__field-label">Your mobile phone number</label>
      <input
        type="text"
        class="input-primary opt-in__field-input js-phone"
        placeholder="Enter mobile phone number"
        value="{{ phone }}"
      />
    </div>
    <p class="opt-in__disclaimer">By clicking Submit you agree to receive SMS text message notifications. You may opt out at any time.</p>
    <button class="opt-in__submit button--green w-100 js-submit" disabled>Submit</button>
  `,
  ui: {
    firstName: '.js-first-name',
    lastName: '.js-last-name',
    birthDate: '.js-birth-date',
    phone: '.js-phone',
    submit: '.js-submit',
  },
  triggers: {
    'input @ui.firstName': 'change:first:name',
    'input @ui.lastName': 'change:last:name',
    'input @ui.birthDate': 'change:birth:date',
    'input @ui.phone': 'change:phone',
    'click @ui.submit': 'click:submit',
  },
  onRender() {
    this.setSubmitButtonState();
  },
  onChangeFirstName() {
    this.model.set({ first_name: this.ui.firstName.val() });
    this.setSubmitButtonState();
  },
  onChangeLastName() {
    this.model.set({ last_name: this.ui.lastName.val() });
    this.setSubmitButtonState();
  },
  onChangeBirthDate() {
    this.model.set({ birth_date: this.ui.birthDate.val() });
    this.setSubmitButtonState();
  },
  onChangePhone() {
    const phone = parsePhoneNumber(this.ui.phone.val(), 'US');

    this.model.set({
      phone: phone ? phone.number : null,
    });

    this.setSubmitButtonState();
  },
  disableSubmitButton() {
    this.ui.submit.prop('disabled', true);
  },
  enableSubmitButton() {
    this.ui.submit.prop('disabled', false);
  },
  setSubmitButtonState() {
    const firstName = this.ui.firstName.val();
    const lastName = this.ui.lastName.val();
    const birthDate = this.ui.birthDate.val();
    const phone = this.ui.phone.val();

    if (!firstName || !lastName || !birthDate || !phone) {
      this.disableSubmitButton();
      return;
    }

    this.enableSubmitButton();
  },
  onClickSubmit() {
    this.disableSubmitButton();
  },
});

const ResponseSuccessView = View.extend({
  template: hbs`
    <div class="opt-in__icon opt-in__icon--success">{{fat "thumbs-up"}}</div>
    <div class="opt-in__heading-text">Your contact info is confirmed. Thanks for doing that. We’ll notify you when we have a health resource to share with you.</div>
  `,
});

const ResponseErrorView = View.extend({
  template: hbs`
    <div class="opt-in__icon opt-in__icon--error">{{fat "octagon-exclamation"}}</div>
    <div class="opt-in__heading-text">We were not able to confirm your contact info. Sorry about that. Please contact your care team.</div>
    <div class="opt-in__heading-text u-text-link js-try-again">Try again</div>
  `,
  triggers: {
    'click .js-try-again': 'click:tryAgain',
  },
});

export {
  OptInView,
  ResponseSuccessView,
  ResponseErrorView,
};
