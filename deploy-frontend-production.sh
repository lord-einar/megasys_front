#!/bin/bash
# Script para deployar frontend a PRODUCCIÓN
# Uso: ./deploy-frontend-production.sh

echo "==========================================="
echo "  DEPLOYMENT A PRODUCCIÓN - FRONTEND"
echo "==========================================="
echo ""

STORAGE_ACCOUNT="megasyssa62438"
CONTAINER='$web'

echo "⚠️  ADVERTENCIA: Estás por deployar a PRODUCCIÓN"
echo "Presiona CTRL+C para cancelar o ENTER para continuar..."
read

echo "🔨 Construyendo proyecto..."
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
echo "🔗 URL: https://megasyssa62438.z22.web.core.windows.net"
echo ""
echo "💡 Abre la URL en tu navegador para verificar"
