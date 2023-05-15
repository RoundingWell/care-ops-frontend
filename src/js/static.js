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

const PROGRAM_BEHAVIORS = {
  STANDARD: 'standard',
  CONDITIONAL: 'conditional',
  AUTOMATED: 'automated',
};

const RELATIVE_DATE_RANGES = [
  {
    id: 'today',
    unit: 'day',
    prev: 0,
  },
  {
    id: 'yesterday',
    unit: 'day',
    prev: 1,
  },
  {
    id: 'thisweek',
    unit: 'week',
    prev: 0,
  },
  {
    id: 'lastweek',
    unit: 'week',
    prev: 1,
  },
  {
    id: 'thismonth',
    unit: 'month',
    prev: 0,
  },
  {
    id: 'lastmonth',
    unit: 'month',
    prev: 1,
  },
];

const STATE_STATUS = {
  STARTED: 'started',
  QUEUED: 'queued',
  DONE: 'done',
};

export {
  ACTION_OUTREACH,
  ACTION_SHARING,
  PROGRAM_BEHAVIORS,
  RELATIVE_DATE_RANGES,
  STATE_STATUS,
};
