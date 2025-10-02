const express = require('express');
const app = express();
const port = process.env.PORT || 3000;

// Page d'accueil
app.get('/', (req, res) => {
  res.send(`
    <html>
      <head><title>Azure App Service Lab</title></head>
      <body style="font-family: Arial; text-align: center; padding: 50px; background: #f0f8ff;">
        <h1>🚀 Azure App Service + GitHub Lab</h1>
        <p>Version: 2.0 - Mise à jour automatique !</p>
        <p>Déployé automatiquement depuis GitHub !</p>
        <p>Timestamp: ${new Date().toISOString()}</p>
        <p style="color: green;">✅ CI/CD fonctionne parfaitement !</p>
        <hr>
        <h2>Endpoints disponibles:</h2>
        <ul style="list-style: none;">
          <li><a href="/health">📊 /health</a></li>
          <li><a href="/api/info">ℹ️ /api/info</a></li>
        </ul>
      </body>
    </html>
  `);
});

// Endpoint de santé
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    version: '2.0'
  });
});

// Endpoint d'info
app.get('/api/info', (req, res) => {
  res.json({
    app: 'webapp-lab',
    version: '2.0',
    platform: process.platform,
    nodeVersion: process.version,
    environment: process.env.NODE_ENV || 'development'
  });
});

// Lancer le serveur
app.listen(port, () => {
  console.log(`✅ Server running on port ${port}`);
});
