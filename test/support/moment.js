import moment from 'moment';

import utcPlugin from 'dayjs/plugin/utc';
import localizedFormatPlugin from 'dayjs/plugin/localizedFormat';
import weekdayPlugin from 'dayjs/plugin/weekday';
import customParseFormatPlugin from 'dayjs/plugin/customParseFormat';

moment.extend(localizedFormatPlugin);
moment.extend(utcPlugin);
moment.extend(weekdayPlugin);
moment.extend(customParseFormatPlugin);
