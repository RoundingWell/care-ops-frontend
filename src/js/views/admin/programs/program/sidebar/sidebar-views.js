import { View, Region } from 'marionette';

import SidebarTemplate from './sidebar-layout.hbs';

import './program-sidebar.scss';

const SidebarView = View.extend({
  className: 'program-sidebar',
  template: SidebarTemplate,
  regionClass: Region.extend({ replaceElement: true }),
});

export {
  SidebarView,
};
