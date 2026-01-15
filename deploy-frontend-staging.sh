#!/bin/bash
# Script para deployar frontend a STAGING
# Uso: ./deploy-frontend-staging.sh

echo "==========================================="
echo "  DEPLOYMENT A STAGING - FRONTEND"
echo "==========================================="
echo ""

STORAGE_ACCOUNT="megasyssastaging"
CONTAINER='$web'

echo "🔨 Construyendo proyecto para STAGING..."
# Usar .env.staging para apuntar al backend de staging
cp .env.staging .env
npm run build

if [ ! -d "dist" ]; then
    echo "❌ Error: carpeta dist no existe. Build falló."
    exit 1
fi

echo "📤 Subiendo archivos a Azure Storage..."
az storage blob upload-batch \
  --account-name "$STORAGE_ACCOUNT" \
  --source ./dist \
  --destination "$CONTAINER" \
  --overwrite

echo ""
echo "✅ Deployment completado!"
echo "🔗 URL: https://megasyssastaging.z22.web.core.windows.net"
echo ""
echo "💡 Abre la URL en tu navegador para verificar"
