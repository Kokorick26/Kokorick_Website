---
description: How to deploy the application using GitHub Actions to AWS EC2
---

# Deployment Workflow

This document explains how to deploy the Kokorick website using GitHub Actions.

## Prerequisites

1. GitHub repository: https://github.com/Kokorick26/Kokorick_Website.git
2. AWS EC2 instance running
3. Domain name configured

## Step 1: Add GitHub Secrets

Go to your GitHub repository → Settings → Secrets and variables → Actions → New repository secret

Add these secrets:

| Secret Name | Value |
|-------------|-------|
| `EC2_SSH_KEY` | Contents of your kokorick.pem file (the entire private key) |
| `EC2_HOST` | `13.134.167.250` (your EC2 IP address) |

### How to get the SSH key content:
```bash
cat /Users/bhaweshbhaskar/Downloads/kokorick.pem
```
Copy the entire output including `-----BEGIN RSA PRIVATE KEY-----` and `-----END RSA PRIVATE KEY-----`

## Step 2: Push Changes to GitHub

```bash
# Add all changes
git add .

# Commit
git commit -m "Add GitHub Actions deployment workflow"

# Push to main branch
git push origin main
```

## Step 3: Monitor Deployment

1. Go to https://github.com/Kokorick26/Kokorick_Website/actions
2. Watch the workflow run
3. If successful, your site is deployed!

## Manual Deployment Trigger

You can also trigger deployment manually:
1. Go to Actions tab in GitHub
2. Select "Deploy to AWS EC2" workflow
3. Click "Run workflow"

## Connecting Domain

### Step 1: Get your domain's DNS settings

Go to your domain registrar (GoDaddy, Namecheap, Route53, etc.)

### Step 2: Add DNS Records

Add these records:

| Type | Name | Value |
|------|------|-------|
| A | @ | 13.134.167.250 |
| A | www | 13.134.167.250 |

### Step 3: Update nginx configuration on EC2

SSH into your server and update nginx:

```bash
ssh -i /Users/bhaweshbhaskar/Downloads/kokorick.pem ubuntu@13.134.167.250

# Edit nginx config
sudo nano /etc/nginx/sites-available/kokorick

# Update server_name to include your domain:
# server_name yourdomain.com www.yourdomain.com;

# Test nginx config
sudo nginx -t

# Reload nginx
sudo systemctl reload nginx
```

### Step 4: Enable HTTPS with Let's Encrypt

```bash
# Install certbot
sudo apt update
sudo apt install certbot python3-certbot-nginx

# Get SSL certificate
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com

# Auto-renewal is set up automatically
```

## Troubleshooting

### Deployment fails at SSH step
- Check EC2 security group allows SSH (port 22)
- Verify the SSH key secret is correct

### Website not loading after deployment
- Check nginx logs: `sudo tail -f /var/log/nginx/error.log`
- Check pm2 logs: `pm2 logs kokorick-server`

### Domain not resolving
- DNS changes can take up to 48 hours to propagate
- Check DNS with: `dig yourdomain.com`
