# 🛶 ACAL Development Setup Script (Windows PowerShell)
# Configura automáticamente el entorno de desarrollo

Write-Host "🛶 ACAL - Setting up development environment..." -ForegroundColor Cyan
Write-Host ""

# Función para imprimir con colores
function Write-Success {
    param($Message)
    Write-Host "✅ $Message" -ForegroundColor Green
}

function Write-Warning {
    param($Message)
    Write-Host "⚠️  $Message" -ForegroundColor Yellow
}

function Write-Error {
    param($Message)
    Write-Host "❌ $Message" -ForegroundColor Red
}

function Write-Info {
    param($Message)
    Write-Host "ℹ️  $Message" -ForegroundColor Blue
}

# 1. Verificar dependencias
Write-Host "🔍 Checking dependencies..." -ForegroundColor Cyan

# Verificar Node.js
try {
    $nodeVersion = node --version
    Write-Success "Node.js is installed: $nodeVersion"
} catch {
    Write-Error "Node.js not found. Please install Node.js >= 20.18.3"
    exit 1
}

# Verificar Yarn
try {
    $yarnVersion = yarn --version
    Write-Success "Yarn is installed: $yarnVersion"
} catch {
    Write-Error "Yarn not found. Please install Yarn"
    exit 1
}

# 2. Instalar dependencias del proyecto
Write-Host ""
Write-Host "📦 Installing project dependencies..." -ForegroundColor Cyan
yarn install
if ($LASTEXITCODE -eq 0) {
    Write-Success "Project dependencies installed"
} else {
    Write-Error "Failed to install project dependencies"
    exit 1
}

# 3. Configurar servidor Arbitro
Write-Host ""
Write-Host "⚙️  Setting up Arbitro server..." -ForegroundColor Cyan

$arbitroEnvFile = "packages\foundry\arbitro-server\.env"
$arbitroTemplate = "packages\foundry\arbitro-server\config.env.template"

if (!(Test-Path $arbitroEnvFile)) {
    Copy-Item $arbitroTemplate $arbitroEnvFile
    Write-Success "Created Arbitro .env file from template"
    Write-Warning "Please edit $arbitroEnvFile with your ARBITRO_PRIVATE_KEY"
    Write-Info "The private key should be for address: 0x9c77c6fafc1eb0821F1De12972Ef0199C97C6e45"
} else {
    Write-Success "Arbitro .env file already exists"
}

# 4. Instalar dependencias del servidor Arbitro
Write-Host ""
Write-Host "📦 Installing Arbitro server dependencies..." -ForegroundColor Cyan
Push-Location "packages\foundry\arbitro-server"
npm install
if ($LASTEXITCODE -eq 0) {
    Write-Success "Arbitro server dependencies installed"
} else {
    Write-Error "Failed to install Arbitro server dependencies"
    Pop-Location
    exit 1
}
Pop-Location

# 5. Compilar contratos
Write-Host ""
Write-Host "🔨 Compiling smart contracts..." -ForegroundColor Cyan
yarn compile
if ($LASTEXITCODE -eq 0) {
    Write-Success "Smart contracts compiled successfully"
} else {
    Write-Error "Failed to compile smart contracts"
    exit 1
}

# 6. Ejecutar tests para verificar setup
Write-Host ""
Write-Host "🧪 Running contract tests to verify setup..." -ForegroundColor Cyan
yarn foundry:test
if ($LASTEXITCODE -eq 0) {
    Write-Success "Contract tests passed - setup verified"
} else {
    Write-Warning "Some tests failed, but setup is complete"
}

# 7. Información final
Write-Host ""
Write-Host "🎉 Setup complete! Here's what you can do now:" -ForegroundColor Green
Write-Host ""
Write-Info "🚀 Start development servers:"
Write-Host "   yarn dev:full          # Frontend + Arbitro server"
Write-Host "   yarn dev:monad         # Full stack (chain + frontend + arbitro)"
Write-Host ""
Write-Info "🧪 Run tests:"
Write-Host "   yarn test:full         # All tests"
Write-Host "   yarn foundry:test      # Contract tests only"
Write-Host "   yarn arbitro:test      # Arbitro server tests only"
Write-Host ""
Write-Info "🔗 Access points:"
Write-Host "   Frontend:    http://localhost:3000"
Write-Host "   Debug UI:    http://localhost:3000/debug"
Write-Host "   Arbitro API: http://localhost:3001"
Write-Host ""
Write-Warning "⚠️  Remember to configure your ARBITRO_PRIVATE_KEY in:"
Write-Host "   $arbitroEnvFile"
Write-Host ""
Write-Info "📖 For detailed instructions, see: TESTING_GUIDE.md"
Write-Host ""
Write-Host "🛶 ACAL is ready to sail to Monad! ⚡" -ForegroundColor Cyan
