# Shadelight Electron (SLE)

Desktop GUI wrapper for the Shadelight Python network and malware scanner.  
Provides an Electron-based interface with styled logs, scan summary, and actionable banners.

## Features (current)

- Port scan and malware signature scan via embedded Python backend  
- Styled, self-contained log bubbles with severity badges  
- Summary card with scan results  
- Custom purple-branded UI with draggable frameless window  
- Banner notifications (e.g., insecure service warnings)  
- Foundation for future extensions (vulnerability hints, AI integration)

## Quickstart (development)

### Prerequisites

- Node.js (v18+ recommended)  
- Python (3.10+ ideally)  
- Optional: `virtualenv` for Python isolation  
- Git

### Setup & Run

```bash
# Clone repo and install frontend dependencies
git clone git@github.com:yourusername/shadelight-electron.git
cd shadelight-electron/shadelight-electron
npm install

# (Optional) Python backend environment setup
python -m venv venv

# On Windows:
venv\Scripts\activate

# On Unix / macOS:
source venv/bin/activate

# Install backend requirements (adjust path if backend lives elsewhere)
pip install -r ../shadelight/requirements.txt

# Launch development UI
npm start
```

This launches the Electron UI, which invokes the Python backend to perform scans.

## Backend integration

Currently the frontend runs the Python scanner with commands like:

```bash
python -m shadelight 127.0.0.1/32 --ports 22
python -m shadelight 127.0.0.1/32 --signature-scan "./samples"
```

## Planned improvement

Support structured JSON output from the backend. Example format:

```json
{"type":"progress","scan":"port","port":22,"percent":50}
{"type":"result","severity":"danger","message":"Port 23 open"}
{"type":"summary","open_ports":2,"threats":1,"scan_type":"Port Scan"}
```

The frontend will parse these messages to drive logs, summary card, and banner notifications.

## Scripts (in `package.json`)

```json
"scripts": {
  "start": "electron .",
  "build": "electron-builder"
}
```

- `npm start`: Launches the development UI.  
- `npm run build`: Produces packaged installers via `electron-builder` (needs configuration).

## Repository layout

```text
shadelight-electron/
├── main.js               # Electron entrypoint
├── renderer.js           # UI logic
├── preload.js            # (if used)
├── index.html           # UI markup
├── assets/              # Icons, styles, etc.
│   └── css/style.css    # Styling
├── shadelight/          # (optionally a submodule) Python backend
├── package.json         # Node/Electron config
├── .gitignore
└── README.md            # This file
```

## Packaging (next steps)

1. Install `electron-builder`:

```bash
npm install --save-dev electron-builder
```

2. Add a `build` section to `package.json` with target platforms and icon configuration.

3. Run the build:

```bash
npm run build
```

## Future ideas

- AI-assisted scan result explanations  
- Automatic malware signature updates (signed and versioned)  
- Vulnerability enrichment (e.g., CVE lookups for detected services)  
- Persist last summary across launches  
- Keyboard shortcuts and accessibility improvements  
- Theme toggle (light/dark)  
- Auto-update / release channels  

## Contributing

1. Fork the repository  
2. Create a feature branch: `git checkout -b feature/name`  
3. Commit with clear messages  
4. Open a pull request against `main`  
5. Follow semantic versioning for releases and keep the UI/backend contract (structured output) backward compatible.

## Troubleshooting

- Open DevTools to inspect log parsing errors or resource loading issues.  
- Ensure the Python backend is accessible and the correct interpreter is used.  
- Confirm `assets/css/style.css` is loading if styling appears broken.

## Tips

- Tag releases, e.g., `git tag -a v0.1.0 -m "Initial UI"`  
- Keep `node_modules/` and Python virtualenv out of version control.  
- Consider adding CI to validate builds and backend integrity.

## License

Specify the license used for the project. Example:

```text
MIT License
```