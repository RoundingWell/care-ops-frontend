import _ from 'underscore';
import Radio from 'backbone.radio';
import { Behavior } from 'marionette';

import 'sass/modules/fill-window.scss';

const userActivityCh = Radio.channel('user-activity');
const topRegionCh = Radio.channel('top-region');

export default Behavior.extend({
  regionName: 'region',
  className: 'fill-window',
  initialize(options) {
    this.mergeOptions(options, ['regionName', 'className']);
  },
  onInitialize() {
    this.region = this.view.getRegion(this.regionName);
    this.listenTo(this.region, {
      'empty': _.bind(this.view.triggerMethod, this.view, 'region:empty'),
      'show': _.bind(this.view.triggerMethod, this.view, 'region:show'),
    });
  },
  onRegionShow() {
    this.listenTo(userActivityCh, 'body:down', this.onUserActivity);
    this.$el.addClass(this.className);
  },
  onRegionEmpty() {
    this.stopListening(userActivityCh);
    this.$el.removeClass(this.className);
  },
  onUserActivity({ target }) {
    if (!this.region.hasView() || topRegionCh.request('contains', this.view, target)) return;

    this.region.empty();
  },
});
