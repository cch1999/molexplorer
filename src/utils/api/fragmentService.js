import { FRAGMENT_LIBRARY_URL } from '../constants.js';
import { fetchText } from './baseService.js';

export function getFragmentLibraryTsv() {
  return fetchText(FRAGMENT_LIBRARY_URL);
}

export default { getFragmentLibraryTsv };
