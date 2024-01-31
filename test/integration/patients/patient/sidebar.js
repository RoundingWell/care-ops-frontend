import _ from 'underscore';
import dayjs from 'dayjs';

import formatDate from 'helpers/format-date';
import { testDate, testDateSubtract } from 'helpers/test-date';
import { testTs } from 'helpers/test-timestamp';
import { getResource } from 'helpers/json-api';

import { workspaceOne } from 'support/api/workspaces';

context('patient sidebar', function() {
  specify('display patient data', function() {
    const dob = testDateSubtract(10, 'years');

    const fields = {
      'test-field': {
        id: '1',
        name: 'test-field',
        value: '1',
      },
      'empty-field': {
        id: '2',
        name: 'empty-field',
        value: null,
      },
      'nested-field': {
        id: '3',
        name: 'nested-field',
        value: {
          foo: {
            bar: 'bar',
          },
        },
      },
      'html-field': {
        id: '4',
        name: 'html-field',
        value: '<b>escaped html</b>',
      },
      'phone': {
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
      },
      'date-default': {
        id: '6',
        name: 'date-default',
        value: testTs(),
      },
      'date-custom': {
        id: '7',
        name: 'date-custom',
        value: {
          testValue: testTs(),
        },
      },
      'date-noDate': {
        id: '8',
        name: 'date-noDate',
      },
      'simple-array': {
        id: '9',
        name: 'simple-array',
        value: ['1', 'two', 'foo'],
      },
      'empty-array': {
        id: '10',
        name: 'empty-array',
        value: [],
      },
      'nested-array': {
        id: '11',
        name: 'nested-array',
        value: [
          { foo: { bar: '2' }, date: '1990-01-01' },
          { foo: { bar: 'three' } },
          { foo: { bar: 'baz' } },
        ],
      },
    };

    cy
      .routesForPatientDashboard()
      .routeFormDefinition()
      .routeLatestFormResponse()
      .routeFormFields()
      .routeForm(_.identity, '33333')
      .routeSettings(fx => {
        fx.data[0].attributes = {
          value: {
            widgets: [
              'dob',
              'sex',
              'status',
              'divider',
              'workspaces',
              'groups', // deprecated version of 'workspaces'
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
              'formModalWidget',
              'formModalWidgetSmall',
              'formModalWidgetLarge',
              'dateTimeWidget-default',
              'dateTimeWidget-custom',
              'dateTimeWidget-noDate',
              'arrayWidget-simple',
              'arrayWidget-empty',
              'arrayWidget-child',
              'arrayWidget-child-custom',
              'arrayWidget-child-custom-deep',
              'arrayWidget-filter',
              'arrayWidget-reject',
              'patientMRNIdentifier',
              'patientSSNIdentifier',
            ],
            fields: _.keys(fields),
          },
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
              key: 'test-field',
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
            },
          }),
          addWidget({
            id: 'phoneWidget3',
            widget_type: 'phoneWidget',
            definition: {
              display_name: 'No Phone Number',
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
              form_id: '11111',
              form_name: 'Test Form',
            },
          }),
          addWidget({
            id: 'formModalWidget',
            widget_type: 'formWidget',
            definition: {
              display_name: 'Modal Form',
              form_id: '33333',
              form_name: 'Test Modal Form',
              is_modal: true,
            },
          }),
          addWidget({
            id: 'formModalWidgetSmall',
            widget_type: 'formWidget',
            definition: {
              display_name: 'Modal Form',
              form_id: '11111',
              form_name: 'Test Modal Form Small',
              is_modal: true,
              modal_size: 'small',
            },
          }),
          addWidget({
            id: 'formModalWidgetLarge',
            widget_type: 'formWidget',
            definition: {
              display_name: 'Modal Form',
              form_id: '11111',
              form_name: 'Test Modal Form Large',
              is_modal: true,
              modal_size: 'large',
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
          addWidget({
            id: 'arrayWidget-simple',
            widget_type: 'arrayWidget',
            definition: {
              display_name: 'Simple Array',
              field_name: 'simple-array',
            },
          }),
          addWidget({
            id: 'arrayWidget-empty',
            widget_type: 'arrayWidget',
            definition: {
              display_name: 'Empty Array',
              default_html: 'Array is Empty',
              field_name: 'empty-array',
            },
          }),
          addWidget({
            id: 'arrayWidget-child',
            widget_type: 'arrayWidget',
            definition: {
              display_name: 'Child Widget',
              field_name: 'simple-array',
              child_widget: 'sex',
            },
          }),
          addWidget({
            id: 'arrayWidget-child-custom',
            widget_type: 'arrayWidget',
            definition: {
              display_name: 'Custom Child Widget',
              field_name: 'simple-array',
              child_widget: {
                widget_type: 'templateWidget',
                definition: {
                  template: '{{ patient.first_name }} - <b>{{ value }}</b>',
                },
              },
            },
          }),
          addWidget({
            id: 'arrayWidget-child-custom-deep',
            widget_type: 'arrayWidget',
            definition: {
              display_name: 'Deep Custom Child Widget',
              field_name: 'nested-array',
              child_widget: {
                widget_type: 'templateWidget',
                definition: {
                  template: '<b>{{ value.foo.bar }}  {{ widget.arrayWidget-child-custom-sub-template }}</b>',
                },
              },
            },
          }),
          addWidget({
            id: 'arrayWidget-child-custom-sub-template',
            widget_type: 'dateTimeWidget',
            definition: {
              default_html: 'No Date Available',
              inputFormat: 'YYYY-MM-DD',
              format: 'lll',
              key: 'date',
            },
          }),
          addWidget({
            id: 'arrayWidget-filter',
            widget_type: 'arrayWidget',
            definition: {
              display_name: 'Filter Array',
              field_name: 'nested-array',
              filter_value: 'date',
              child_widget: {
                widget_type: 'templateWidget',
                definition: {
                  template: '<b>{{ value.foo.bar }}  {{ widget.arrayWidget-child-custom-sub-template }}</b>',
                },
              },
            },
          }),
          addWidget({
            id: 'arrayWidget-reject',
            widget_type: 'arrayWidget',
            definition: {
              display_name: 'Reject Array',
              field_name: 'nested-array',
              reject_value: 'date',
              child_widget: {
                widget_type: 'templateWidget',
                definition: {
                  template: '<b>{{ value.foo.bar }}</b>',
                },
              },
            },
          }),
          addWidget({
            id: 'patientMRNIdentifier',
            widget_type: 'patientIdentifiers',
            definition: {
              display_name: 'Patient Identifier',
              identifier_type: 'mrn',
            },
          }),
          addWidget({
            id: 'patientSSNIdentifier',
            widget_type: 'patientIdentifiers',
            definition: {
              default_html: 'No Identifier Found',
              display_name: 'Patient Identifier With Empty Value',
              identifier_type: 'ssn',
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
          identifiers: [
            {
              type: 'mrn',
              value: 'A5432112345',
            },
          ],
        };

        fx.data.relationships['patient-fields'].data = _.map(_.values(fields), field => {
          return { id: field.id, type: 'patient-fields' };
        });

        return fx;
      });

    _.each(_.keys(fields), fieldName => {
      cy.routePatientField(fx => {
        fx.data = getResource(fields[fieldName], 'patient-fields');
        return fx;
      }, fieldName);
    });

    cy
      .routeWorkspacePatient(fx => {
        fx.data.attributes.status = 'active';
        return fx;
      });

    cy
      .visit('/patient/dashboard/1')
      .wait('@routePatient')
      .wait('@routePrograms')
      .wait('@routeWidgets');

    _.each(_.keys(fields), fieldName => {
      cy.wait(`@routePatientField${ fieldName }`);
    });

    cy
      .wait('@routeForm')
      .itsUrl()
      .its('pathname')
      .should('contain', '33333');

    cy
      .get('.patient-sidebar')
      .as('patientSidebar')
      .should('contain', 'First Last')
      .find('.patient-sidebar__section')
      .first()
      .should('contain', formatDate(dob, 'LONG'))
      .should('contain', `Age ${ dayjs(testDate()).diff(dob, 'years') }`)
      .next()
      .should('contain', 'Sex')
      .should('contain', 'Female')
      .next()
      .should('contain', 'Status')
      .find('.widgets__status-active')
      .should('contain', 'Active')
      .parents('.patient-sidebar__section')
      .next()
      .find('.widgets__divider')
      .parents('.patient-sidebar__section')
      .next()
      .should('contain', 'Workspaces')
      .next()
      .should('contain', 'Groups')
      .next()
      .find('.widgets__divider')
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
      .find('.widgets__form-widget')
      .should('contain', 'Test Form')
      .parents('.patient-sidebar__section')
      .next()
      .should('contain', 'Modal Form')
      .find('.widgets__form-widget')
      .should('contain', 'Test Modal Form')
      .parents('.patient-sidebar__section')
      .next()
      .find('.widgets__form-widget')
      .should('contain', 'Test Modal Form Small')
      .parents('.patient-sidebar__section')
      .next()
      .find('.widgets__form-widget')
      .should('contain', 'Test Modal Form Large')
      .parents('.patient-sidebar__section')
      .next()
      .should('contain', 'Date Field with default formatting')
      .should('contain', formatDate(testTs(), 'TIME_OR_DAY'))
      .next()
      .should('contain', 'Date Field with custom formatting')
      .should('contain', formatDate(testTs(), 'lll'))
      .next()
      .should('contain', 'Date Field with no date')
      .should('contain', 'No Date Available')
      .next()
      .should('contain', 'Simple Array')
      .should('contain', '1')
      .should('contain', 'two')
      .should('contain', 'foo')
      .next()
      .should('contain', 'Empty Array')
      .should('contain', 'Array is Empty')
      .next()
      .should('contain', 'Child Widget')
      .should('contain', 'Female')
      .next()
      .should('contain', 'Custom Child Widget')
      .should('contain', 'First - foo')
      .next()
      .should('contain', 'Deep Custom Child Widget')
      .should('contain', '2')
      .should('contain', 'Jan 1')
      .should('contain', 'three')
      .should('contain', 'No Date')
      .should('contain', 'baz')
      .next()
      .should('contain', 'Filter Array')
      .should('contain', '2')
      .should('contain', 'Jan 1')
      .should('not.contain', 'three')
      .next()
      .should('contain', 'Reject Array')
      .should('not.contain', '2')
      .should('contain', 'three')
      .should('contain', 'baz')
      .next()
      .should('contain', 'Patient Identifier')
      .should('contain', 'A5432112345')
      .next()
      .should('contain', 'Patient Identifier With Empty Value')
      .should('contain', 'No Identifier Found');

    // verifies that the ::before content ('-') is shown for empty widget values
    cy
      .get('@patientSidebar')
      .find('.patient-sidebar__section')
      .contains('Empty Nested Option Widget')
      .next()
      .find('.widgets-value')
      .hasBeforeContent('–');

    cy
      .get('@patientSidebar')
      .find('.widgets__form-widget')
      .contains('Test Modal Form')
      .click();

    cy
      .get('.modal')
      .find('.js-submit')
      .should('be.disabled');

    cy
      .wait('@routeFormDefinition');

    cy
      .intercept('POST', '/api/form-responses', {
        statusCode: 403,
        delay: 300,
        body: {
          errors: [
            {
              id: '1',
              status: 403,
              title: 'Forbidden',
              detail: 'Insufficient permissions',
            },
          ],
        },
      })
      .as('postFormResponse');

    cy
      .iframe()
      .as('iframe');

    cy
      .get('@iframe')
      .find('textarea[name="data[familyHistory]"]')
      .clear()
      .type('New typing');

    cy
      .get('@iframe')
      .find('textarea[name="data[storyTime]"]')
      .should('contain', 'foo')
      .clear()
      .type('New typing');

    cy
      .get('.modal')
      .find('.js-submit')
      .should('not.be.disabled')
      .click();

    cy
      .get('.modal')
      .find('.js-submit')
      .should('be.disabled')
      .wait('@postFormResponse');

    cy
      .intercept('POST', '/api/form-responses', {
        statusCode: 201,
        body: { data: { id: '12345' } },
      })
      .as('postFormResponse');

    cy
      .get('.modal')
      .find('.js-submit')
      .should('not.be.disabled')
      .click()
      .wait('@postFormResponse');

    cy
      .get('.modal')
      .should('not.exist');

    cy
      .get('@patientSidebar')
      .find('.widgets__form-widget')
      .contains('Test Modal Form Small')
      .click();

    cy
      .get('.modal')
      .find('.js-close')
      .first()
      .click();

    cy
      .get('@patientSidebar')
      .find('.widgets__form-widget')
      .contains('Test Modal Form Large')
      .click();

    cy
      .get('.modal')
      .find('.js-close')
      .last()
      .click();

    cy
      .get('@patientSidebar')
      .find('.widgets__form-widget')
      .contains('Test Form')
      .click();

    cy
      .url()
      .should('contain', 'patient/1/form/11111');
  });

  specify('patient workspaces', function() {
    cy
      .routesForPatientDashboard()
      .visit('/patient/dashboard/1')
      .wait('@routePrograms')
      .wait('@routePatientField');

    cy
      .get('.patient-sidebar')
      .contains('Workspaces')
      .next()
      .contains('Workspace One')
      .next()
      .should('contain', 'Workspace Two');

    cy
      .getRadio(Radio => {
        const patient = Radio.request('entities', 'patients:model', '1');
        patient.set({ _workspaces: [{ id: workspaceOne.id }] });
      });

    cy
      .get('.patient-sidebar')
      .contains('Workspaces')
      .next()
      .contains('Workspace One');

    cy
      .get('.patient-sidebar')
      .should('not.contain', 'Workspace Two');
  });

  specify('workspace specific widgets setting', function() {
    cy
      .routesForPatientDashboard()
      .routeWorkspaces(fx => {
        fx.data[0].attributes.settings = {
          widgets_patient_sidebar: {
            widgets: [
              'divider',
            ],
          },
        };

        return fx;
      });

    cy
      .visit('/patient/dashboard/1')
      .wait('@routePatient');

    cy
      .get('.patient-sidebar')
      .as('patientSidebar')
      .find('.patient-sidebar__section')
      .should('have.length', 1)
      .first()
      .find('.widgets__divider');
  });

  specify('edit patient modal', function() {
    cy
      .routesForPatientDashboard()
      .routeSettings(fx => {
        // NOTE: Ensures this submit text doesn't show for the submit button in this situation
        fx.data.push({
          id: 'patient_creation_form',
          attributes: {
            value: {
              form_id: '11111',
              submit_text: 'Continue to Form 11111',
            },
          },
        });

        return fx;
      })
      .routePatient(fx => {
        fx.data.id = '1';
        fx.data.attributes.source = 'manual';
        fx.data.attributes.first_name = 'Test';
        fx.data.attributes.last_name = 'Patient';
        fx.data.attributes.sex = 'f';
        fx.data.attributes.birth_date = '2000-01-01';

        return fx;
      })
      .visit('/patient/dashboard/1')
      .wait('@routePrograms')
      .wait('@routePatient');

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

    cy
      .get('@patientModal')
      .find('.js-input')
      .first()
      .clear()
      .type('New Test');

    cy
      .intercept('PATCH', '/api/patients/1', {
        statusCode: 200,
        body: {
          data: {
            type: 'patients',
            id: '1',
          },
        },
      })
      .as('routePatchPatient');

    cy
      .get('@patientModal')
      .find('.js-submit')
      .contains('Save')
      .click()
      .wait('@routePatchPatient');
  });

  specify('view patient modal', function() {
    cy
      .routesForPatientDashboard()
      .routeSettings(fx => {
        // NOTE: Ensures this submit text doesn't show for the submit button in this situation
        fx.data.push({
          id: 'patient_creation_form',
          attributes: {
            value: {
              form_id: '11111',
              submit_text: 'Continue to Form 11111',
            },
          },
        });

        return fx;
      })
      .routePatient(fx => {
        fx.data.id = '1';
        fx.data.attributes.first_name = 'Test';
        fx.data.attributes.last_name = 'Patient';
        fx.data.attributes.sex = 'f';
        fx.data.attributes.birth_date = '2000-01-01';

        return fx;
      })
      .routeCurrentClinician(fx => {
        // NOTE: ensures patient status menu options don't show for users without the 'patients:manage' permission
        // NOTE: in this test, the only menu option should be 'View Account Details'
        fx.data.relationships.role.data.id = '33333';
        return fx;
      })
      .visit('/patient/dashboard/1')
      .wait('@routePrograms')
      .wait('@routePatient');

    cy
      .get('.patient__sidebar')
      .find('.js-menu')
      .click();

    cy
      .get('.picklist')
      .should('contain', 'Patient Menu')
      .find('.picklist__item')
      .should('have.length', 1);

    cy
      .get('.picklist')
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
      .find('[data-workspaces-region]')
      .find('.is-disabled')
      .should('contain', 'Workspace One')
      .should('contain', 'Workspace Two')
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

  specify('update patient status', function() {
    cy
      .routesForPatientDashboard()
      .routePatient(fx => {
        fx.data.id = '1';

        return fx;
      })
      .routeWorkspacePatient(fx => {
        fx.data.attributes.status = 'active';
        return fx;
      })
      .routeCurrentClinician(fx => {
        fx.data.relationships.role.data.id = '22222';
        return fx;
      })
      .visit('/patient/dashboard/1')
      .wait('@routePatient');

    cy
      .get('.patient__sidebar')
      .find('.js-menu')
      .click();

    cy
      .get('.picklist')
      .find('.picklist__item')
      .should('have.length', 3);

    cy
      .intercept('PUT', '/api/workspace-patients/*', {
        statusCode: 200,
        body: {
          data: {
            status: 'inactive',
          },
        },
      })
      .as('routePutWorkspacePatient');

    cy
      .get('.picklist')
      .contains('Inactivate Patient')
      .click()
      .wait('@routePutWorkspacePatient');

    cy
      .get('.patient-sidebar')
      .find('.patient-sidebar__section')
      .contains('Status')
      .next()
      .as('sidebarStatusWidgetValue')
      .should('contain', 'Inactive');

    cy
      .get('.patient__sidebar')
      .find('.js-menu')
      .click();

    cy
      .intercept('PUT', '/api/workspace-patients/*', {
        statusCode: 200,
        body: {
          data: {
            status: 'active',
          },
        },
      })
      .as('routePutWorkspacePatient');

    cy
      .get('.picklist')
      .contains('Activate Patient')
      .click()
      .wait('@routePutWorkspacePatient');

    cy
      .get('@sidebarStatusWidgetValue')
      .should('contain', 'Active');

    cy
      .get('.patient__sidebar')
      .find('.js-menu')
      .click();

    cy
      .intercept('PUT', '/api/workspace-patients/*', {
        statusCode: 200,
        body: {
          data: {
            status: 'archive',
          },
        },
      })
      .as('routePutWorkspacePatient');

    cy
      .get('.picklist')
      .contains('Archive Patient')
      .click();

    cy
      .get('.modal--small')
      .find('.js-submit')
      .click()
      .wait('@routePutWorkspacePatient');

    cy
      .get('@sidebarStatusWidgetValue')
      .should('contain', 'Archived');

    cy
      .get('.patient__sidebar')
      .find('.js-menu')
      .click();

    cy
      .get('.picklist')
      .contains('Archive Patient')
      .should('not.exist');

    cy
      .intercept('PUT', '/api/workspace-patients/*', {
        statusCode: 200,
        body: {
          data: {
            status: 'active',
          },
        },
      })
      .as('routePutWorkspacePatient');

    cy
      .get('.picklist')
      .contains('Activate Patient')
      .click()
      .wait('@routePutWorkspacePatient');

    cy
      .get('@sidebarStatusWidgetValue')
      .should('contain', 'Active');

    cy
      .get('.patient__sidebar')
      .find('.js-menu')
      .click();

    cy
      .get('.picklist')
      .should('contain', 'Inactivate Patient')
      .should('contain', 'Archive Patient');
  });
});
