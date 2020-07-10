import _ from 'underscore';
import 'js/utils/formatting';
import moment from 'moment';
import formatDate from 'helpers/format-date';
import { getIncluded } from 'helpers/json-api';

context('patient sidebar', function() {
  specify('display patient data', function() {
    const dob = moment().subtract(10, 'years');

    cy
      .server()
      .routePatientActions()
      .routePatient(fx => {
        fx.data.id = '1';
        fx.data.attributes = {
          first_name: 'First',
          last_name: 'Last',
          birth_date: dob.format('YYYY-MM-DD'),
          sex: 'f',
        };

        return fx;
      })
      .routePatientEngagementStatus('active')
      .routePatientFlows()
      .routePrograms()
      .routeAllProgramActions()
      .routeAllProgramFlows()
      .visit('/patient/dashboard/1')
      .wait('@routePatient')
      .wait('@routePatientEngagementStatus');

    cy
      .get('.patient-sidebar')
      .as('patientSidebar')
      .should('contain', 'First Last')
      .should('contain', formatDate(dob, 'LONG'))
      .should('contain', `Age ${ moment().diff(dob, 'years') }`);

    cy
      .get('@patientSidebar')
      .contains('Sex')
      .next()
      .contains('Female');

    cy
      .routePatientEngagementSettings(fx => {
        fx.data = {
          engagement: {
            status: 'active',
            on: 1,
            deliveryPref: 'email_text',
          },
          responder: {
            email: 'test.patient@roundingwell.com',
            sms: '+1 555-555-5555',
          },
          plan: {
            name: 'Test Program',
          },
        };

        return fx;
      });

    cy
      .get('@patientSidebar')
      .find('.engagement-status__icon.active')
      .parent()
      .should('contain', 'Active')
      .click()
      .wait('@routePatientEngagementSettings');

    cy
      .get('.sidebar')
      .find('.engagement-sidebar__title')
      .should('contain', 'Engagement');

    cy
      .get('.sidebar')
      .find('.engagement-sidebar__heading')
      .should('contain', 'Engagement Status')
      .next()
      .should('contain', 'Active')
      .next()
      .should('contain', 'Responder Email')
      .next()
      .should('contain', 'test.patient@roundingwell.com')
      .next()
      .should('contain', 'Responder SMS')
      .next()
      .should('contain', '+1 555-555-5555')
      .next()
      .should('contain', 'SMS text notification for check-ins')
      .next()
      .should('contain', 'Enabled')
      .next()
      .should('contain', 'Engagement Program')
      .next()
      .should('contain', 'Test Program');

    cy
      .get('.sidebar')
      .find('.js-close')
      .click();

    cy
      .get('@patientSidebar');

    cy
      .route({
        url: '/api/patients/1/engagement-settings',
        status: 404,
        response: {},
      })
      .as('routeFailedPatientEngagement');

    cy
      .get('@patientSidebar')
      .find('.engagement-status__icon.active')
      .click()
      .wait('@routeFailedPatientEngagement');

    cy
      .get('.alert-box')
      .contains('Engagement settings for this patient could not be found.');
  });

  specify('patient fields', function() {
    cy
      .server()
      .routePatientActions()
      .routePatient(fx => {
        fx.data.relationships['patient-fields'].data = _.collectionOf(['1', '2', '3'], 'id');

        fx.included = getIncluded(fx.included, [
          {
            id: '1',
            name: 'String',
            value: 'value',
          },
          {
            id: '2',
            name: 'Number',
            value: 12345,
          },
          {
            id: '3',
            name: 'Empty',
            value: null,
          },
        ], 'patient-fields');

        return fx;
      })
      .routePatientEngagementStatus()
      .routePatientFlows()
      .routePrograms()
      .routeAllProgramActions()
      .routeAllProgramFlows()
      .visit('/patient/dashboard/1')
      .wait('@routePatient');

    cy
      .get('.patient-sidebar')
      .contains('String')
      .next()
      .contains('value');

    cy
      .get('.patient-sidebar')
      .contains('Number')
      .next()
      .contains('12345');

    cy
      .get('.patient-sidebar')
      .contains('Empty')
      .next()
      .should('be.empty');
  });

  specify('patient groups', function() {
    cy
      .server()
      .routePatientActions()
      .routePatient(fx => {
        fx.data.relationships.groups.data = _.collectionOf(['1', '2'], 'id');

        fx.included = getIncluded(fx.included, [
          {
            id: '1',
            name: 'Group One',
          },
          {
            id: '2',
            name: 'Another Group',
          },
        ], 'groups');

        return fx;
      })
      .routePatientEngagementStatus()
      .routePatientFlows()
      .routePrograms()
      .routeAllProgramActions()
      .routeAllProgramFlows()
      .visit('/patient/dashboard/1')
      .wait('@routePatient');

    cy
      .get('.patient-sidebar')
      .contains('Groups')
      .next()
      .contains('Group One')
      .next()
      .should('contain', 'Another Group');

    cy
      .getRadio(Radio => {
        const patient = Radio.request('entities', 'patients:model', '1');
        patient.set({ _groups: [{ id: '1' }] });
      });

    cy
      .get('.patient-sidebar')
      .contains('Groups')
      .next()
      .contains('Group One');

    cy
      .get('.patient-sidebar')
      .should('not.contain', 'Another Group');
  });

  specify('engagement status not available', function() {
    cy
      .server()
      .routePatientActions()
      .routePatient(fx => {
        fx.data.id = '1';
        return fx;
      })
      .routePatientFlows()
      .routePrograms()
      .routeAllProgramActions()
      .routeAllProgramFlows()
      .visit('/patient/dashboard/1')
      .wait('@routePatient');

    cy
      .get('.patient__sidebar')
      .find('.patient-sidebar__heading')
      .contains('Engagement Status')
      .next()
      .should('contain', 'Loading...');

    cy
      .get('.patient__sidebar')
      .find('.patient-sidebar__no-engagement')
      .should('contain', 'Not Available');
  });

  specify('organization engagement disabled', function() {
    cy
      .server()
      .routeSettings(fx => {
        fx.data = [
          {
            id: 'engagement',
            attributes: {
              value: false,
            },
            type: 'settings',
          },
        ];

        return fx;
      })
      .routePatientActions()
      .routePatient(fx => {
        fx.data.id = '1';
        return fx;
      })
      .routePatientFlows()
      .routePrograms()
      .routeAllProgramActions()
      .routeAllProgramFlows()
      .visit('/patient/dashboard/1')
      .wait('@routePatient');

    cy
      .get('.patient__sidebar')
      .find('[data-engagement-region]')
      .should('not.exist');
  });
});
