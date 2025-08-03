import ApiService from '../utils/apiService.js';

class SimilarityGraph {
  constructor(moleculeManager, d3lib = (typeof window !== 'undefined' ? window.d3 : null)) {
    this.moleculeManager = moleculeManager;
    this.d3 = d3lib;
    this.modal = null;
    this.svg = null;
    this.titleEl = null;
  }

  async open(ccdCode) {
    if (!this.modal) {
      this.#createModal();
    }
    this.currentCode = ccdCode;
    if (this.titleEl) {
      this.titleEl.textContent = `Similar Ligands for ${ccdCode}`;
    }
    if (this.modal) {
      this.modal.style.display = 'block';
    }
    await this.#renderGraph(ccdCode);
  }

  #createModal() {
    const overlay = document.createElement('div');
    overlay.id = 'similarity-graph-modal';
    overlay.className = 'modal';
    overlay.style = { display: 'none' };

    const content = document.createElement('div');
    content.className = 'modal-content similarity-graph-modal';

    const closeBtn = document.createElement('span');
    closeBtn.className = 'close';
    closeBtn.innerHTML = '&times;';
    closeBtn.addEventListener('click', () => {
      if (this.modal) this.modal.style.display = 'none';
    });

    this.titleEl = document.createElement('h4');
    this.titleEl.className = 'graph-title';

    const svgEl = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svgEl.setAttribute('width', '600');
    svgEl.setAttribute('height', '400');

    content.appendChild(closeBtn);
    content.appendChild(this.titleEl);
    content.appendChild(svgEl);
    overlay.appendChild(content);
    document.body.appendChild(overlay);

    this.modal = overlay;
    this.svg = this.d3.select(svgEl);
  }

  async #renderGraph(ccdCode) {
    const data = await ApiService.getSimilarCcds(ccdCode);
    const entry = data[ccdCode]?.[0];

    const nodes = [{ id: ccdCode, type: 'query' }];
    const links = [];

    const process = (type, arr) => {
      arr.forEach(lig => {
        nodes.push({ id: lig.chem_comp_id, type });
        links.push({ source: ccdCode, target: lig.chem_comp_id });
      });
    };
    if (entry?.stereoisomers) process('stereoisomer', entry.stereoisomers);
    if (entry?.same_scaffold) process('scaffold', entry.same_scaffold);
    if (entry?.similar_ligands) process('similar', entry.similar_ligands);

    this.svg.selectAll('*').remove();

    const simulation = this.d3.forceSimulation(nodes)
      .force('link', this.d3.forceLink(links).id(d => d.id).distance(80))
      .force('charge', this.d3.forceManyBody().strength(-200))
      .force('center', this.d3.forceCenter(300, 200));

    const link = this.svg.append('g')
      .attr('stroke', '#999')
      .attr('stroke-opacity', 0.6)
      .selectAll('line')
      .data(links)
      .join('line');

    const node = this.svg.append('g')
      .attr('stroke', '#fff')
      .attr('stroke-width', 1.5)
      .selectAll('circle')
      .data(nodes)
      .join('circle')
      .attr('r', d => d.id === ccdCode ? 12 : 8)
      .attr('fill', d => d.id === ccdCode ? '#ff5722' : '#69b3a2')
      .call(this.d3.drag()
        .on('start', dragstarted)
        .on('drag', dragged)
        .on('end', dragended));

    node.append('title').text(d => d.id);

    node.on('click', (event, d) => {
      if (this.modal) this.modal.style.display = 'none';
      this.moleculeManager.showMoleculeDetails(d.id);
    });
    node.on('contextmenu', (event, d) => {
      event.preventDefault();
      const added = this.moleculeManager.addMolecule(d.id);
      if (typeof showNotification === 'function') {
        showNotification(
          added ? `Adding molecule ${d.id}...` : `Molecule ${d.id} already exists`,
          added ? 'success' : 'info'
        );
      }
    });

    const label = this.svg.append('g')
      .selectAll('text')
      .data(nodes)
      .join('text')
      .text(d => d.id)
      .attr('font-size', 10)
      .attr('dx', 12)
      .attr('dy', 4);

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
        .attr('x', d => d.x)
        .attr('y', d => d.y);
    });

    function dragstarted(event, d) {
      if (!event.active) simulation.alphaTarget(0.3).restart();
      d.fx = d.x;
      d.fy = d.y;
    }

    function dragged(event, d) {
      d.fx = event.x;
      d.fy = event.y;
    }

    function dragended(event, d) {
      if (!event.active) simulation.alphaTarget(0);
      d.fx = null;
      d.fy = null;
    }
  }
}

export default SimilarityGraph;
