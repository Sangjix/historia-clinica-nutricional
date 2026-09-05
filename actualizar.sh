#!/bin/bash
# ==============================================================================
# SCRIPT DE ACTUALIZACIÓN DE 1 COMANDO PARA NUTRICLINIC EN GOOGLE CLOUD
# ==============================================================================

set -e

echo "🔄 Descargando últimas mejoras de GitHub..."
git pull

echo "📦 Verificando dependencias..."
npm install

echo "🗄️ Actualizando esquema de base de datos..."
npx prisma generate
npx prisma db push

echo "🏗️ Compilando nueva versión de Next.js..."
npm run build

echo "♻️ Reiniciando servidor en PM2 (Zero Downtime)..."
pm2 reload nutriclinic

echo "=========================================="
echo "✅ ¡ACTUALIZACIÓN COMPLETADA CON ÉXITO!"
echo "Los cambios ya están activos en tu servidor de Google Cloud."
echo "=========================================="
