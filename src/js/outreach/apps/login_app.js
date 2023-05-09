import App from 'js/base/app';

import { getToken } from 'js/outreach/entities';

import {
  LoginView,
  ResponseErrorView,
  NotAvailableView,
} from 'js/outreach/views/login_views';

import {
  DialogView,
  ErrorView,
} from 'js/outreach/views/dialog_views';

export default App.extend({
  onStart({ actionId }) {
    const dialogView = new DialogView();

    this.showLogin(actionId, dialogView.getRegion('content'));

    this.showView(dialogView);
  },
  showLogin(actionId, region) {
    const loginView = new LoginView({ model: this.getState() });

    this.listenTo(loginView, 'click:submit', () => {
      getToken({ actionId, dob: this.getState('dob') })
        .then(() => {
          this.stop({ isAuthed: true });
        })
        .catch(response => {
          switch (response.status) {
            case 400:
              this.setState({ hasError: true });
              break;
            case 409:
              region.show(new ResponseErrorView());
              break;
            case 404:
            case 403:
            case 401:
              region.show(new NotAvailableView());
              break;
            default:
              region.show(new ErrorView());
              break;
          }
        });
    });

    region.show(loginView);
  },
});
