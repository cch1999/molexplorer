window.onload = function () {
    const grid = document.getElementById("molecule-grid");

    fetch("molecules.sdf")
        .then((response) => response.text())
        .then((data) => {
            const molecules = data.split("$$$$");
            molecules.forEach((molData, index) => {
                if (molData.trim() === "") return;

                const lines = molData.trim().split("\n");
                const name = lines[0].trim();
                const counts = lines[3].trim().split(/\s+/);
                const atomCount = parseInt(counts[0]);
                const bondCount = parseInt(counts[1]);

                const card = document.createElement("div");
                card.className = "molecule-card";
                card.innerHTML = `
          <div id="viewer-${index}" class="viewer-container"></div>
          <div class="molecule-info">
            <h3>${name}</h3>
            <p>Atoms: ${atomCount} | Bonds: ${bondCount}</p>
          </div>
        `;
                grid.appendChild(card);

                let element = document.getElementById(`viewer-${index}`);
                let config = { backgroundColor: "white" };
                let viewer = $3Dmol.createViewer(element, config);
                viewer.addModel(molData, "sdf");
                viewer.setStyle({}, { stick: {} });
                viewer.zoomTo();
                viewer.render();
            });
        });
}; 