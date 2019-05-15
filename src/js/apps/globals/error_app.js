import _ from 'underscore';

import RouterApp from 'js/base/routerapp';

import { ErrorView } from 'js/views/globals/error/error_views';

export default RouterApp.extend({
  initialize() {
    this.router.route('*unknown', '404', _.bind(this.start, this));
  },

  viewEvents: {
    'click:back': 'stop',
  },

  onBeforeStop() {
    this.getRegion().empty();
  },

  onStart() {
    this.showView(new ErrorView());
  },
});

