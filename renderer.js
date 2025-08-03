const { exec } = require('child_process');
const remote = require('@electron/remote');

// --- UI Elements ---
const portBtn = document.getElementById('port-scan');
const malwareBtn = document.getElementById('malware-scan');
const progressBar = document.getElementById('progress-bar');
const progressText = document.getElementById('progress-text');
const logBox = document.getElementById('log-box');
const summaryCard = document.getElementById('summary-card');
const summaryDetail = document.getElementById('summary-detail');
const openPortsBadge = document.getElementById('open-ports-badge');
const threatsBadge = document.getElementById('threats-badge');
const minimizeBtn = document.getElementById('minimize');
const closeBtn = document.getElementById('close');

//---- Auto Log----
console.log("Renderer.js loaded - version with active state and summary animation");

// --- Window Controls ---
minimizeBtn?.addEventListener('click', () => {
  const win = remote.getCurrentWindow();
  win.minimize();
});
closeBtn?.addEventListener('click', () => {
  const win = remote.getCurrentWindow();
  win.close();
});

// Log Helper
function formatTimestamp() {
  const d = new Date();
  return d.toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });
}

function log(message, severity = 'neutral', options = {}) {
  const entry = document.createElement('div');
  entry.classList.add('log-entry', `severity-${severity}`);

  // timestamp
  const ts = document.createElement('span');
  ts.classList.add('log-ts');
  ts.textContent = `[${formatTimestamp()}] `;
  entry.appendChild(ts);

  // severity badge
  if (severity !== 'neutral') {
    const badge = document.createElement('span');
    badge.classList.add('log-badge', `badge-${severity}`);
    badge.textContent = severity.toUpperCase();
    entry.appendChild(badge);
    entry.appendChild(document.createTextNode(' '));
  }

  // message text
  const text = document.createElement('span');
  text.textContent = message;
  entry.appendChild(text);

  // optional copy button
  if (options.copyable) {
    const copyBtn = document.createElement('button');
    copyBtn.textContent = 'Copy';
    copyBtn.classList.add('log-copy');
    copyBtn.addEventListener('click', () => {
      navigator.clipboard.writeText(message);
      copyBtn.textContent = '✓';
      setTimeout(() => (copyBtn.textContent = 'Copy'), 1000);
    });
    entry.appendChild(copyBtn);
  }

  logBox.appendChild(entry);
  logBox.scrollTop = logBox.scrollHeight;
}


// Classify severity based on markers or content heuristics
function classifySeverity(line) {
  const lower = line.toLowerCase();
  if (line.includes('[DANGER]') || (line.includes('[RESULT]') && lower.includes('open'))) {
    return 'danger';
  }
  if (line.includes('[INFO]')) return 'info';
  if (line.includes('[SAFE]')) return 'neutral';
  if (line.includes('[RESULT]')) return 'neutral';
  if (lower.includes('error')) return 'danger';
  return 'neutral';
}

// --- Progress control ---
let progressInterval = null;
function startFakeProgress(type) {
  let percent = 0;
  progressBar.style.width = `0%`;
  progressText.textContent = `${type} starting...`;
  progressText.classList.add('active');
  progressInterval = setInterval(() => {
    percent = Math.min(percent + Math.floor(Math.random() * 5 + 2), 90);
    progressBar.style.width = `${percent}%`;
    progressText.textContent = `${type} in progress: ${percent}%`;
  }, 250);
}

function completeProgress() {
  clearInterval(progressInterval);
  progressBar.style.width = `100%`;
  progressText.textContent = `Done`;
  setTimeout(() => {
    progressBar.style.width = `0%`;
    progressText.textContent = `Idle`;
    progressText.classList.remove('active');
  }, 600);
}

// --- Summary updater with animation ---
function updateSummary({ openPorts = 0, threats = 0, type = 'Scan' }) {
  summaryDetail.textContent = `Last run: ${type}`;
  openPortsBadge.textContent = `${openPorts} Open Port${openPorts !== 1 ? 's' : ''}`;
  threatsBadge.textContent = `${threats} Threat${threats !== 1 ? 's' : ''}`;
  summaryCard.style.display = 'flex';
  summaryCard.classList.add('new');
  setTimeout(() => summaryCard.classList.remove('new'), 600);
}

