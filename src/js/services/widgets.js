import { get, map, invoke, compact } from 'underscore';
import Radio from 'backbone.radio';

import App from 'js/base/app';

export default App.extend({
  channelName: 'widgets',
  radioRequests: {
    'sidebarWidgets': 'getSidebarWidgets',
    'build': 'buildWidgets',
    'find': 'findWidget',
  },
  initialize({ widgets }) {
    this.widgets = widgets;
  },
  findWidget(slug) {
    return this.widgets.find({ slug });
  },
  getSidebarWidgets() {
    const setting = Radio.request('settings', 'get', 'widgets_patient_sidebar');

    return this.buildWidgets(get(setting, 'widgets'));
  },
  buildWidgets(widgetSlugs) {
    const widgets = map(widgetSlugs, this.findWidget, this);

    // NOTE: omit IDs so that widgets can be duplicated in a single list
    const deIDdWidgets = invoke(compact(widgets), 'omit', 'id');

    return Radio.request('entities', 'widgets:collection', deIDdWidgets);
  },
});
