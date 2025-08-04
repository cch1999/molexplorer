import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import PdbDetailsModal from '../src/modal/PdbDetailsModal.js';

describe('PdbDetailsModal author truncation', () => {
  it('truncates long author lists and adds full list tooltip', () => {
    const data = {
      struct: { title: 'Test Title' },
      citation: [{ rcsb_authors: ['Author1', 'Author2', 'Author3', 'Author4', 'Author5', 'Author6', 'Author7', 'Author8'] }],
      rcsb_accession_info: { initial_release_date: '2020-01-01' },
      rcsb_entry_info: { resolution_combined: [2.0] },
      exptl: [{ method: 'X-RAY' }],
      entity_src_gen: [{ pdbx_host_org_scientific_name: 'Org' }],
      rcsb_id: 'abcd'
    };
    const html = PdbDetailsModal.prototype.createPDBDetailsHTML(data);
    assert.ok(html.includes('Author1, Author2, Author3, ..., Author6, Author7, Author8'));
    assert.ok(html.includes('title="Author1, Author2, Author3, Author4, Author5, Author6, Author7, Author8"'));
  });
});
