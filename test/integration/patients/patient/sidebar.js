import _ from 'underscore';
import dayjs from 'dayjs';

import collectionOf from 'js/utils/formatting/collection-of';
import formatDate from 'helpers/format-date';
import { testDate, testDateSubtract } from 'helpers/test-date';
import { testTs } from 'helpers/test-timestamp';
import { getIncluded, getResource } from 'helpers/json-api';

context('patient sidebar', function() {
  specify('display patient data', function() {
    const dob = testDateSubtract(10, 'years');

    cy
      .server()
      .routePatientActions(_.identity, '2')
      .routeSettings(fx => {
        fx.data[1].attributes = {
          value: [
            'dob',
            'sex',
            'status',
            'divider',
            'engagement',
            'divider',
            'groups',
            'divider',
            'optionsWidget1',
            'optionsWidget2',
            'optionsWidget3',
            'optionsWidget4',
            'optionsWidget5',
            'optionsWidget6',
            'templateWidget',
            'emptyTemplateWidget',
            'phoneWidget1',
            'phoneWidget2',
            'phoneWidget3',
            'phoneWidget4',
            'fieldWidget',
            'formWidget',
            'dateTimeWidget-default',
            'dateTimeWidget-custom',
            'dateTimeWidget-noDate',
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
              display_name: 'Default HTML Option Widget',
              default_html: '<strong>Default HTML Here</strong>',
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
              key: 'foo.bar',
              display_options,
            },
          }),
          addWidget({
            id: 'optionsWidget4',
            widget_type: 'optionsWidget',
            definition: {
              display_name: 'Empty Nested Option Widget',
              field_name: 'nested-field',
              key: 'baz',
              display_options,
            },
          }),
          addWidget({
            id: 'optionsWidget5',
            widget_type: 'optionsWidget',
            definition: {
              display_name: 'Nonexistent Field Widget',
              field_name: 'non-existent-field',
              key: 'bar',
              display_options,
            },
          }),
          addWidget({
            id: 'optionsWidget6',
            widget_type: 'optionsWidget',
            definition: {
              display_name: 'Unsupported Option Widget',
              field_name: 'test-field',
              display_options: {
                99999: 'Not test field',
              },
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
                  Test Field: <span class="widgets-value">{{ fields.test-field }}</span>
                </p>
                <p>
                  Nested Field: <span class="widgets-value">{{ fields.nested-field.foo.bar }}</span>
                </p>
                <p>
                  Nested Widget: <span class="widgets-value">optionsWidget1 {{ widget.optionsWidget1 }} nested</span>
                </p>
                <p>
                  Non existent value: <span class="widgets-value qa-empty">{{ fields.non-existent-field }}</span>
                </p>
                <p>
                  Escaped html: <span class="widgets-value">{{ fields.html-field }}</span>
                </p>
              `,
            },
          }),
          addWidget({
            id: 'emptyTemplateWidget',
            widget_type: 'templateWidget',
            definition: {
              display_name: 'Empty Template Widget',
              template: '{{ fields.non_existent_field }}',
            },
          }),
          addWidget({
            id: 'phoneWidget1',
            widget_type: 'phoneWidget',
            definition: {
              display_name: 'Phone Number',
              field_name: 'phone',
              key: 'phone.number.is.here',
            },
          }),
          addWidget({
            id: 'phoneWidget2',
            widget_type: 'phoneWidget',
            definition: {
              display_name: 'Phone Number - Default HTML',
              default_html: 'No Phone Available',
              field_name: 'mobile',
              key: 'mobile',
            },
          }),
          addWidget({
            id: 'phoneWidget3',
            widget_type: 'phoneWidget',
            definition: {
              display_name: 'No Phone Number',
              field_name: 'mobile',
              key: 'mobile',
            },
          }),
          addWidget({
            id: 'phoneWidget4',
            widget_type: 'phoneWidget',
            definition: {
              display_name: 'Bad Phone Number',
              field_name: 'phone',
              key: 'bad',
            },
          }),
          addWidget({
            id: 'fieldWidget',
            widget_type: 'fieldWidget',
            definition: {
              display_name: 'Field Widget - Phone Field',
              field_name: 'phone',
              key: 'mobile',
            },
          }),
          addWidget({
            id: 'formWidget',
            widget_type: 'formWidget',
            definition: {
              display_name: 'Form',
              form_id: '1',
              form_name: 'Test Form',
            },
          }),
          addWidget({
            id: 'dateTimeWidget-default',
            widget_type: 'dateTimeWidget',
            definition: {
              display_name: 'Date Field with default formatting',
              default_html: 'No Date Available',
              field_name: 'date-default',
            },
          }),
          addWidget({
            id: 'dateTimeWidget-custom',
            widget_type: 'dateTimeWidget',
            definition: {
              display_name: 'Date Field with custom formatting',
              default_html: 'No Date Available',
              field_name: 'date-custom',
              inputFormat: 'YYYY-MM-DD',
              format: 'lll',
              key: 'testValue',
            },
          }),
          addWidget({
            id: 'dateTimeWidget-noDate',
            widget_type: 'dateTimeWidget',
            definition: {
              display_name: 'Date Field with no date',
              default_html: 'No Date Available',
              field_name: 'date-noDate',
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
          { id: '4' },
          { id: '5' },
          { id: '6' },
          { id: '7' },
          { id: '8' },
        ];

        return fx;
      })
      .routePatientEngagementStatus('active')
      .routePatientFlows(_.identity, '2')
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
              foo: {
                bar: 'bar',
              },
            },
          }),
          addField({
            id: '4',
            name: 'html-field',
            value: '<b>escaped html</b>',
          }),
          addField({
            id: '5',
            name: 'phone',
            value: {
              bad: 'UNKNOWN',
              mobile: '6155555551',
              phone: {
                number: {
                  is: {
                    here: '6155555555',
                  },
                },
              },
            },
          }),
          addField({
            id: '6',
            name: 'date-default',
            value: testTs(),
          }),
          addField({
            id: '7',
            name: 'date-custom',
            value: {
              testValue: testTs(),
            },
          }),
          addField({
            id: '8',
            name: 'date-noDate',
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
      .wait('@routeWidgets')
      .wait('@routePatientFlows')
      .wait('@routePatientActions');

    cy
      .get('.patient-sidebar')
      .as('patientSidebar')
      .should('contain', 'First Last');

    cy
      .get('@patientSidebar')
      .find('.patient-sidebar__section')
      .first()
      .should('contain', formatDate(dob, 'LONG'))
      .should('contain', `Age ${ dayjs(testDate()).diff(dob, 'years') }`)
      .next()
      .should('contain', 'Sex')
      .should('contain', 'Female')
      .next()
      .should('contain', 'Status')
      .find('.patient-sidebar__status-active')
      .should('contain', 'Active')
      .parents('.patient-sidebar__section')
      .next()
      .find('.patient-sidebar__divider')
      .parents('.patient-sidebar__section')
      .next()
      .should('contain', 'Engagement Status')
      .should('contain', 'Active')
      .next()
      .find('.patient-sidebar__divider')
      .parents('.patient-sidebar__section')
      .next()
      .should('contain', 'Groups')
      .next()
      .find('.patient-sidebar__divider')
      .parents('.patient-sidebar__section')
      .next()
      .should('contain', 'Populated Option Widget')
      .should('contain', 'Test Field')
      .next()
      .should('contain', 'Default HTML Option Widget')
      .should('contain', 'Default HTML Here')
      .next()
      .should('contain', 'Nested Option Widget')
      .should('contain', 'Bar is this one')
      .next()
      .should('contain', 'Empty Nested Option Widget')
      .find('.widgets-value')
      .should('be.empty')
      .parents('.patient-sidebar__section')
      .next()
      .should('contain', 'Nonexistent Field Widget')
      .find('.widgets-value')
      .should('be.empty')
      .parents('.patient-sidebar__section')
      .next()
      .should('contain', 'Unsupported Option Widget')
      .find('.widgets-value')
      .should('contain', '1')
      .parents('.patient-sidebar__section')
      .next()
      .should('contain', 'Template Widget')
      .should('contain', 'Test Patient Name: First')
      .should('contain', 'Test Field: 1')
      .should('contain', 'Nested Field: bar')
      .should('contain', 'Nested Widget: optionsWidget1 Test Field nested')
      .should('contain', 'Escaped html: <b>escaped html</b>')
      .find('.qa-empty')
      .should('be.empty')
      .parents('.patient-sidebar__section')
      .next()
      .should('contain', 'Empty Template Widget')
      .find('.widgets-value')
      .should('be.empty')
      .parents('.patient-sidebar__section')
      .next()
      .should('contain', 'Phone Number')
      .find('.widgets-value')
      .should('contain', '(615) 555-5555')
      .parents('.patient-sidebar__section')
      .next()
      .should('contain', 'Phone Number - Default HTML')
      .should('contain', 'No Phone Available')
      .next()
      .should('contain', 'No Phone Number')
      .find('.widgets-value')
      .should('be.empty')
      .parents('.patient-sidebar__section')
      .next()
      .should('contain', 'Bad Phone Number')
      .find('.widgets-value')
      .should('be.empty')
      .parents('.patient-sidebar__section')
      .next()
      .should('contain', 'Field Widget - Phone Field')
      .should('contain', '6155555551')
      .next()
      .should('contain', 'Form')
      .find('.patient-sidebar__form-widget')
      .should('contain', 'Test Form')
      .parents('.patient-sidebar__section')
      .next()
      .should('contain', 'Date Field with default formatting')
      .should('contain', formatDate(testTs(), 'TIME_OR_DAY'))
      .next()
      .should('contain', 'Date Field with custom formatting')
      .should('contain', formatDate(testTs(), 'lll'))
      .next()
      .should('contain', 'Date Field with no date')
      .should('contain', 'No Date Available');

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

    cy
      .get('@patientSidebar')
      .find('.patient-sidebar__form-widget')
      .click();

    cy
      .url()
      .should('contain', 'patient/1/form/1');
  });

  specify('patient groups', function() {
    cy
      .server()
      .routePatientActions(_.identity, '2')
      .routePatient(fx => {
        fx.data.relationships.groups.data = collectionOf(['1', '2'], 'id');

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
      .routePatientFlows(_.identity, '2')
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
      .routePatientActions(_.identity, '2')
      .routePatient(fx => {
        fx.data.id = '1';
        return fx;
      })
      .routePatientFlows(_.identity, '2')
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

  specify('edit patient modal', function() {
    cy
      .server()
      .routePatient(fx => {
        fx.data.id = '1';
        fx.data.attributes.source = 'manual';
        fx.data.attributes.first_name = 'Test';
        fx.data.attributes.last_name = 'Patient';
        fx.data.attributes.sex = 'f';
        fx.data.attributes.birth_date = '2000-01-01';
        fx.data.relationships.groups.data = collectionOf(['1', '2'], 'id');

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
      .routePatientFlows(_.identity, '2')
      .routePatientActions(_.identity, '2')
      .routePrograms()
      .routeAllProgramActions()
      .routeAllProgramFlows()
      .visit('/patient/dashboard/1')
      .wait('@routePatient')
      .wait('@routePatientEngagementStatus')
      .wait('@routePatientActions')
      .wait('@routePatientFlows');

    cy
      .get('.patient__sidebar')
      .find('.js-menu')
      .click();

    cy
      .get('.picklist')
      .should('contain', 'Patient Menu')
      .contains('Edit Account Details')
      .click();

    cy
      .get('.modal')
      .as('patientModal')
      .contains('Patient Account');
  });

  specify('view patient modal', function() {
    cy
      .server()
      .routePatient(fx => {
        fx.data.id = '1';
        fx.data.attributes.first_name = 'Test';
        fx.data.attributes.last_name = 'Patient';
        fx.data.attributes.sex = 'f';
        fx.data.attributes.birth_date = '2000-01-01';
        fx.data.relationships.groups.data = collectionOf(['1', '2'], 'id');

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
      .routePatientFlows(_.identity, '2')
      .routePatientActions(_.identity, '2')
      .routePrograms()
      .routeAllProgramActions()
      .routeAllProgramFlows()
      .visit('/patient/dashboard/1')
      .wait('@routePatient')
      .wait('@routePatientEngagementStatus')
      .wait('@routePatientActions')
      .wait('@routePatientFlows');

    cy
      .get('.patient__sidebar')
      .find('.js-menu')
      .click();

    cy
      .get('.picklist')
      .should('contain', 'Patient Menu')
      .contains('View Account Details')
      .click();

    cy
      .get('.modal')
      .as('patientModal')
      .should('contain', 'Patient account managed by data integration.')
      .find('.js-input')
      .first()
      .should('have.value', 'Test')
      .should('be.disabled');

    cy
      .get('@patientModal')
      .find('.js-input')
      .last()
      .should('have.value', 'Patient')
      .should('be.disabled');

    cy
      .get('@patientModal')
      .find('[data-dob-region] button')
      .should('contain', formatDate('2000-01-01', 'MMM DD, YYYY'))
      .should('be.disabled');

    cy
      .get('@patientModal')
      .find('[data-sex-region] button')
      .should('contain', 'Female')
      .should('be.disabled');

    cy
      .get('@patientModal')
      .find('[data-groups-region]')
      .find('.is-disabled')
      .should('contain', 'Group One')
      .should('contain', 'Another Group')
      .find('.js-remove')
      .should('not.exist');

    cy
      .get('@patientModal')
      .find('[data-droplist-region]')
      .should('be.empty');

    cy
      .get('@patientModal')
      .find('.js-submit')
      .contains('Done')
      .click();

    cy
      .get('@patientModal')
      .should('not.exist');
  });
});
