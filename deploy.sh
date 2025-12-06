#!/bin/bash

# Kokorick Deployment Script
# Run this script to deploy to AWS EC2

set -e  # Exit on any error

# Configuration
EC2_HOST="ubuntu@13.134.167.250"
PEM_KEY="/Users/bhaweshbhaskar/Downloads/kokorick.pem"
LOCAL_PATH="/Users/bhaweshbhaskar/Downloads/kokorick/"
REMOTE_PATH="~/kokorick"

echo "🚀 Starting Kokorick Deployment..."
echo ""

# Step 1: Build the frontend
echo "📦 Step 1: Building frontend..."
npm run build
echo "✅ Build complete!"
echo ""

# Step 2: Sync files to server
echo "📤 Step 2: Syncing files to server..."
rsync -avz -e "ssh -i $PEM_KEY -o StrictHostKeyChecking=no" \
    --exclude 'node_modules' \
    --exclude '.git' \
    --exclude 'build' \
    --exclude '.DS_Store' \
    --exclude 'deploy.sh' \
    $LOCAL_PATH $EC2_HOST:$REMOTE_PATH

echo "✅ Files synced!"
echo ""

# Step 3: Deploy on server
echo "🔧 Step 3: Installing dependencies and deploying..."
ssh -i $PEM_KEY -o StrictHostKeyChecking=no $EC2_HOST << 'ENDSSH'
    cd ~/kokorick/server && npm install
    cd ~/kokorick
    sudo cp -r build/* /var/www/kokorick/
    sudo chown -R www-data:www-data /var/www/kokorick
    pm2 restart kokorick-server
    sudo systemctl restart nginx
    echo "✅ Server deployment complete!"
ENDSSH

echo ""
echo "🎉 Deployment successful!"
echo "Your website is now live!"
