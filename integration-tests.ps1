# Script de tests d'intégration PowerShell pour App Service
# URL de l'App Service Azure
$BaseUrl = "https://webapp-lab-random-c7gbeedsbwedc6d4.francecentral-01.azurewebsites.net"

# Fonction d'aide pour gérer les erreurs
function Invoke-SafeWebRequest {
    param(
        [string]$Uri
    )
    
    try {
        $response = Invoke-WebRequest -Uri $Uri -UseBasicParsing
        return $response
    }
    catch {
        Write-Host "Erreur lors de la connexion à $Uri : $_" -ForegroundColor Red
        Write-Host "Vérifiez que le serveur est en cours d'exécution sur $BaseUrl" -ForegroundColor Yellow
        return $null
    }
}

Write-Host "Tests d'integration App Service"
Write-Host "=================================="

# Test endpoint principal
Write-Host "Test endpoint principal..."
$response = Invoke-SafeWebRequest -Uri $BaseUrl
if ($response -and $response.Content -match "Azure App Service") {
    Write-Host "✅ OK" -ForegroundColor Green
} else {
    Write-Host "❌ FAIL" -ForegroundColor Red
}

# Test health check
Write-Host "Test health check..."
$response = Invoke-SafeWebRequest -Uri "$BaseUrl/health"
if ($response) {
    $content = $response.Content | ConvertFrom-Json
    if ($content.status -eq "OK") {
        Write-Host "✅ OK" -ForegroundColor Green
    } else {
        Write-Host "❌ FAIL" -ForegroundColor Red
    }
} else {
    Write-Host "❌ FAIL" -ForegroundColor Red
}

# Test API info
Write-Host "Test API info..."
$response = Invoke-SafeWebRequest -Uri "$BaseUrl/api/info"
if ($response) {
    $content = $response.Content | ConvertFrom-Json
    if ($content.app -eq "webapp-lab") {
        Write-Host "✅ OK" -ForegroundColor Green
    } else {
        Write-Host "❌ FAIL" -ForegroundColor Red
    }
} else {
    Write-Host "❌ FAIL" -ForegroundColor Red
}

# Test de charge
Write-Host "Test de charge..."
$response = Invoke-SafeWebRequest -Uri "$BaseUrl/load-test"
if ($response) {
    $content = $response.Content | ConvertFrom-Json
    Write-Host "Temps d'execution: $($content.duration)" -ForegroundColor Cyan
    Write-Host "✅ OK" -ForegroundColor Green
} else {
    Write-Host "❌ FAIL - L'endpoint /load-test n'est pas disponible" -ForegroundColor Red
}

# Test performance
Write-Host "Test performance..."
$sw = [System.Diagnostics.Stopwatch]::StartNew()
$response = Invoke-SafeWebRequest -Uri $BaseUrl
$sw.Stop()
$responseTime = $sw.ElapsedMilliseconds / 1000
Write-Host "Temps de reponse: ${responseTime}s" -ForegroundColor Cyan
if ($response) {
    Write-Host "✅ OK" -ForegroundColor Green
} else {
    Write-Host "❌ FAIL" -ForegroundColor Red
}

Write-Host "=================================="
Write-Host "Tests termines !" -ForegroundColor Green