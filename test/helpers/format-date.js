import dayjs from 'dayjs';
import { formatDate } from 'js/base/dayjs';

export default function(date, format) {
  return formatDate(dayjs(date), format);
}
