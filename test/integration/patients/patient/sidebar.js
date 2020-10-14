import _ from 'underscore';
import 'js/utils/formatting';
import dayjs from 'dayjs';

import formatDate from 'helpers/format-date';
import { testDate, testDateSubtract } from 'helpers/test-date';
import { getIncluded, getResource } from 'helpers/json-api';

context('patient sidebar', function() {
  specify('display patient data', function() {
    const dob = testDateSubtract(10, 'years');

    cy
      .server()
      .routePatientActions(fx => {
        fx.included = [];
        return fx;
      })
      .routeSettings(fx => {
        fx.data[1].attributes = {
          value: [
            'dob',
            'sex',
            'status',
            'divider',
            'engagement',
            'divider',
            'group',
            'divider',
            'optionsWidget1',
            'optionsWidget2',
            'optionsWidget3',
            'optionsWidget4',
            'optionsWidget5',
            'templateWidget',
            'nestedTemplateWidget',
          ],
        };

        return fx;
      })
      .routeWidgets(fx => {
        const addWidget = _.partial(getResource, _, 'widgets');
        const display_options = {
          '1': 'Test Field',
          'foo': 'Foo',
          'bar': 'Bar is this one',
        };

        fx.data = fx.data.concat([
          addWidget({
            id: 'optionsWidget1',
            widget_type: 'optionsWidget',
            definition: {
              display_name: 'Populated Option Widget',
              field_name: 'test-field',
              display_options,
            },
          }),
          addWidget({
            id: 'optionsWidget2',
            widget_type: 'optionsWidget',
            definition: {
              display_name: 'Empty Option Widget',
              field_name: 'empty-field',
              display_options,
            },
          }),
          addWidget({
            id: 'optionsWidget3',
            widget_type: 'optionsWidget',
            definition: {
              display_name: 'Nested Option Widget',
              field_name: 'nested-field',
              key: 'foo',
              display_options,
            },
          }),
          addWidget({
            id: 'optionsWidget4',
            widget_type: 'optionsWidget',
            definition: {
              display_name: 'Empty Nested Option Widget',
              field_name: 'nested-field',
              key: 'bar',
              display_options,
            },
          }),
          addWidget({
            id: 'optionsWidget5',
            widget_type: 'optionsWidget',
            definition: {
              display_name: 'Empty Nested Option Widget',
              field_name: 'non-existent-field',
              key: 'bar',
              display_options,
            },
          }),
          addWidget({
            id: 'templateWidget',
            widget_type: 'templateWidget',
            definition: {
              display_name: 'Template Widget',
              template: `
                <p>
                  Test Patient Name: {{ patient.first_name }}
                </p>
                <p>
                  Test Field: <span class="widgets-value">{{ fields.test_field }}</span>
                </p>
                <p>
                  Nested Field: <span class="widgets-value">{{ fields.nested_field.foo }}</span>
                </p>
                <p>
                  Nested Widget: <span class="widgets-value">optionsWidget1 {{ widget.optionsWidget1 }} nested</span>
                </p>
              `,
            },
          }),
        ]);

        return fx;
      })
      .routePatient(fx => {
        fx.data.id = '1';
        fx.data.attributes = {
          first_name: 'First',
          last_name: 'Last',
          birth_date: dob,
          sex: 'f',
          status: 'active',
        };

        fx.data.relationships['patient-fields'].data = [
          { id: '1' },
          { id: '2' },
          { id: '3' },
        ];

        return fx;
      })
      .routePatientEngagementStatus('active')
      .routePatientFlows(fx => {
        fx.included = [];
        return fx;
      })
      .routePatientFields(fx => {
        const addField = _.partial(getResource, _, 'patient-fields');

        fx.data = [
          addField({
            id: '1',
            name: 'test-field',
            value: '1',
          }),
          addField({
            id: '2',
            name: 'empty-field',
            value: null,
          }),
          addField({
            id: '3',
            name: 'nested-field',
            value: {
              foo: 'bar',
            },
          }),
        ];

        return fx;
      })
      .routePrograms()
      .routeAllProgramActions()
      .routeAllProgramFlows()
      .visit('/patient/dashboard/1')
      .wait('@routePatient')
      .wait('@routePatientEngagementStatus')
      .wait('@routeWidgets');

    cy
      .get('.patient-sidebar')
      .as('patientSidebar')
      .should('contain', 'First Last')
      .should('contain', formatDate(dob, 'LONG'))
      .should('contain', `Age ${ dayjs(testDate()).diff(dob, 'years') }`);

    cy
      .get('@patientSidebar')
      .contains('Sex')
      .next()
      .contains('Female');

    cy
      .get('@patientSidebar')
      .contains('Status')
      .next()
      .find('.patient-sidebar__status-active')
      .contains('Active');

    cy
      .get('@patientSidebar')
      .contains('Populated Option Widget')
      .next()
      .contains('Test Field');

    cy
      .get('@patientSidebar')
      .contains('Empty Option Widget')
      .next()
      .find('.widgets-value')
      .should('be.empty');

    cy
      .get('@patientSidebar')
      .contains('Nested Option Widget')
      .next()
      .contains('Bar is this one');

    cy
      .get('@patientSidebar')
      .contains('Empty Nested Option Widget')
      .next()
      .find('.widgets-value')
      .should('be.empty');

    cy
      .get('@patientSidebar')
      .contains('Template Widget')
      .next()
      .should('contain', 'Test Patient Name: First')
      .should('contain', 'Test Field: 1')
      .should('contain', 'Nested Field: bar')
      .should('contain', 'Nested Widget: optionsWidget1 Test Field nested');

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
      .route({
        status: 504,
        method: 'GET',
        url: 'api/patients/1/engagement-status',
        response: {},
      })
      .as('routeEngagementStatus')
      .visit('/patient/dashboard/1')
      .wait('@routePatient')
      .wait('@routeWidgets');

    cy
      .get('.patient__sidebar')
      .find('.patient-sidebar__heading')
      .contains('Engagement Status')
      .next()
      .should('contain', 'Loading...')
      .wait('@routeEngagementStatus');

    cy
      .get('.patient__sidebar')
      .find('.patient-sidebar__no-engagement')
      .should('contain', 'Not Available')
      .click();
  });
});
