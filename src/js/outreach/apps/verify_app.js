import App from 'js/base/app';

import { getPatientInfo, createVerificationCode, validateVerificationCode } from 'js/outreach/entities';

import {
  RequestCodeView,
  VerifyCodeView,
  AlreadySubmittedView,
  NotAvailableView,
  GeneralErrorView,
} from 'js/outreach/views/verify_views';

import { DialogView } from 'js/outreach/views/dialog_views';

export default App.extend({
  onBeforeStart({ actionId }) {
    this.actionId = actionId;
  },
  beforeStart() {
    return getPatientInfo({ actionId: this.actionId });
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
  onStart(options, { outreachId, patientPhoneEnd }) {
    this.outreachId = outreachId;
    this.patientPhoneEnd = patientPhoneEnd;

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
      createVerificationCode({ actionId: this.actionId })
        .then(() => {
          this.showVerifyCodeView();
        })
        .catch(response => {
          if (response.status >= 500) return;

          this.showGeneralErrorView();
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
      validateVerificationCode({ outreachId: this.outreachId, code })
        .then(() => {
          this.stop({ isVerified: true });
        })
        .catch(response => {
          if (response.status >= 500) return;

          this.showVerifyCodeView(true);
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
  showGeneralErrorView() {
    this.showChildView('content', new GeneralErrorView());
  },
});
