import { get } from 'underscore';
import Radio from 'backbone.radio';

import App from 'js/base/app';

export default App.extend({
  channelName: 'settings',
  radioRequests: {
    'get': 'getSetting',
  },
  initialize({ settings }) {
    this.settings = settings;
  },
  getSetting(settingName) {
    const currentWorkspace = Radio.request('workspace', 'current');
    const workspaceSettings = currentWorkspace.get('settings');
    const workspaceSetting = get(workspaceSettings, settingName);

    if (workspaceSetting) return workspaceSetting;

    const setting = this.settings.get(settingName);

    if (!setting) return;

    return setting.get('value');
  },
});
