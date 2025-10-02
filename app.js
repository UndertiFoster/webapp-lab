const express = require('express');
const appInsights = require('applicationinsights');

// Configuration d'Application Insights
try {
  // En production, utilisez la clé d'instrumentation configurée dans les variables d'environnement
  appInsights.setup();
  appInsights.start();
  console.log('Application Insights started successfully');
} catch (error) {
  console.log('Application Insights not configured, telemetry will not be available:', error.message);
  // Créer un mock pour éviter les erreurs quand appInsights.defaultClient est utilisé
  appInsights.defaultClient = {
    trackEvent: () => {},
    trackMetric: () => {}
  };
}

const app = express();
const port = process.env.PORT || 3000;

// Compteur de visites
let visitCount = 0;

// Page d'accueil
app.get('/', (req, res) => {
  visitCount++;

  // Télémétrie custom
  appInsights.defaultClient.trackEvent({
    name: 'PageView',
    properties: { page: 'home', version: process.env.APP_VERSION || '2.0' }
  });

  appInsights.defaultClient.trackMetric({
    name: 'VisitCount',
    value: visitCount
  });

  res.send(`
    <html>
      <head><title>Azure App Service Lab</title></head>
      <body style="font-family: Arial; text-align: center; padding: 50px; background: #f0f8ff;">
        <h1>🚀 Azure App Service + GitHub Lab</h1>
        <p>Version: ${process.env.APP_VERSION || '2.0'} - Mise à jour automatique !</p>
        <p>Déployé automatiquement depuis GitHub !</p>
        <p>Timestamp: ${new Date().toISOString()}</p>
        <p>Nombre de visites: ${visitCount}</p>
        <p style="color: green;">✅ CI/CD fonctionne parfaitement !</p>
        <hr>
        <h2>Endpoints disponibles:</h2>
        <ul style="list-style: none;">
          <li><a href="/health">📊 /health</a></li>
          <li><a href="/api/info">ℹ️ /api/info</a></li>
          <li><a href="/load-test">🔥 /load-test</a></li>
        </ul>
      </body>
    </html>
  `);
});

// Endpoint de santé
app.get('/health', (req, res) => {
  // Télémétrie custom
  appInsights.defaultClient.trackEvent({
    name: 'PageView',
    properties: { page: 'health', version: process.env.APP_VERSION || '2.0' }
  });

  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    version: process.env.APP_VERSION || '2.0'
  });
});

// Endpoint d'info enrichi
app.get('/api/info', (req, res) => {
  // Télémétrie custom
  appInsights.defaultClient.trackEvent({
    name: 'PageView',
    properties: { page: 'api/info', version: process.env.APP_VERSION || '2.0' }
  });
  
  const infoData = {
    app: 'webapp-lab',
    version: process.env.APP_VERSION || '2.0',
    platform: process.platform,
    nodeVersion: process.version,
    environment: process.env.NODE_ENV || 'development',
    customMessage: process.env.CUSTOM_MESSAGE || 'No custom message',
    azureRegion: process.env.REGION_NAME || 'unknown',
    instanceId: process.env.WEBSITE_INSTANCE_ID || 'local-dev'
  };
  
  // Envoyer également comme métrique personnalisée
  appInsights.defaultClient.trackEvent({
    name: 'AppInfo',
    properties: infoData
  });
  
  res.json(infoData);
});

// Endpoint de test de charge
app.get('/load-test', (req, res) => {
  // Télémétrie custom - début du test
  appInsights.defaultClient.trackEvent({
    name: 'LoadTestStarted',
    properties: { page: 'load-test', version: process.env.APP_VERSION || '2.0' }
  });
  
  const start = Date.now();

  // CPU intensive task
  let result = 0;
  for (let i = 0; i < 1000000; i++) {
    result += Math.sqrt(i);
  }

  const duration = Date.now() - start;
  
  // Télémétrie pour la performance
  appInsights.defaultClient.trackMetric({
    name: 'LoadTestDuration',
    value: duration
  });

  // Télémétrie custom - fin du test
  appInsights.defaultClient.trackEvent({
    name: 'LoadTestCompleted',
    properties: {
      duration: duration,
      result: Math.floor(result)
    }
  });

  res.json({
    message: 'Load test completed',
    duration: `${duration}ms`,
    result: Math.floor(result),
    timestamp: new Date().toISOString()
  });
});

// Lancer le serveur
app.listen(port, () => {
  console.log(`✅ Server running on port ${port}`);
});
