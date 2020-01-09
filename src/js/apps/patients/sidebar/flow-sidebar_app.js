import App from 'js/base/app';

export default App.extend({
  onBeforeStart({ flow }) {
    this.flow = flow;

    this.showView('flowSidebar');
  },
});
