import { get } from 'underscore';
import { datadogRum } from '@datadog/browser-rum';
import { datadogLogs } from '@datadog/browser-logs';

import { datadogConfig as config, versions } from './config';

function initLogs({ isForm }) {
  datadogLogs.init({
    env: _DEVELOP_ ? 'develop' : 'prod',
    clientToken: config.client_token,
    site: 'datadoghq.com',
    service: isForm ? 'care-ops-forms' : 'care-ops-frontend',
    forwardErrorsToLogs: true,
    version: versions.frontend,
    useSecureSessionCookie: true,
    useCrossSiteSessionCookie: true,
    beforeSend: log => {
      return (get(log, ['http', 'status_code']) !== 0);
    },
  });
}

function initRum({ isForm }) {
  datadogRum.init({
    env: _DEVELOP_ ? 'develop' : 'prod',
    applicationId: config.app_id,
    clientToken: config.client_token,
    site: 'datadoghq.com',
    service: isForm ? 'care-ops-forms' : 'care-ops-frontend',
    trackInteractions: true,
    version: versions.frontend,
    useSecureSessionCookie: true,
    useCrossSiteSessionCookie: true,
    allowedTracingOrigins: [window.origin],
  });
}

function initDataDog({ isForm }) {
  initLogs({ isForm });
  initRum({ isForm });
}

export {
  initDataDog,
};
