import Radio from 'backbone.radio';

import WidgetsService from './widgets';

import { Collection as Widgets } from 'js/entities-service/entities/widgets';

import fxTestWidgets from 'fixtures/test/widgets';

context('Widgets Service', function() {
  let service;

  beforeEach(function() {
    const widgetsPatientSidebar = {
      widgets: ['dob', 'sex'],
      fields: ['foo'],
    };

    Radio.reply('settings', 'get', () => widgetsPatientSidebar);

    const widgets = new Widgets(fxTestWidgets);

    service = new WidgetsService({ widgets });
  });

  afterEach(function() {
    Radio.reset('settings');
    service.destroy();
  });

  specify('sidebarWidgets', function() {
    const widgets = Radio.request('widgets', 'sidebarWidgets');

    expect(widgets.at(0).get('slug')).to.equal('dob');
    expect(widgets.at(1).get('slug')).to.equal('sex');
    expect(widgets.length).to.equal(2);
  });

  specify('sidebarWidgets:fields', function() {
    const fields = Radio.request('widgets', 'sidebarWidgets:fields');

    expect(fields[0]).to.equal('foo');
  });

  specify('build', function() {
    const widgets = Radio.request('widgets', 'build', ['dob', 'divider', 'sex']);

    expect(widgets.at(0).get('slug')).to.equal('dob');
    expect(widgets.at(1).get('slug')).to.equal('divider');
    expect(widgets.at(2).get('slug')).to.equal('sex');
    expect(widgets.length).to.equal(3);
  });

  specify('find', function() {
    const widget = Radio.request('widgets', 'find', 'dob');

    expect(widget.get('slug')).to.equal('dob');
  });
});
