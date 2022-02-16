import { get } from 'underscore';
import { datadogRum } from '@datadog/browser-rum';
import { datadogLogs } from '@datadog/browser-logs';

import { datadogConfig as config, versions, appConfig as app } from './config';

function initLogs({ isForm }) {
  datadogLogs.init({
    env: app.env,
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
    env: app.env,
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
