const PatientStatusIcons = {
  queued: 'exclamation-circle',
  started: 'dot-circle',
  done: 'check-circle',
};

// NOTE: id: 'admin' purposefully not included
// NOTE: Intentionally not i18n'd: may move to BE
const ACCESS_TYPES = [
  {
    id: 'employee',
    name: 'Employee',
    details: 'can access Workspace but not Admin',
  },
  {
    id: 'manager',
    name: 'Manager',
    details: 'can access Workspace and Admin',
  },
];

export {
  PatientStatusIcons,
  ACCESS_TYPES,
};
