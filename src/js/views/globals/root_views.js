import { View } from 'marionette';

export const RootView = View.extend({
  el: 'body',
  regions: {
    appErrorRegion: '#app-error-region',
    appFrameRegion: '#app-frame-region',
  },
});
