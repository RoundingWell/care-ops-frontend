import { formatDate } from 'js/base/moment';

const moment = Cypress.moment;

export default function(date, format) {
  return formatDate(moment(date), format);
}
