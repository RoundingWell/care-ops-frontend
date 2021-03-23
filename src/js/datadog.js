import { datadogRum } from '@datadog/browser-rum';
import { datadogLogs } from '@datadog/browser-logs';

import { datadogConfig as config, versions } from './config';

function initLogs(service) {
  datadogLogs.init({
    service,
    clientToken: config.client_token,
    site: 'datadoghq.com',
    forwardErrorsToLogs: true,
    version: versions.frontend,
    useSecureSessionCookie: true,
    useCrossSiteSessionCookie: true,
    silentMultipleInit: true,
  });
}

function initRum(service) {
  datadogRum.init({
    service,
    applicationId: config.app_id,
    clientToken: config.client_token,
    site: 'datadoghq.com',
    trackInteractions: true,
    version: versions.frontend,
    useSecureSessionCookie: true,
    useCrossSiteSessionCookie: true,
    silentMultipleInit: true,
  });
}

function initDataDog(service) {
  initLogs(service);
  initRum(service);
}

export {
  initDataDog,
};
