#!/bin/bash

# 🛶 ACAL Development Setup Script
# Configura automáticamente el entorno de desarrollo

echo "🛶 ACAL - Setting up development environment..."
echo ""

# Colores para output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Función para imprimir con color
print_status() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

# 1. Verificar dependencias
echo "🔍 Checking dependencies..."

if ! command -v node &> /dev/null; then
    print_error "Node.js not found. Please install Node.js >= 20.18.3"
    exit 1
fi

if ! command -v yarn &> /dev/null; then
    print_error "Yarn not found. Please install Yarn"
    exit 1
fi

print_status "Node.js and Yarn are installed"

# 2. Instalar dependencias del proyecto
echo ""
echo "📦 Installing project dependencies..."
yarn install
if [ $? -eq 0 ]; then
    print_status "Project dependencies installed"
else
    print_error "Failed to install project dependencies"
    exit 1
fi

# 3. Configurar servidor Arbitro
echo ""
echo "⚙️  Setting up Arbitro server..."

ARBITRO_ENV_FILE="packages/foundry/arbitro-server/.env"
ARBITRO_TEMPLATE="packages/foundry/arbitro-server/config.env.template"

if [ ! -f "$ARBITRO_ENV_FILE" ]; then
    cp "$ARBITRO_TEMPLATE" "$ARBITRO_ENV_FILE"
    print_status "Created Arbitro .env file from template"
    print_warning "Please edit $ARBITRO_ENV_FILE with your ARBITRO_PRIVATE_KEY"
    print_info "The private key should be for address: 0x9c77c6fafc1eb0821F1De12972Ef0199C97C6e45"
else
    print_status "Arbitro .env file already exists"
fi

# 4. Instalar dependencias del servidor Arbitro
echo ""
echo "📦 Installing Arbitro server dependencies..."
cd packages/foundry/arbitro-server
npm install
if [ $? -eq 0 ]; then
    print_status "Arbitro server dependencies installed"
else
    print_error "Failed to install Arbitro server dependencies"
    exit 1
fi
cd - > /dev/null

# 5. Compilar contratos
echo ""
echo "🔨 Compiling smart contracts..."
yarn compile
if [ $? -eq 0 ]; then
    print_status "Smart contracts compiled successfully"
else
    print_error "Failed to compile smart contracts"
    exit 1
fi

# 6. Ejecutar tests para verificar setup
echo ""
echo "🧪 Running contract tests to verify setup..."
yarn foundry:test
if [ $? -eq 0 ]; then
    print_status "Contract tests passed - setup verified"
else
    print_warning "Some tests failed, but setup is complete"
fi

# 7. Información final
echo ""
echo "🎉 Setup complete! Here's what you can do now:"
echo ""
print_info "🚀 Start development servers:"
echo "   yarn dev:full          # Frontend + Arbitro server"
echo "   yarn dev:monad         # Full stack (chain + frontend + arbitro)"
echo ""
print_info "🧪 Run tests:"
echo "   yarn test:full         # All tests"
echo "   yarn foundry:test      # Contract tests only"
echo "   yarn arbitro:test      # Arbitro server tests only"
echo ""
print_info "🔗 Access points:"
echo "   Frontend:    http://localhost:3000"
echo "   Debug UI:    http://localhost:3000/debug"
echo "   Arbitro API: http://localhost:3001"
echo ""
print_warning "⚠️  Remember to configure your ARBITRO_PRIVATE_KEY in:"
echo "   $ARBITRO_ENV_FILE"
echo ""
print_info "📖 For detailed instructions, see: TESTING_GUIDE.md"
echo ""
echo "🛶 ACAL is ready to sail to Monad! ⚡"
