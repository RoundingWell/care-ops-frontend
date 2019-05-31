import moment from 'moment';
import { formatDate } from 'js/base/moment';

export default function(date, format) {
  return formatDate(moment(date), format);
}
