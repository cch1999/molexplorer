import * as d3 from 'd3';
import ApiService from '../utils/apiService.js';

class SimilarityGraph {
  constructor(moleculeManager) {
    this.moleculeManager = moleculeManager;
    this.currentCode = null;
    this.modal = document.createElement('div');
    this.modal.id = 'similarity-graph-modal';
    this.modal.className = 'modal';

    const content = document.createElement('div');
    content.className = 'modal-content details-modal';

    const header = document.createElement('div');
    header.className = 'modal-header';
    const title = document.createElement('h3');
    title.textContent = 'Similar Ligand Network';
    const close = document.createElement('span');
    close.className = 'close';
    close.textContent = '\u00d7';
    header.appendChild(title);
    header.appendChild(close);

    const body = document.createElement('div');
    body.className = 'modal-body';
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    body.appendChild(svg);

    content.appendChild(header);
    content.appendChild(body);
    this.modal.appendChild(content);
    document.body.appendChild(this.modal);

    this.svg = svg;
    this.closeBtn = close;
    this.closeBtn.addEventListener('click', () => this.close());
  }

  async open(ccdCode) {
    this.currentCode = ccdCode;
    if (this.modal) {
      this.modal.style.display = 'block';
    }
    if (this.svg) {
      this.svg.innerHTML = '';
    }
    const data = await ApiService.getSimilarCcds(ccdCode);
    const neighbors = data[ccdCode] || [];
    const nodes = [{ id: ccdCode, root: true }, ...neighbors.map(n => ({ id: n.ccd_id }))];
    const links = neighbors.map(n => ({ source: ccdCode, target: n.ccd_id }));

    const width = 600;
    const height = 400;

    const svg = d3.select(this.svg)
      .attr('width', width)
      .attr('height', height);

    const simulation = d3.forceSimulation(nodes)
      .force('link', d3.forceLink(links).id(d => d.id).distance(80))
      .force('charge', d3.forceManyBody().strength(-200))
      .force('center', d3.forceCenter(width / 2, height / 2));

    const link = svg.append('g')
      .selectAll('line')
      .data(links)
      .enter()
      .append('line')
      .attr('stroke', '#999');

    const node = svg.append('g')
      .selectAll('circle')
      .data(nodes)
      .enter()
      .append('circle')
      .attr('r', d => d.root ? 12 : 8)
      .attr('fill', d => d.root ? '#ff5722' : '#2196f3')
      .attr('data-id', d => d.id);

    const label = svg.append('g')
      .selectAll('text')
      .data(nodes)
      .enter()
      .append('text')
      .text(d => d.id)
      .attr('font-size', 10);

    node.on('click', (event, d) => {
      this.moleculeManager.showMoleculeDetails(d.id);
    });
    node.on('dblclick', (event, d) => {
      this.moleculeManager.addMolecule({ code: d.id });
    });

    simulation.on('tick', () => {
      link
        .attr('x1', d => d.source.x)
        .attr('y1', d => d.source.y)
        .attr('x2', d => d.target.x)
        .attr('y2', d => d.target.y);

      node
        .attr('cx', d => d.x)
        .attr('cy', d => d.y);

      label
        .attr('x', d => d.x + 12)
        .attr('y', d => d.y + 4);
    });

    // run a few ticks synchronously for layout in tests
    simulation.tick(30);
  }

  close() {
    if (this.modal) {
      this.modal.style.display = 'none';
    }
  }
}

export default SimilarityGraph;
