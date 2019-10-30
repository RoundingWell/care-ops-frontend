import $ from 'jquery';
import anime from 'animejs';
import Backbone from 'backbone';
import Radio from 'backbone.radio';

import hbs from 'handlebars-inline-precompile';

import Droplist from 'js/components/droplist';

import App from 'js/base/app';

import intl from 'js/i18n';

const i18n = intl.patients.patient.dashboard.addActionApp;


export default App.extend({
  onBeforeStart() {
    anime({
      targets: '.button', // fixme
      color: ['#0582DA', '#0582DA'],
      loop: true,
      easing: 'easeInOutSine',
      duration: 2000,
      direction: 'alternate',
    });
  },

  beforeStart() {
    const d = $.Deferred();
    const fetchPrograms = Radio.request('entities', 'fetch:programs:collection');
    const fetchProgramActions = Radio.request('entities', 'fetch:programActions:all', { filter: 'published' });
    $.when(fetchPrograms, fetchProgramActions).done((programs, programActions) => {
      d.resolve(programs[0]);
    });
    return d.promise();
  },

  onStart(options, programs) {
    const lists = programs.map(program => {
      return {
        headingText: program.get('name'),
        collection: program.getPublishedActions(),
        itemTemplate: hbs`<span>{{far "file-alt"}}<a>{{ name }}</a></span>`,
      };
    });

    // Add Non Program Action button
    lists.unshift({
      collection: new Backbone.Collection([{
        id: 'new-blank-action',
        name: i18n.newAction,
      }]),
      itemTemplate: hbs`<span>{{far "file-alt"}}<a class="italic">{{ name }}</a></span>`,
    });

    this.showView(new Droplist({
      lists,
      picklistOptions: {
        headingText: i18n.droplistHeading,
        isSelectlist: true,
      },
      viewOptions: {
        className: 'button-primary',
        template: hbs`{{far "plus-circle"}} {{ @intl.patients.patient.dashboard.addActionApp.viewOptions.add }}`,
      },
    }));
  },
});
