import { asYouType, isValidNumber, format, parse } from '@roundingwellos/libphonenumber-js';

import { currentOrg } from 'js/config';

export function displayPhone(phone) {
  if (!isValidNumber(phone)) {
    return new getAsYouType().input(phone);
  }

  return format(phone, currentOrg.get('country_code'), 'National');
}

export function parsePhone(phone) {
  const parsedPhone = parse(phone, currentOrg.get('country_code'));

  if (!isValidNumber(parsedPhone)) return phone;

  return format(parsedPhone, 'International_plaintext');
}

export function getAsYouType() {
  return new asYouType(currentOrg.get('country_code'));
}

export function isValidPhone(phone) {
  return isValidNumber(phone, currentOrg.get('country_code'));
}
