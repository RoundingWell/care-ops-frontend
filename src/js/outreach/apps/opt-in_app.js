import Radio from 'backbone.radio';
import App from 'js/base/app';

import {
  OptInView,
  ResponseSuccessView,
  ResponseErrorView,
} from 'js/outreach/views/opt-in_views';

import { DialogView } from 'js/outreach/views/dialog_views';

export default App.extend({
  beforeStart() {
    return Radio.request('entities', 'outreach:model', {
      first_name: '',
      last_name: '',
      birth_date: '',
      phone: '',
    });
  },
  onStart(options, outreach) {
    this.outreach = outreach;

    const dialogView = new DialogView();
    this.showView(dialogView);

    this.showOptInView();
  },
  showOptInView() {
    const optInView = new OptInView({ model: this.outreach });

    this.listenTo(optInView, 'click:submit', ({ model }) => {
      this.outreach.registerPatient(model.attributes)
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
