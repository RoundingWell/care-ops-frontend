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

const ACTION_OUTREACH = {
  DISABLED: 'disabled',
  PATIENT: 'patient',
};

const ACTION_SHARING = {
  DISABLED: 'disabled',
  PENDING: 'pending',
  SENT: 'sent',
  RESPONDED: 'responded',
  CANCELED: 'canceled',
  ERROR_NO_PHONE: 'error_no_phone',
  ERROR_OPT_OUT: 'error_opt_out',
  ERROR_SMS_FAILED: 'error_sms_failed',
};

const PUBLISH_STATE_STATUS = {
  CONDITIONAL: 'conditional',
  DRAFT: 'draft',
  PUBLISHED: 'published',
};

const STATE_STATUS = {
  STARTED: 'started',
  QUEUED: 'queued',
  DONE: 'done',
};

export {
  ACCESS_TYPES,
  ACTION_OUTREACH,
  ACTION_SHARING,
  PUBLISH_STATE_STATUS,
  STATE_STATUS,
};
