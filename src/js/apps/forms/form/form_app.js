import App from 'js/base/app';
import Backbone from 'backbone';

import { LayoutView } from 'js/views/forms/form/form_views';

export default App.extend({
  onBeforeStart() {
    this.getRegion().startPreloader();
  },
  onStart(options, form) {
    const tempForm = new Backbone.Model({ id: '678sfd', name: 'Foo' });
    this.showView(new LayoutView({ model: tempForm }));
  },
});
