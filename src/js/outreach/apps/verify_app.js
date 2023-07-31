import { get } from 'underscore';

import App from 'js/base/app';

import { getPatientInfo, createVerificationCode, validateVerificationCode } from 'js/outreach/entities';

import {
  RequestCodeView,
  VerifyCodeView,
  AlreadySubmittedView,
  NotAvailableView,
} from 'js/outreach/views/verify_views';

import {
  DialogView,
  ErrorView,
} from 'js/outreach/views/dialog_views';

export default App.extend({
  beforeStart({ actionId }) {
    return getPatientInfo({ actionId });
  },
  onFail(options, response) {
    const dialogView = new DialogView();
    this.showView(dialogView);

    if (response.status === 409) {
      this.showAlreadySubmittedView();
      return;
    }

    this.showNotAvailableView();
  },
  onStart(options, patient) {
    this.patientPhoneEnd = get(patient.attributes, 'phone_end');
    this.patientId = get(patient.relationships, ['patient', 'data', 'id']);

    const dialogView = new DialogView();
    this.showView(dialogView);

    this.showRequestCodeView();
  },
  showRequestCodeView() {
    const requestCodeView = new RequestCodeView({
      model: this.getState(),
      patientPhoneEnd: this.patientPhoneEnd,
    });

    this.listenTo(requestCodeView, 'click:submit', () => {
      createVerificationCode({ patientId: this.patientId })
        .then(() => {
          this.showVerifyCodeView();
        })
        .catch(() => {
          this.showDialogErrorView();
        });
    });

    this.showChildView('content', requestCodeView);
  },
  showVerifyCodeView(hasInvalidCodeError) {
    const verifyCodeView = new VerifyCodeView({
      patientPhoneEnd: this.patientPhoneEnd,
      hasInvalidCodeError,
    });

    this.listenTo(verifyCodeView, 'submit:code', code => {
      validateVerificationCode({ patientId: this.patientId, code })
        .then(() => {
          this.stop({ isVerified: true });
        })
        .catch(response => {
          if (response.status === 403) {
            this.showVerifyCodeView(true);
            return;
          }

          this.showDialogErrorView();
        });
    });

    this.listenTo(verifyCodeView, 'click:resend', code => {
      this.showRequestCodeView();
    });

    this.showChildView('content', verifyCodeView);
  },
  showAlreadySubmittedView() {
    this.showChildView('content', new AlreadySubmittedView());
  },
  showNotAvailableView() {
    this.showChildView('content', new NotAvailableView());
  },
  showDialogErrorView() {
    this.showChildView('content', new ErrorView());
  },
});
