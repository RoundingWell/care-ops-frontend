import App from 'js/base/app';

import { createVerificationCode, validateVerificationCode } from 'js/outreach/entities';

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
  onStart({ actionId }) {
    this.actionId = actionId;

    const dialogView = new DialogView();
    this.showView(dialogView);

    this.showRequestCodeView();
  },
  showRequestCodeView() {
    const requestCodeView = new RequestCodeView({ model: this.getState() });

    this.listenTo(requestCodeView, 'click:submit', () => {
      createVerificationCode({ actionId: this.actionId })
        .then(() => {
          this.showVerifyCodeView();
        })
        .catch(() => {
          this.showDialogErrorView();
        });
    });

    this.showChildView('content', requestCodeView);
  },
  showVerifyCodeView() {
    const verifyCodeView = new VerifyCodeView();

    this.listenTo(verifyCodeView, 'submit:code', code => {
      validateVerificationCode({ actionId: this.actionId, code })
        .then(() => {
          this.stop({ isVerified: true });
        })
        .catch(response => {
          const status = response.status;

          if (status === 409) {
            this.showAlreadySubmittedView();
            return;
          }

          if (status === 401 || status === 403 || status === 404) {
            this.showNotAvailableView();
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
