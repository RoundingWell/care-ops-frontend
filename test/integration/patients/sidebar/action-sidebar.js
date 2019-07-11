import _ from 'underscore';

import { getResource } from 'helpers/json-api';

context('action sidebar', function() {
  specify('display action events', function() {
    cy
      .server()
      .routePatientActions(_.identity, '1')
      .routeActionActivity(fx => {
        fx.data = getResource(this.fxEvents, 'events');
        return fx;
      })
      .routePatient()
      .visit('/patient/1/action/1')
      .wait('@routePatient');

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
