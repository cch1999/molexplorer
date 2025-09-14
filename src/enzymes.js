async function loadEnzymes() {
  try {
    const response = await fetch('./data/enzymes.json');
    const enzymes = await response.json();
    const tbody = document.querySelector('#enzyme-table tbody');
    enzymes.forEach(enzyme => {
      const row = document.createElement('tr');
      row.innerHTML = `
        <td>${enzyme.name}</td>
        <td>${enzyme.ecNumber}</td>
        <td>${enzyme.description}</td>
      `;
      tbody.appendChild(row);
    });
  } catch (err) {
    console.error('Failed to load enzymes', err);
  }
}

loadEnzymes();
