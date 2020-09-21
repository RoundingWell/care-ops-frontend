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
require('cypress-plugin-tab');
import './defaults';
import './commands';
import './coverage';

import './api/actions';
import './api/check-ins';
import './api/clinicians';
import './api/comments';
import './api/events';
import './api/flows';
import './api/forms';
import './api/groups';
import './api/patient-events';
import './api/patient-fields';
import './api/patients';
import './api/program-actions';
import './api/program-flows';
import './api/programs';
import './api/reports';
import './api/roles';
import './api/settings';
import './api/states';
