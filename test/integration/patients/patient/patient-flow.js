import _ from 'underscore';
import moment from 'moment';

const now = moment.utc();

context('patient flow page', function() {
  specify('context trail', function() {
    cy
      .server()
      .routeFlow(fx => {
        fx.data.id = '1';

        fx.data.attributes.name = 'Test Flow';
        fx.data.attributes.updated_at = now.format();

        return fx;
      })
      .routeFlowActions(_.identity, '1')
      .routePatientByFlow(fx => {
        fx.data.id = '1';
        fx.data.attributes.first_name = 'Test';
        fx.data.attributes.last_name = 'Patient';

        return fx;
      })
      .visit('/flow/1')
      .wait('@routeFlow')
      .wait('@routeFlowActions')
      .wait('@routePatientByFlow');
  });

  specify('empty view', function() {
    cy
      .server()
      .routeFlow(fx => {
        fx.data.id = '1';

        fx.data.attributes.name = 'Test Flow';
        fx.data.attributes.updated_at = now.format();

        return fx;
      })
      .routeFlowActions(fx => {
        fx.data = [];

        return fx;
      }, '1')
      .routePatientByFlow(fx => {
        fx.data.id = '1';
        fx.data.attributes.first_name = 'Test';
        fx.data.attributes.last_name = 'Patient';

        return fx;
      })
      .visit('/flow/1')
      .wait('@routeFlow')
      .wait('@routeFlowActions')
      .wait('@routePatientByFlow');

    cy
      .get('.workflows__empty-list')
      .contains('No Actions');
  });
});
