import _ from 'underscore';

import RouterApp from 'js/base/routerapp';

import { ErrorTemplate } from 'js/views/globals/error/error_views';

export default RouterApp.extend({
  initialize() {
    this.router.route('*unknown', '404', _.bind(this.start, this));
  },

  onStop() {
    this.getRegion().empty();
  },

  onStart() {
    this.showView({
      className: 'error-page',
      template: ErrorTemplate,
    });
  },
});

