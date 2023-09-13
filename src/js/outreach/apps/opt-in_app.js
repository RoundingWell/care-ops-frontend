import Backbone from 'backbone';
import App from 'js/base/app';

import { optInPostRequest } from 'js/outreach/entities';

import {
  OptInView,
  ResponseSuccessView,
  ResponseErrorView,
} from 'js/outreach/views/opt-in_views';

import { DialogView } from 'js/outreach/views/dialog_views';

const StateModel = Backbone.Model.extend({
  defaults: {
    first_name: '',
    last_name: '',
    birth_date: '',
    phone: '',
  },
  validate({ first_name, last_name, birth_date, phone }) {
    if (!first_name || !last_name || !birth_date || !phone) return 'invalid';
  },
});

export default App.extend({
  StateModel,
  onStart() {
    const dialogView = new DialogView();
    this.showView(dialogView);

    this.showOptInView();
  },
  showOptInView() {
    const optInView = new OptInView({ model: this.getState() });

    this.listenTo(optInView, 'click:submit', () => {
      optInPostRequest(this.getState().attributes)
        .then(() => {
          this.showResponseSuccessView();
        })
        .catch(() => {
          this.showResponseErrorView();
        });
    });

    this.showChildView('content', optInView);
  },
  showResponseSuccessView() {
    const responseSuccessView = new ResponseSuccessView();
    this.showChildView('content', responseSuccessView);
  },
  showResponseErrorView() {
    const responseErrorView = new ResponseErrorView();

    this.listenTo(responseErrorView, 'click:tryAgain', () => {
      this.showOptInView();
    });

    this.showChildView('content', responseErrorView);
  },
});
