import _ from 'underscore';
import moment from 'moment';

function createActionPostRoute(id) {
  cy
    .route({
      status: 201,
      method: 'POST',
      url: '/api/patients/1/relationships/actions*',
      response() {
        return {
          data: {
            id,
            attributes: { updated_at: moment.utc().format() },
          },
        };
      },
    })
    .as('routePostAction');
}

context('patient dashboard page', function() {
  specify('action and flow list', function() {
    const actionData = {
      id: '1',
      attributes: {
        name: 'First In List',
        details: null,
        duration: 0,
        due_date: null,
        updated_at: moment.utc().format(),
      },
      relationships: {
        patient: { data: { id: '1' } },
        clinician: { data: null },
        role: { data: { id: '11111' } },
        state: { data: { id: '22222' } },
        forms: { data: [{ id: '1' }] },
      },
    };

    cy
      .server()
      .routePatient(fx => {
        fx.data.id = '1';

        return fx;
      })
      .routePatientActions(fx => {
        fx.data = _.sample(fx.data, 3);

        fx.data[0] = actionData;

        fx.data[2].attributes.name = 'Third In List';
        fx.data[2].relationships.state = { data: { id: '33333' } };
        fx.data[2].attributes.updated_at = moment.utc().subtract(2, 'days').format();

        fx.data[1].attributes.name = 'Not In List';
        fx.data[1].relationships.state = { data: { id: '55555' } };
        fx.data[1].attributes.updated_at = moment.utc().subtract(5, 'days').format();

        return fx;
      }, '1')
      .routePatientFlows(fx => {
        fx.data = _.sample(fx.data, 3);

        fx.data[0].attributes.name = 'Second In List';
        fx.data[0].relationships.state = { data: { id: '33333' } };
        fx.data[0].attributes.updated_at = moment.utc().subtract(1, 'days').format();

        fx.data[2].attributes.name = 'Last In List';
        fx.data[2].id = '2';
        fx.data[2].relationships.state = { data: { id: '33333' } };
        fx.data[2].relationships.role = { data: { id: '11111' } };
        fx.data[2].relationships.clinician = { data: null };
        fx.data[2].attributes.updated_at = moment.utc().subtract(5, 'days').format();

        fx.data[1].attributes.name = 'Not In List';
        fx.data[1].relationships.state = { data: { id: '55555' } };
        fx.data[1].attributes.updated_at = moment.utc().subtract(5, 'days').format();

        return fx;
      }, '1')
      .routeAction(fx => {
        fx.data = actionData;
        return fx;
      })
      .routeActionActivity()
      .visit('/patient/dashboard/1')
      .wait('@routePatient')
      .wait('@routePatientActions')
      .wait('@routePatientFlows');

    // Filters out done id 55555
    cy
      .get('.patient__list')
      .find('tr')
      .should('have.lengthOf', 4);

    cy
      .route({
        status: 204,
        method: 'PATCH',
        url: '/api/actions/1',
        response: {},
      })
      .as('routePatchAction');

    cy
      .route({
        status: 204,
        method: 'PATCH',
        url: '/api/flows/2',
        response: {},
      })
      .as('routePatchFlow');

    cy
      .get('.patient__list')
      .find('.table-list__item')
      .first()
      .should('contain', 'First In List')
      .next()
      .should('contain', 'Second In List')
      .next()
      .should('contain', 'Third In List')
      .next()
      .should('contain', 'Last In List');

    cy
      .get('.patient__list')
      .contains('First In List')
      .click();

    cy
      .get('.patient__list')
      .find('.is-selected')
      .find('[data-state-region]')
      .find('.action--queued')
      .click();

    cy
      .get('.picklist')
      .contains('In Progress')
      .click();

    cy
      .wait('@routePatchAction')
      .its('request.body')
      .should(({ data }) => {
        expect(data.relationships.state.data.id).to.equal('33333');
      });

    cy
      .get('.patient__list')
      .find('.is-selected')
      .find('[data-owner-region]')
      .should('contain', 'CO')
      .click();

    cy
      .get('.picklist')
      .contains('Nurse')
      .click();

    cy
      .wait('@routePatchAction')
      .its('request.body')
      .should(({ data }) => {
        expect(data.relationships.role.data.id).to.equal('22222');
      });

    cy
      .get('.patient__list')
      .find('.is-selected')
      .find('[data-due-region]')
      .click();

    cy
      .get('.datepicker')
      .contains('Today')
      .click();

    cy
      .wait('@routePatchAction')
      .its('request.body')
      .should(({ data }) => {
        // Datepicker doesn't use timestamp so due_date is local.
        expect(data.attributes.due_date).to.equal(moment().format('YYYY-MM-DD'));
      });

    cy
      .get('.patient__list')
      .find('.table-list__item')
      .last()
      .as('flowItem');

    cy
      .get('@flowItem')
      .find('.action--started');

    cy
      .get('@flowItem')
      .find('[data-owner-region]')
      .should('contain', 'CO')
      .click();

    cy
      .get('.picklist')
      .contains('Nurse')
      .click();

    cy
      .wait('@routePatchFlow')
      .its('request.body')
      .should(({ data }) => {
        expect(data.relationships.role.data.id).to.equal('22222');
      });

    cy
      .get('.patient__list')
      .find('.is-selected')
      .find('[data-state-region]')
      .click();

    cy
      .get('.picklist')
      .contains('Done')
      .click()
      .wait(800); // wait the length of the animation

    cy
      .wait('@routePatchAction')
      .its('request.body')
      .should(({ data }) => {
        expect(data.relationships.state.data.id).to.equal('55555');
      });

    cy
      .get('.patient__list')
      .find('tr')
      .should('have.lengthOf', 3);

    cy
      .get('.action-sidebar')
      .find('.action--done')
      .click();

    cy
      .get('.picklist')
      .contains('To Do')
      .click();

    cy
      .get('.patient__list')
      .find('tr')
      .should('have.lengthOf', 4);

    cy
      .get('.table-list__item')
      .first()
      .next()
      .next()
      .find('[data-attachment-region]')
      .should('be.empty');

    cy
      .get('.table-list__item')
      .first()
      .find('[data-attachment-region]')
      .click();

    cy
      .url()
      .should('contain', 'patient-action/1/form/1');
  });

  specify('add action and flow', function() {
    cy
      .server()
      .routePatient(fx => {
        fx.data.id = '1';

        return fx;
      })
      .routeAction()
      .routePatientActions(_.identity, '1')
      .routePatientFlows(_.identity, '1')
      .routeActionActivity()
      .routePrograms(fx => {
        fx.data = _.sample(fx.data, 4);
        fx.data[0].id = 1;
        fx.data[0].attributes.published = true;
        fx.data[0].attributes.name = 'Two Actions, One Published, One Flow';
        fx.data[0].relationships['program-actions'] = {
          data: [
            { id: '1' },
            { id: '4' },
          ],
        };
        fx.data[0].relationships['program-flows'] = { data: [{ id: '4' }] };

        fx.data[1].id = 2;
        fx.data[1].attributes.published = true;
        fx.data[1].attributes.name = 'Two Published Actions and Flows';
        fx.data[1].relationships['program-actions'] = {
          data: [
            { id: '2' },
            { id: '3' },
          ],
        };
        fx.data[1].relationships['program-flows'] = {
          data: [
            { id: '5' },
            { id: '6' },
            { id: '7' },
          ],
        };

        fx.data[2].id = 3;
        fx.data[2].attributes.published = true;
        fx.data[2].attributes.name = 'No Actions, No Flows';
        fx.data[2].relationships['program-actions'] = { data: [] };
        fx.data[2].relationships['program-flows'] = { data: [] };

        fx.data[3].id = 4;
        fx.data[3].attributes.published = false;
        fx.data[3].attributes.name = 'Unpublished';
        fx.data[3].relationships['program-actions'] = { data: [] };
        fx.data[2].relationships['program-flows'] = { data: [] };

        return fx;
      })
      .routeAllProgramActions(fx => {
        fx.data = _.sample(fx.data, 3);

        fx.data[0].id = 1;
        fx.data[0].attributes.status = 'published';
        fx.data[0].attributes.name = 'One of One';
        fx.data[0].attributes.details = 'details';
        fx.data[0].attributes.days_until_due = 1;
        fx.data[0].relationships.role = { data: { id: '11111' } };
        fx.data[0].relationships.forms = { data: [{ id: '11111' }] };

        fx.data[1].id = 2;
        fx.data[1].attributes.status = 'published';
        fx.data[1].attributes.name = 'One of Two';
        fx.data[1].attributes.details = '';
        fx.data[1].attributes.days_until_due = 0;
        fx.data[1].relationships.role = { data: null };

        fx.data[2].id = 3;
        fx.data[2].attributes.status = 'published';
        fx.data[2].attributes.name = 'Two of Two';
        fx.data[2].attributes.days_until_due = null;

        return fx;
      }, [1, 2])
      .routeAllProgramFlows(fx => {
        fx.data = _.sample(fx.data, 5);

        fx.data[0].id = 4;
        fx.data[0].attributes.name = '1 Flow';
        fx.data[0].attributes.status = 'published';
        fx.data[0].relationships.program = { data: { id: '1' } };
        fx.data[0].relationships.state = { data: { id: '22222' } };
        fx.data[0].relationships.role = { data: { id: '77777' } };

        fx.data[1].id = 5;
        fx.data[1].attributes.name = '2 Flow';
        fx.data[1].attributes.status = 'published';
        fx.data[1].relationships.program = { data: { id: 2 } };

        fx.data[2].id = 6;
        fx.data[2].attributes.name = '3 Flow';
        fx.data[2].attributes.status = 'published';
        fx.data[2].relationships.program = { data: { id: 2 } };

        fx.data[3].id = 7;
        fx.data[3].attributes.name = '4 Flow, should not show';
        fx.data[3].attributes.status = 'draft';
        fx.data[3].relationships.program = { data: { id: 2 } };

        fx.data[4].id = 8;
        fx.data[4].attributes.name = '5 Flow, should not show';
        fx.data[4].attributes.status = 'published';
        fx.data[4].relationships.program = { data: { id: 3 } };

        return fx;
      }, 1)
      .visit('/patient/dashboard/1')
      .wait('@routePatient')
      .wait('@routePatientActions')
      .wait('@routePatientFlows')
      .wait('@routePrograms')
      .wait('@routeAllProgramActions')
      .wait('@routeAllProgramFlows');

    cy
      .get('[data-add-workflow-region]')
      .contains('Add')
      .click();

    cy
      .get('.picklist')
      .contains('New Action')
      .click();

    cy
      .get('.patient__list')
      .find('.is-selected')
      .should('contain', 'New Action')
      .as('newAction');

    cy
      .get('@newAction')
      .find('[data-state-region]')
      .find('button')
      .should('be.disabled')
      .find('.action--queued');

    cy
      .get('@newAction')
      .find('[data-owner-region]')
      .find('button')
      .should('be.disabled')
      .should('contain', 'Clinician McTester');

    cy
      .get('@newAction')
      .find('[data-due-region]')
      .find('button')
      .should('be.disabled');

    cy
      .get('.action-sidebar')
      .find('.js-close')
      .click();

    cy
      .get('.patient__list')
      .should('not.contain', 'New Action')
      .find('.is-selected')
      .should('not.exist');

    cy
      .get('[data-add-workflow-region]')
      .contains('Add')
      .click();

    const headingOrder = [
      'Add Action',
      'No Actions, No Flows',
      'Two Actions, One Published, One Flow',
      'Two Published Actions and Flows',
    ];

    cy
      .get('.picklist')
      .find('.picklist__heading')
      .then($headings => {
        $headings.each((idx, $heading) => {
          expect($heading).to.contain(headingOrder[idx]);
        });
      });

    cy
      .get('.picklist')
      .contains('New Action');

    cy
      .get('.picklist')
      .contains('Two Actions, One Published, One Flow')
      .next()
      .should('contain', '1 Flow')
      .should('contain', 'One of One');


    cy
      .get('.picklist')
      .contains('Two Published Actions and Flows')
      .next()
      .should('contain', '2 Flow')
      .should('contain', '3 Flow')
      .should('contain', 'One of Two')
      .should('contain', 'Two of Two');

    cy
      .get('.picklist')
      .contains('No Actions, No Flows')
      .next()
      .should('contain', 'No Published Actions');

    cy
      .get('.picklist')
      .should('not.contain', 'Unpublished');

    createActionPostRoute('test-1');

    cy
      .routeAction(fx => {
        fx.data.id = 'test-1';

        // In this case let the cache work for testing routing only
        fx.data.attributes = {};
      });

    cy
      .get('.picklist')
      .contains('One of One')
      .click();

    cy
      .wait('@routePostAction')
      .its('request.body')
      .should(({ data }) => {
        expect(data.attributes.name).to.equal('One of One');
        expect(data.attributes.details).to.equal('details');
        expect(data.attributes.duration).to.equal(0);
        expect(data.attributes.due_date).to.equal(moment().add(1, 'days').format('YYYY-MM-DD'));
        expect(data.relationships.state.data.id).to.equal('22222');
        expect(data.relationships.clinician.data).to.be.null;
        expect(data.relationships.role.data.id).to.equal('11111');
        expect(data.relationships.forms.data[0].id).to.equal('11111');
      });

    cy
      .url()
      .should('contain', 'patient/1/action/test-1');

    cy
      .get('.patient__list')
      .find('.is-selected')
      .should('contain', 'One of One');

    cy
      .get('.action-sidebar')
      .find('[data-name-region]')
      .should('contain', 'One of One');

    cy
      .get('[data-add-workflow-region]')
      .contains('Add')
      .click();

    createActionPostRoute('test-2');

    cy
      .routeAction(fx => {
        fx.data.id = 'test-2';

        // In this case let the cache work for testing routing only
        fx.data.attributes = {};
      });

    cy
      .get('.picklist')
      .contains('One of Two')
      .click();

    cy
      .wait('@routePostAction')
      .its('request.body')
      .should(({ data }) => {
        expect(data.attributes.name).to.equal('One of Two');
        expect(data.attributes.details).to.equal('');
        expect(data.attributes.duration).to.equal(0);
        expect(data.attributes.due_date).to.equal(moment().format('YYYY-MM-DD'));
        expect(data.relationships.state.data.id).to.equal('22222');
        expect(data.relationships.clinician.data.id).to.be.equal('11111');
        expect(data.relationships.role.data).to.be.null;
      });

    cy
      .url()
      .should('contain', 'patient/1/action/test-2');

    cy
      .get('.patient__list')
      .find('.is-selected')
      .should('contain', 'One of Two');

    cy
      .get('.action-sidebar')
      .find('[data-name-region]')
      .should('contain', 'One of Two');

    cy
      .get('[data-add-workflow-region]')
      .contains('Add')
      .click();

    createActionPostRoute('test-3');

    cy
      .routeAction(fx => {
        fx.data.id = 'test-3';

        // In this case let the cache work for testing routing only
        fx.data.attributes = {};
      });

    cy
      .get('.picklist')
      .contains('Two of Two')
      .click();

    cy
      .wait('@routePostAction')
      .its('request.body')
      .should(({ data }) => {
        expect(data.attributes.name).to.equal('Two of Two');
        expect(data.attributes.due_date).to.be.null;
      });

    cy
      .url()
      .should('contain', 'patient/1/action/test-3');

    cy
      .get('.patient__list')
      .find('.is-selected')
      .should('contain', 'Two of Two');

    cy
      .get('.action-sidebar')
      .find('[data-name-region]')
      .should('contain', 'Two of Two');

    cy
      .route({
        status: 201,
        method: 'POST',
        url: '/api/patients/1/relationships/flows*',
        response() {
          return {
            data: {
              id: '1',
              attributes: { updated_at: moment.utc().format() },
            },
          };
        },
      })
      .as('routePostFlow');

    cy
      .get('[data-add-workflow-region]')
      .contains('Add')
      .click();

    cy
      .get('.picklist')
      .contains('1 Flow')
      .click();

    cy
      .wait('@routePostFlow')
      .its('request.body')
      .should(({ data }) => {
        expect(data.attributes.name).to.equal('1 Flow');
        expect(data.relationships.state.data.id).to.equal('22222');
        expect(data.relationships.clinician.data).to.be.null;
        expect(data.relationships.role.data.id).to.be.equal('77777');
        expect(data.relationships['program-flow'].data.id).to.be.equal('4');
      });

    cy
      .url()
      .should('contain', 'flow/1');
  });
});
