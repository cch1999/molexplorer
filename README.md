# ChemLogic Interface

ChemLogic Interface is a demo application for exploring molecular structures, fragments and proteins. It combines local fragment libraries with live data from the PDBe and RCSB APIs to provide quick visualisations and analysis.

## Requirements
- Node.js 18 or later

## Installation
```
npm install
```

## Development
Start a local development server with Vite:
```
npm run dev
```
Run the test suite:
```
npm test
```

## Deployment
The application assumes it is served from `/molexplorer/` by default. To deploy under a
different repository name or a custom domain, set the `BASE_PATH` environment variable
to the path where the site will be hosted and rebuild:

```
BASE_PATH=/my-other-repo/ npm run build
```

For a custom domain served from the root, use `/`:

```
BASE_PATH=/ npm run build
```

## API References
- [PDBe Graph API](https://www.ebi.ac.uk/pdbe/graph-api/pdbe_doc/)
- [RCSB PDB REST API](https://data.rcsb.org/redoc/index.html)

## Disclaimer
**This application was vibe coded with AI purely for demonstration purposes.**

It is not high quality, nor was it intended for serious scientific research and should be used for educational and illustrative purposes only. Data and calculations may not be accurate or complete.

If you have any suggestions for improvements, feel free to write an issue at [github.com/cch1999/molexplorer/issues](https://github.com/cch1999/molexplorer/issues) and the author will endeavour to blindly paste this as a prompt into Cursor Agent Mode.

*Best - Charlie*

## Development Workflow
1. Install dependencies with `npm install`.
2. Create a feature branch and make changes.
3. Use `npm test` to run unit tests.
4. Run `npm run dev` to manually verify changes.
5. Submit a pull request with your modifications.

