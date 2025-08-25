#!/bin/bash
# Fonstr VPS Quick Deploy Script

echo "🚀 Fonstr Relay Deployment for VPS"
echo "=================================="

# Update system
echo "📦 Updating system packages..."
apt update && apt upgrade -y

# Install Node.js (v20 LTS)
echo "📦 Installing Node.js..."
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt install -y nodejs

# Install PM2 for process management
echo "📦 Installing PM2..."
npm install -g pm2

# Install fonstr
echo "📦 Installing fonstr..."
npm install -g fonstr

# Setup PM2 to run fonstr
echo "⚙️ Configuring PM2..."
cat > ecosystem.config.js << 'EOF'
module.exports = {
  apps: [{
    name: 'fonstr',
    script: 'fonstr',
    args: '--port 4444',
    env: {
      MAX_EVENTS: 5000  // More capacity on VPS
    },
    restart_delay: 5000,
    max_restarts: 10
  }]
}
EOF

# Start fonstr with PM2
pm2 start ecosystem.config.js
pm2 save
pm2 startup systemd -u $USER --hp $HOME

# Setup firewall
echo "🔒 Configuring firewall..."
ufw allow 4444/tcp
ufw allow 22/tcp
ufw --force enable

# Setup nginx for WebSocket proxy (optional)
read -p "Install nginx for domain support? (y/n): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
  apt install -y nginx certbot python3-certbot-nginx
  
  cat > /etc/nginx/sites-available/fonstr << 'NGINX'
server {
    listen 80;
    server_name your-domain.com;
    
    location / {
        proxy_pass http://localhost:4444;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_read_timeout 86400;
    }
}
NGINX
  
  ln -s /etc/nginx/sites-available/fonstr /etc/nginx/sites-enabled/
  nginx -t && systemctl reload nginx
  echo "📝 Remember to update 'your-domain.com' in /etc/nginx/sites-available/fonstr"
  echo "📝 Then run: certbot --nginx -d your-domain.com"
fi

# Display status
echo ""
echo "✅ Deployment complete!"
echo "=================================="
pm2 status
echo ""
echo "📱 Access your relay at:"
echo "   ws://$(curl -s ifconfig.me):4444"
echo ""
echo "📊 Useful commands:"
echo "   pm2 logs fonstr    - View logs"
echo "   pm2 restart fonstr - Restart relay"
echo "   pm2 monit          - Monitor resources"