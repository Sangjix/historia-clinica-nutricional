#!/bin/bash
# ==============================================================================
# SCRIPT DE INSTALACIÓN Y PUESTA EN MARCHA AUTOMÁTICA EN GOOGLE CLOUD (UBUNTU)
# NutriClinic - Sistema de Historia Clínica Nutricional Profesional
# ==============================================================================

set -e

echo "=========================================="
echo "🚀 INICIANDO CONFIGURACIÓN EN GOOGLE CLOUD"
echo "=========================================="

# 1. Actualizar repositorios del sistema
sudo apt update && sudo apt upgrade -y

# 2. Configurar 2GB de memoria Swap (vital para máquinas de 1GB RAM)
if [ ! -f /swapfile ]; then
    echo "⚙️ Configurando 2GB de memoria Swap..."
    sudo fallocate -l 2G /swapfile
    sudo chmod 600 /swapfile
    sudo mkswap /swapfile
    sudo swapon /swapfile
    echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
    echo "✓ Memoria Swap activada."
fi

# 3. Instalar Node.js 20 LTS, npm y Git
if ! command -v node &> /dev/null; then
    echo "📦 Instalando Node.js 20 LTS..."
    curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
    sudo apt install -y nodejs git nginx
    echo "✓ Node.js $(node -v) y npm $(npm -v) instalados."
fi

# 4. Instalar PM2 globalmente
if ! command -v pm2 &> /dev/null; then
    echo "📦 Instalando PM2..."
    sudo npm install -g pm2
fi

# 5. Instalar dependencias del proyecto y compilar
echo "📦 Instalando dependencias de la aplicación..."
npm install

echo "🗄️ Generando cliente Prisma y sincronizando base de datos local..."
npx prisma generate
npx prisma db push

echo "🏗️ Compilando la aplicación Next.js para producción..."
npm run build

# 6. Configurar Nginx como Proxy Inverso (Puerto 80 -> Puerto 3000)
echo "🌐 Configurando Nginx en puerto 80..."
sudo tee /etc/nginx/sites-available/nutriclinic > /dev/null <<EOF
server {
    listen 80;
    server_name _;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_cache_bypass \$http_upgrade;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }
}
EOF

sudo ln -sf /etc/nginx/sites-available/nutriclinic /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t
sudo systemctl restart nginx
sudo systemctl enable nginx

# 7. Iniciar la aplicación con PM2 y configurar reinicio automático
echo "🚀 Iniciando NutriClinic con PM2..."
pm2 start ecosystem.config.js
pm2 save
sudo env PATH=$PATH:/usr/bin /usr/lib/node_modules/pm2/bin/pm2 startup systemd -u $USER --hp $HOME || true

echo "=========================================="
echo "🎉 ¡NUTRICLINIC ESTÁ EN LÍNEA EN GOOGLE CLOUD!"
echo "Puedes acceder mediante la IP Externa de tu máquina en tu navegador."
echo "=========================================="
