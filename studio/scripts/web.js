#!/usr/bin/env node
const { loadEnv } = require('../src/utils/loadEnv')
loadEnv() // Load .env file into process.env

const http = require('http')
const path = require('path')
const { runPipeline } = require('../src/pipeline')

const PORT = process.env.PORT || 3000

const HTML = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Question Generator</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 20px;
    }
    .container {
      background: white;
      border-radius: 16px;
      box-shadow: 0 20px 60px rgba(0,0,0,0.3);
      max-width: 600px;
      width: 100%;
      padding: 40px;
    }
    h1 {
      color: #333;
      margin-bottom: 8px;
      font-size: 28px;
    }
    .subtitle {
      color: #666;
      margin-bottom: 32px;
      font-size: 14px;
    }
    .form-group {
      margin-bottom: 24px;
    }
    label {
      display: block;
      font-weight: 600;
      color: #333;
      margin-bottom: 8px;
      font-size: 14px;
    }
    input[type="text"], input[type="number"] {
      width: 100%;
      padding: 12px;
      border: 2px solid #e0e0e0;
      border-radius: 8px;
      font-size: 14px;
      transition: border-color 0.3s;
    }
    input[type="text"]:focus, input[type="number"]:focus {
      outline: none;
      border-color: #667eea;
    }
    .file-input-wrapper {
      position: relative;
      overflow: hidden;
      display: inline-block;
      width: 100%;
    }
    .file-input-label {
      display: block;
      padding: 12px;
      background: #f5f5f5;
      border: 2px dashed #ccc;
      border-radius: 8px;
      text-align: center;
      cursor: pointer;
      transition: all 0.3s;
      font-size: 14px;
      color: #666;
    }
    .file-input-label:hover {
      background: #ebebeb;
      border-color: #667eea;
    }
    .file-input-label.has-file {
      background: #e8f0fe;
      border-color: #667eea;
      color: #667eea;
    }
    input[type="file"] {
      position: absolute;
      left: -9999px;
    }
    button {
      width: 100%;
      padding: 14px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      border: none;
      border-radius: 8px;
      font-size: 16px;
      font-weight: 600;
      cursor: pointer;
      transition: transform 0.2s, box-shadow 0.2s;
    }
    button:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: 0 8px 20px rgba(102, 126, 234, 0.4);
    }
    button:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
    .status {
      margin-top: 24px;
      padding: 16px;
      border-radius: 8px;
      font-size: 14px;
      display: none;
    }
    .status.loading {
      display: block;
      background: #fff3cd;
      color: #856404;
      border: 1px solid #ffeeba;
    }
    .status.success {
      display: block;
      background: #d4edda;
      color: #155724;
      border: 1px solid #c3e6cb;
    }
    .status.error {
      display: block;
      background: #f8d7da;
      color: #721c24;
      border: 1px solid #f5c6cb;
    }
    .spinner {
      border: 3px solid #f3f3f3;
      border-top: 3px solid #667eea;
      border-radius: 50%;
      width: 20px;
      height: 20px;
      animation: spin 1s linear infinite;
      display: inline-block;
      margin-right: 8px;
      vertical-align: middle;
    }
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
    .download-link {
      color: #667eea;
      text-decoration: none;
      font-weight: 600;
    }
    .download-link:hover {
      text-decoration: underline;
    }
    .issues {
      margin-top: 12px;
      font-size: 13px;
      color: #666;
    }
    .issue {
      padding: 4px 0;
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>🎯 Question Generator</h1>
    <p class="subtitle">Upload discovery and methodology docs to generate your survey JSON</p>

    <form id="uploadForm">
      <div class="form-group">
        <label for="client">Client Name</label>
        <input type="text" id="client" name="client" placeholder="Acme Corp" required>
      </div>

      <div class="form-group">
        <label for="maxMinutes">Max Duration (minutes)</label>
        <input type="number" id="maxMinutes" name="maxMinutes" value="8" min="1" max="60" required>
      </div>

      <div class="form-group">
        <label for="discovery">Discovery Document</label>
        <div class="file-input-wrapper">
          <label for="discovery" class="file-input-label" id="discoveryLabel">
            📄 Choose discovery file...
          </label>
          <input type="file" id="discovery" name="discovery" accept=".txt,.md,.pdf" required>
        </div>
      </div>

      <div class="form-group">
        <label for="methodology">Methodology Document</label>
        <div class="file-input-wrapper">
          <label for="methodology" class="file-input-label" id="methodologyLabel">
            📄 Choose methodology file...
          </label>
          <input type="file" id="methodology" name="methodology" accept=".txt,.md,.pdf" required>
        </div>
      </div>

      <button type="submit" id="generateBtn">Generate Survey</button>
    </form>

    <div id="status" class="status"></div>
  </div>

  <script>
    const discoveryInput = document.getElementById('discovery');
    const methodologyInput = document.getElementById('methodology');
    const discoveryLabel = document.getElementById('discoveryLabel');
    const methodologyLabel = document.getElementById('methodologyLabel');
    const form = document.getElementById('uploadForm');
    const statusDiv = document.getElementById('status');
    const generateBtn = document.getElementById('generateBtn');

    discoveryInput.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (file) {
        discoveryLabel.textContent = '✅ ' + file.name;
        discoveryLabel.classList.add('has-file');
      }
    });

    methodologyInput.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (file) {
        methodologyLabel.textContent = '✅ ' + file.name;
        methodologyLabel.classList.add('has-file');
      }
    });

    form.addEventListener('submit', async (e) => {
      e.preventDefault();

      const client = document.getElementById('client').value;
      const maxMinutes = document.getElementById('maxMinutes').value;
      const discoveryFile = discoveryInput.files[0];
      const methodologyFile = methodologyInput.files[0];

      if (!discoveryFile || !methodologyFile) {
        showStatus('error', 'Please select both files');
        return;
      }

      generateBtn.disabled = true;
      showStatus('loading', '<div class="spinner"></div>Generating survey... This may take 30-60 seconds...');

      try {
        const discoveryText = await readFile(discoveryFile);
        const methodologyText = await readFile(methodologyFile);

        const formData = {
          client,
          maxMinutes: parseInt(maxMinutes),
          discovery: { title: discoveryFile.name, text: discoveryText },
          methodology: { title: methodologyFile.name, text: methodologyText }
        };

        const response = await fetch('/generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData)
        });

        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.error || 'Generation failed');
        }

        const blob = new Blob([JSON.stringify(result.config, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const filename = \`\${client.replace(/[^a-z0-9]/gi, '-').toLowerCase()}-survey.json\`;

        let issuesHtml = '';
        if (result.issues && result.issues.length > 0) {
          issuesHtml = '<div class="issues"><strong>Issues found:</strong>';
          result.issues.forEach(issue => {
            issuesHtml += \`<div class="issue">⚠️ \${issue.message}\${issue.nodeId ? ' (node: ' + issue.nodeId + ')' : ''}</div>\`;
          });
          issuesHtml += '</div>';
        }

        showStatus('success',
          \`✅ Survey generated successfully!<br>
          Estimated duration: \${Math.round(result.estimatedSeconds / 60)} minutes<br>
          <a href="\${url}" download="\${filename}" class="download-link">⬇️ Download \${filename}</a>
          \${issuesHtml}\`
        );

        // Auto-download
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        a.click();
        URL.revokeObjectURL(url);

      } catch (error) {
        showStatus('error', '❌ Error: ' + error.message);
      } finally {
        generateBtn.disabled = false;
      }
    });

    function readFile(file) {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target.result);
        reader.onerror = reject;
        reader.readAsText(file);
      });
    }

    function showStatus(type, message) {
      statusDiv.className = 'status ' + type;
      statusDiv.innerHTML = message;
    }
  </script>
</body>
</html>
`

const server = http.createServer(async (req, res) => {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  if (req.method === 'OPTIONS') {
    res.writeHead(200)
    res.end()
    return
  }

  if (req.method === 'GET' && req.url === '/') {
    res.writeHead(200, { 'Content-Type': 'text/html' })
    res.end(HTML)
    return
  }

  if (req.method === 'POST' && req.url === '/generate') {
    try {
      let body = ''
      req.on('data', chunk => {
        body += chunk.toString()
        if (body.length > 10e6) req.destroy() // Max 10MB
      })

      req.on('end', async () => {
        try {
          const data = JSON.parse(body)
          const { client, maxMinutes, discovery, methodology } = data

          if (!client || !discovery || !methodology) {
            res.writeHead(400, { 'Content-Type': 'application/json' })
            res.end(JSON.stringify({ error: 'Missing required fields' }))
            return
          }

          const sources = [
            { title: discovery.title, text: discovery.text },
            { title: methodology.title, text: methodology.text }
          ]

          const params = {
            client,
            constraints: { max_minutes: maxMinutes || 8, anonymity: 'anonymous' }
          }

          console.log(`[${new Date().toISOString()}] Generating survey for client: ${client}`)

          const result = await runPipeline({ sources, params })

          console.log(`[${new Date().toISOString()}] Generation complete. Issues: ${result.issues.length}`)

          res.writeHead(200, { 'Content-Type': 'application/json' })
          res.end(JSON.stringify({
            config: result.config,
            methodBrief: result.methodBrief,
            issues: result.issues,
            estimatedSeconds: result.estimatedSeconds,
            provenance: result.provenance
          }))
        } catch (error) {
          console.error('Pipeline error:', error)
          res.writeHead(500, { 'Content-Type': 'application/json' })
          res.end(JSON.stringify({ error: error.message }))
        }
      })
    } catch (error) {
      console.error('Request error:', error)
      res.writeHead(500, { 'Content-Type': 'application/json' })
      res.end(JSON.stringify({ error: 'Internal server error' }))
    }
    return
  }

  res.writeHead(404, { 'Content-Type': 'text/plain' })
  res.end('Not Found')
})

if (require.main === module) {
  server.listen(PORT, () => {
    console.log(`\n🚀 Question Generator Web UI`)
    console.log(`   → http://localhost:${PORT}\n`)
    console.log(`   Upload discovery + methodology docs to generate survey JSON\n`)
  })
}

module.exports = { server }
