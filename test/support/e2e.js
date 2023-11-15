// ***********************************************************
// This example support/index.js is processed and
// loaded automatically before your other test files.
//
// This is a great place to put global configuration and
// behavior that modifies Cypress.
//
// You can change the location of this file or turn off
// automatically serving support files with the
// 'supportFile' configuration option.
//
// You can read more here:
// https://on.cypress.io/guides/configuration#section-global
// ***********************************************************
import 'cypress-plugin-tab';
import 'js/base/dayjs';

import './defaults';
import './commands';
import './coverage';

import './api/actions';
import './api/clinicians';
import './api/comments';
import './api/dashboards';
import './api/directories';
import './api/events';
import './api/files';
import './api/flows';
import './api/forms';
import './api/form-definition';
import './api/form-fields';
import './api/form-responses';
import './api/outreach';
import './api/patient-fields';
import './api/patients';
import './api/program-actions';
import './api/program-flows';
import './api/programs';
import './api/roles';
import './api/settings';
import './api/states';
import './api/tags';
import './api/teams';
import './api/widgets';
import './api/workspaces';
