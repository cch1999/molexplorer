import * as base from './api/baseService.js';
import * as rcsb from './api/rcsbService.js';
import * as pdbe from './api/pdbeService.js';
import * as fragment from './api/fragmentService.js';

export const { fetchText, fetchJson, clearCache } = base;
export const RcsbService = rcsb;
export const PdbeService = pdbe;
export const FragmentService = fragment;

export default {
  ...base,
  ...rcsb,
  ...pdbe,
  ...fragment
};
