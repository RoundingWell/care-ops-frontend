import moment from 'moment';

import { getResource } from 'helpers/json-api';
import formatDate from 'helpers/format-date';

context('action sidebar', function() {
  specify('display action sidebar', function() {
    const now = moment.utc();
    const local = moment();

    cy
      .server()
      .routePatientActions(fx => {
        fx.data[0].id = '1';
        fx.data[0].attributes.updated_at = now.format();
        fx.data[0].relationships.events.data[0].id = '11111';

        return fx;
      }, '1')
      .routeActionActivity(fx => {
        fx.data = getResource(this.fxEvents, 'events');
        fx.data[0].attributes.date = now.format();

        return fx;
      })
      .routePatient()
      .visit('/patient/1/action/1')
      .wait('@routePatientActions')
      .wait('@routeActionActivity')
      .wait('@routePatient');

    cy
      .get('.action-sidebar__timestamps')
      .should('contain', `Created: ${ formatDate(local, 'AT_TIME') }`)
      .should('contain', `Last Updated: ${ formatDate(local, 'AT_TIME') }`);

    cy
      .get('[data-activity-region]')
      .should('contain', 'Charlene Schinner (Supervisor) added this Action')
      .should('contain', 'Jamir Nicolas (Nurse) changed the Owner to Joany White')
      .should('contain', 'Merl Waelchi (Pharmacist) changed the details of this Action')
      .should('contain', 'Domingo Murray (Coordinator) changed the Due Date to')
      .should('contain', 'Cory Hackett (Specialist) changed Duration to 12')
      .should('contain', 'Laney Orn (Nurse) changed the name of this Action from leverage orchestration to iterate core')
      .should('contain', 'Jimmie Lynch (Nurse) changed the Owner to Coordinator')
      .should('contain', 'Aryanna O\'Kon (Specialist) changed State to Pending');
  });
});
