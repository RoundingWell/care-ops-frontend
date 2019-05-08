import App from 'js/base/app';

export default App.extend({
  channelName: 'pop',
  radioRequests: {
    'get:region': 'getRegion',
    'empty': 'emptyRegion',
  },
  emptyRegion() {
    this.getRegion().empty();
  },
});
