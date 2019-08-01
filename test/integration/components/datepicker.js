import 'js/base/setup';
import Backbone from 'backbone';
import { View } from 'marionette';
import moment from 'moment';

import hbs from 'handlebars-inline-precompile';

import formatDate from 'helpers/format-date';

context('Datepicker', function() {
  let Datepicker;

  const TestView = View.extend({
    initialize() {
      this.render();
    },
    template: hbs`
      <button class="button--blue u-margin--t-16 u-margin--l-16">
        {{formatMoment date "LONG" defaultHtml="Select Date"}}
      </button>`,
    ui: {
      button: 'button',
    },
    triggers: {
      'click button': 'click',
    },
    modelEvents: {
      'change:date': 'render',
    },
    dateState: {},
    onClick() {
      const state = this.getOption('dateState');

      const datepicker = new Datepicker({
        ui: this.ui.button,
        uiView: this,
        state,
      });

      this.datepicker = datepicker;

      this.listenTo(datepicker, 'change:selectedDate', date => {
        state.selectedDate = date;
        this.model.set({ date });

        datepicker.destroy();
      });

      datepicker.show();
    },
  });

  beforeEach(function() {
    cy
      .visit('/');

    cy
      .window()
      .should('have.property', 'Components')
      .then(Components => {
        Datepicker = Components.Datepicker;
      });
  });

  specify('Displaying', function() {
    let testView;

    cy
      .getHook($hook => {
        testView = new TestView({
          el: $hook[0],
          model: new Backbone.Model(),
        });
      });

    cy
      .get('@hook')
      .contains('Select Date')
      .click();

    cy
      .get('.datepicker')
      .should('contain', formatDate(moment.utc(), 'MMM YYYY'))
      .find('.is-today')
      .should('contain', formatDate(moment.utc(), 'D'));

    cy
      .get('.datepicker')
      .contains('Today')
      .click();

    cy
      .get('.datepicker')
      .should('not.exist');

    cy
      .get('@hook')
      .contains(formatDate(moment.utc(), 'LONG'))
      .click();

    cy
      .get('.datepicker')
      .find('.is-selected')
      .should('contain', moment.utc().format('D'));

    cy
      .get('.datepicker')
      .contains('Tomorrow')
      .click();

    cy
      .get('@hook')
      .contains(formatDate(moment.utc().add(1, 'days'), 'LONG'))
      .click();

    cy
      .get('.datepicker')
      .contains('Clear')
      .click();

    cy
      .get('@hook')
      .contains('Select Date')
      .click();

    cy
      .get('.datepicker')
      .contains('10')
      .click();

    cy
      .get('@hook')
      .contains('10')
      .click();

    cy
      .get('.datepicker')
      .contains(formatDate(moment.utc().add(1, 'months'), 'MMM'))
      .click();

    cy
      .get('.datepicker')
      .should('contain', formatDate(moment.utc().add(1, 'months'), 'MMM YYYY'))
      .contains(formatDate(moment.utc(), 'MMM'))
      .click();

    cy
      .get('.datepicker')
      .should('contain', formatDate(moment.utc(), 'MMM YYYY'));

    cy
      .then(() => {
        testView.datepicker.setState('currentMonth', '01/01/2016');
      });

    cy
      .get('.datepicker')
      .should('contain', 'Jan 2016');

    cy
      .then(() => {
        testView.datepicker.setState('selectedDate', '01/05/2016');
        expect(moment.isMoment(testView.datepicker.getState('selectedDate')), 'selectedDate is moment').to.be.true;
      });
  });

  specify('Previous month days', function() {
    cy
      .getHook($hook => {
        new TestView({
          el: $hook[0],
          model: new Backbone.Model(),
          dateState: {
            beginDate: '02/08/2015',
            endDate: '02/21/2015',
            currentMonth: '02/01/2015',
          },
        });
      });

    cy
      .get('@hook')
      .contains('Select Date')
      .click();

    cy
      .get('.datepicker')
      .find('.is-other-month')
      .should('not.exist');

    cy
      .get('.datepicker')
      .find('.datepicker__days li a')
      .should('have.lengthOf', 14);

    cy
      .get('.datepicker')
      .contains('7')
      .should('have.class', 'is-disabled');

    cy
      .get('.datepicker')
      .contains('22')
      .should('have.class', 'is-disabled');
  });
});
