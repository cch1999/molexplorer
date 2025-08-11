import ApiService from '../utils/apiService.js';

/**
 * Simple interface for displaying Density Functional Theory (DFT) data
 * for a particular chemical component. The viewer expects a section with
 * id `dft-data-section` that contains a table body `dft-data-tbody` where
 * each property/value pair will be rendered as rows.
 */
class DftDataViewer {
  /**
   * Fetch and render DFT data for the given CCD code.
   *
   * @param {string} ccdCode - Three letter chemical component code.
   * @returns {Promise<void>}
   */
  async show(ccdCode) {
    const section = document.getElementById('dft-data-section');
    const tbody = document.getElementById('dft-data-tbody');
    if (!section || !tbody) return;

    tbody.innerHTML = '';
    try {
      const data = await ApiService.getDftData(ccdCode);
      if (!data || Object.keys(data).length === 0) {
        section.style.display = 'none';
        return;
      }

      section.style.display = 'block';
      Object.entries(data).forEach(([key, value]) => {
        const row = document.createElement('tr');
        const keyCell = document.createElement('td');
        keyCell.textContent = key;
        const valueCell = document.createElement('td');
        valueCell.textContent = String(value);
        row.appendChild(keyCell);
        row.appendChild(valueCell);
        tbody.appendChild(row);
      });
    } catch (err) {
      console.error('Error fetching DFT data:', err);
      section.style.display = 'none';
    }
  }
}

export default DftDataViewer;
