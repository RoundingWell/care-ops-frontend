import Radio from 'backbone.radio';

import App from 'js/base/app';

import {
  RequestCodeView,
  VerifyCodeView,
  AlreadySubmittedView,
  NotAvailableView,
} from 'js/outreach/views/verify_views';

import { DialogView } from 'js/outreach/views/dialog_views';
import { ErrorView } from 'js/outreach/views/error_views';

export default App.extend({
  beforeStart({ actionId }) {
    this.actionId = actionId;

    return Radio.request('entities', 'fetch:outreach:byAction', actionId);
  },
  onFail(options, response) {
    if (response.status >= 500) return;

    const dialogView = new DialogView();
    this.showView(dialogView);

    if (response.status === 409) {
      this.showAlreadySubmittedView();
      return;
    }

    this.showNotAvailableView();
  },
  onStart(options, outreach) {
    this.outreach = outreach;

    const dialogView = new DialogView();
    this.showView(dialogView);

    this.showRequestCodeView();
  },
  showRequestCodeView() {
    const requestCodeView = new RequestCodeView({
      model: this.getState(),
      patientPhoneEnd: this.outreach.get('phone_end'),
    });

    this.listenTo(requestCodeView, 'click:submit', () => {
      this.outreach.requestOtpCreation(this.actionId)
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
      patientPhoneEnd: this.outreach.get('phone_end'),
      hasInvalidCodeError,
    });

    this.listenTo(verifyCodeView, 'submit:code', code => {
      this.outreach.requestOtpAuth(code)
        .then(({ data: { attributes } }) => {
          Radio.request('auth', 'setToken', attributes.token);
          this.stop();
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
