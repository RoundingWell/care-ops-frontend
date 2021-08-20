import { datadogRum } from '@datadog/browser-rum';
import { datadogLogs } from '@datadog/browser-logs';

import { datadogConfig as config, versions } from './config';

function initLogs() {
  datadogLogs.init({
    clientToken: config.client_token,
    site: 'datadoghq.com',
    service: 'care-ops-frontend',
    forwardErrorsToLogs: true,
    version: versions.frontend,
    useSecureSessionCookie: true,
    useCrossSiteSessionCookie: true,
  });
}

function initRum() {
  datadogRum.init({
    applicationId: config.app_id,
    clientToken: config.client_token,
    site: 'datadoghq.com',
    service: 'care-ops-frontend',
    trackInteractions: true,
    version: versions.frontend,
    useSecureSessionCookie: true,
    useCrossSiteSessionCookie: true,
  });
}

function initDataDog() {
  initLogs();
  initRum();
}

export {
  initDataDog,
};
