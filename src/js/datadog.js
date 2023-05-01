import { get, extend } from 'underscore';
import { datadogRum } from '@datadog/browser-rum';
import { datadogLogs } from '@datadog/browser-logs';

import { datadogConfig as config, versions, appConfig as app } from './config';

let rumInitialized = false;

function getEnv() {
  return `${ app.env }.${ app.stack_id }`;
}

function isPdfPrinter() {
  const urlPaths = location.pathname.substring(1).split('/');
  return (urlPaths[0] === 'formapp' && urlPaths[1] === 'pdf');
}

function initLogs({ isForm }) {
  datadogLogs.init({
    env: getEnv(),
    clientToken: config.client_token,
    site: 'datadoghq.com',
    service: isForm ? 'care-ops-forms' : 'care-ops-frontend',
    forwardErrorsToLogs: true,
    version: versions.frontend,
    useSecureSessionCookie: true,
    useCrossSiteSessionCookie: true,
    beforeSend(log) {
      // Remove logging of offline fetch errors
      if (String(log.message).includes('Failed to fetch')) return false;
      return (get(log, ['http', 'status_code']) !== 0);
    },
  });
}

function initRum({ isForm }) {
  if (isPdfPrinter()) return;
  datadogRum.init({
    env: getEnv(),
    applicationId: config.app_id,
    clientToken: config.client_token,
    site: 'datadoghq.com',
    service: isForm ? 'care-ops-forms' : 'care-ops-frontend',
    version: versions.frontend,
    useSecureSessionCookie: true,
    useCrossSiteSessionCookie: true,
    allowedTracingOrigins: [window.origin],
    trackLongTasks: true,
    trackFrustrations: true,
    trackUserInteractions: true,
    defaultPrivacyLevel: 'allow',
    enableExperimentalFeatures: ['clickmap'],
    beforeSend(event, context) {
      // Add header/response context to api errors
      if (event.type === 'resource' && event.resource.type === 'fetch') {
        if (context.response.status >= 400) {
          extend(event.context, { context });
        }
      }
    },
  });
  rumInitialized = true;
}

function setUser(attrs) {
  if (!rumInitialized) return;
  datadogRum.setUser(attrs);
  datadogRum.startSessionReplayRecording();
}

function addError(error) {
  if (!rumInitialized) {
    // eslint-disable-next-line no-console
    console.error(error);
    return;
  }
  datadogRum.addError(error);
}

function initDataDog({ isForm }) {
  // NOTE: Remove when developing and testing Datadog
  if (_DEVELOP_) return;
  initLogs({ isForm });
  initRum({ isForm });
}

export {
  initDataDog,
  setUser,
  addError,
};
