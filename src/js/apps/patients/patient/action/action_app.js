import { first } from 'underscore';
import Radio from 'backbone.radio';
import dayjs from 'dayjs';

import intl from 'js/i18n';

import { ACTION_OUTREACH, ACTION_SHARING, STATE_STATUS } from 'js/static';

import App from 'js/base/app';

export default App.extend({
  beforeStart({ actionId, patientId }) {
    if (!actionId) {
      const currentUser = Radio.request('bootstrap', 'currentUser');
      const currentWorkspace = Radio.request('bootstrap', 'currentWorkspace');
      const states = currentWorkspace.getStates();

      const defaultInitialState = first(states.filter({ status: STATE_STATUS.QUEUED }));

      return Radio.request('entities', 'actions:model', {
        _patient: patientId,
        _state: defaultInitialState.id,
        _owner: {
          type: 'clinicians',
          id: currentUser.id,
        },
        outreach: ACTION_OUTREACH.DISABLED,
        sharing: ACTION_SHARING.DISABLED,
        duration: 0,
        due_date: null,
        due_time: null,
        updated_at: dayjs().format(),
      });
    }

    return Radio.request('entities', 'fetch:actions:model', actionId);
  },
  onFail() {
    Radio.request('alert', 'show:error', intl.patients.patient.actionApp.notFound);
    this.stop();
  },
  onStart(options, action) {
    const sidebar = Radio.request('sidebar', 'start', 'action', { action });

    this.listenTo(sidebar, 'stop', this.stop);
  },
});