// --- Button state helpers ---
function disableButtons() {
  portBtn.disabled = true;
  malwareBtn.disabled = true;
}
function enableButtons() {
  portBtn.disabled = false;
  malwareBtn.disabled = false;
}
function clearActiveStates() {
  portBtn.classList.remove('active');
  malwareBtn.classList.remove('active');
}

// --- Scan logic ---
function startMalwareScan() {
  clearActiveStates();
  malwareBtn.classList.add('active');
  disableButtons();
  log('Starting malware scan...', 'info');
  startFakeProgress('Malware Scan');

  const command = `python -m shadelight 127.0.0.1/32 --ports 0 --signature-scan "./samples"`;

  exec(command, (error, stdout, stderr) => {
    completeProgress();
    clearActiveStates();
    if (error) {
      log(`Error: ${error.message}`, 'danger');
    }
    if (stderr) {
      stderr
        .split('\n')
        .filter(Boolean)
        .forEach(line => log(line, classifySeverity(line)));
    }

    let threats = 0;
    if (stdout) {
      stdout
        .split('\n')
        .filter(Boolean)
        .forEach(line => {
          const sev = classifySeverity(line);
          log(line, sev);
          if (line.toLowerCase().includes('threat') || line.includes('[DANGER]')) threats += 1;
        });
    }

    updateSummary({ openPorts: 0, threats, type: 'Malware Scan' });
    enableButtons();
  });
}

document.getElementById('filter-all').addEventListener('click', () => {
  document.querySelectorAll('.log-entry').forEach(e => (e.style.display = 'flex'));
});
document.getElementById('filter-info').addEventListener('click', () => {
  document.querySelectorAll('.log-entry').forEach(e => {
    e.style.display = e.classList.contains('severity-info') ? 'flex' : 'none';
  });
});
document.getElementById('filter-danger').addEventListener('click', () => {
  document.querySelectorAll('.log-entry').forEach(e => {
    e.style.display = e.classList.contains('severity-danger') ? 'flex' : 'none';
  });
});

function showBanner(message, type = 'info', duration = 4000) {
  const banner = document.createElement('div');
  banner.classList.add('banner', `banner-${type}`);
  banner.textContent = message;
  document.body.appendChild(banner);
  setTimeout(() => banner.classList.add('visible'), 10);
  setTimeout(() => {
    banner.classList.remove('visible');
    setTimeout(() => banner.remove(), 300);
  }, duration);
}

function startPortScan() {
  clearActiveStates();
  portBtn.classList.add('active');
  disableButtons();
  log('Starting port scan...', 'info');
  startFakeProgress('Port Scan');

  const ports = [22, 80, 443, 3389];
  let scanned = 0;
  let openPorts = 0;

  function scanPort(portIndex) {
    const port = ports[portIndex];
    log(`Scanning port ${port}...`, 'info');
    const cmd = `python -m shadelight 127.0.0.1/32 --ports ${port}`;

    exec(cmd, (error, stdout, stderr) => {
      if (error) {
        log(`Error: ${error.message}`, 'danger');
      }
      if (stderr) {
        stderr
          .split('\n')
          .filter(Boolean)
          .forEach(line => log(line, classifySeverity(line)));
      }
      if (stdout) {
        stdout
          .split('\n')
          .filter(Boolean)
          .forEach(line => {
            const sev = classifySeverity(line);
            log(line, sev);
            if (line.toLowerCase().includes('open')) openPorts += 1;
          });
      }

      scanned += 1;
      const percent = Math.round((scanned / ports.length) * 100);
      progressBar.style.width = `${percent}%`;
      progressText.textContent = `Port Scan: ${percent}%`;

      if (scanned < ports.length) {
        setTimeout(() => scanPort(scanned), 300);
      } else {
        completeProgress();
        log('[INFO] Port scan complete.', 'info');
        updateSummary({ openPorts, threats: 0, type: 'Port Scan' });
        clearActiveStates();
        enableButtons();
      }
    });
  }

  scanPort(0);
}

// --- Wiring buttons ---
portBtn?.addEventListener('click', startPortScan);
malwareBtn?.addEventListener('click', startMalwareScan);
