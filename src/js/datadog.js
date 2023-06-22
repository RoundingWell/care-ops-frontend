import { get, extend } from 'underscore';
import { datadogRum } from '@datadog/browser-rum';
import { datadogLogs } from '@datadog/browser-logs';

import { datadogConfig as config, versions, appConfig } from './config';

let ddInitialized = false;

function getEnv() {
  return `${ appConfig.env }.${ appConfig.stackId }`;
}

function isPdfPrinter() {
  const urlPaths = location.pathname.substring(1).split('/');
  return (urlPaths[0] === 'formapp' && urlPaths[1] === 'pdf');
}

function initLogs({ isForm }) {
  datadogLogs.init({
    env: getEnv(),
    clientToken: config.clientToken,
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
    applicationId: config.applicationId,
    clientToken: config.clientToken,
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
        if (context.response.status && context.response.status >= 400) {
          extend(event.context, { context });
        }
      }
    },
  });
}

function setUser(attrs) {
  if (!ddInitialized) return;
  datadogRum.setUser(attrs);
  datadogRum.startSessionReplayRecording();
}

function addError(error) {
  if (!ddInitialized) {
    // eslint-disable-next-line no-console
    console.error(error);
    return;
  }
  datadogRum.addError(error);
}

async function logResponse(url, options, response) {
  if (!ddInitialized) return;

  const contentType = String(response.headers.get('Content-Type'));
  const responseHeaders = Object.fromEntries(response.headers);
  const responseBody = contentType.includes('json') ? await response.json() : await response.text();

  datadogLogs.logger.info(`Response status ${ response.status }`, {
    url,
    options,
    status: response.status,
    responseHeaders,
    responseBody,
  });
}

function initDataDog({ isForm }) {
  // NOTE: Remove when developing and testing Datadog
  if (_DEVELOP_) return;
  initLogs({ isForm });
  initRum({ isForm });
  ddInitialized = true;
}

export {
  initDataDog,
  setUser,
  addError,
  logResponse,
};
