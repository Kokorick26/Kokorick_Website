# Ultimate Deployment Guide for Kokorick on AWS EC2

This guide will take you from a fresh EC2 instance to a fully running production application with SSL (HTTPS).

## 1. Infrastructure Setup (AWS Console)

1.  **Launch Instance**:
    *   **OS**: Ubuntu Server 22.04 LTS (HVM), SSD Volume Type.
    *   **Instance Type**: `t3.small` (Recommended) or `t2.micro` (Free tier, but might be slow for builds).
    *   **Key Pair**: Create a new one or use an existing `.pem` file. Download it and keep it safe.

2.  **Security Group (Firewall)**:
    *   Create a new security group allowing:
        *   **SSH (22)**: My IP (for security).
        *   **HTTP (80)**: Anywhere (0.0.0.0/0).
        *   **HTTPS (443)**: Anywhere (0.0.0.0/0).

3.  **DynamoDB Setup**:
    *   Ensure you have a table named `ContactRequests` in your target region (e.g., `us-east-1`).
    *   Partition Key: `id` (String).
    *   Ensure you have a table named `AdminUsers` (check `server/seed-admin.js` for schema if needed).

## 2. Server Configuration (Terminal)

Open your terminal and SSH into your instance:
```bash
# Replace key.pem and IP with your actual values
chmod 400 key.pem
ssh -i key.pem ubuntu@YOUR_EC2_PUBLIC_IP
```

### Install System Dependencies
Run these commands one by one:

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js 20 (LTS)
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Install Nginx (Web Server)
sudo apt install -y nginx

# Install PM2 (Process Manager)
sudo npm install -g pm2

# Verify installations
node -v
npm -v
nginx -v
```

## 3. Project Setup

### Clone the Repository
```bash
# Option 1: Git Clone (if your repo is public or you have SSH keys setup)
git clone https://github.com/YOUR_USERNAME/kokorick.git
cd kokorick

# Option 2: Upload manually (if code is local)
# (Run this from your LOCAL machine, not the server)
# scp -i key.pem -r ./kokorick ubuntu@YOUR_EC2_IP:~/kokorick
```

### Install & Build
```bash
cd ~/kokorick

# Install all dependencies
npm install

# Build the React Frontend
# This creates the 'build' folder
npm run build
```

## 4. Backend Configuration

### Environment Variables
Create the production `.env` file:
```bash
nano .env
```
Paste your production configuration (Right-click to paste):
```env
PORT=5000
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=YOUR_AWS_ACCESS_KEY
AWS_SECRET_ACCESS_KEY=YOUR_AWS_SECRET_KEY
JWT_SECRET=YOUR_SECURE_RANDOM_STRING
```
*Press `Ctrl+X`, then `Y`, then `Enter` to save.*

### Start the Server
We use PM2 to keep the server running in the background.

```bash
# Start the server using the ecosystem config
pm2 start ecosystem.config.js

# Save the process list so it restarts on reboot
pm2 save

# Generate startup script
pm2 startup
# (Copy and run the command displayed by the previous output)
```

## 5. Nginx Configuration (Reverse Proxy)

This connects the outside world to your app.

1.  **Create Config File**:
    ```bash
    sudo nano /etc/nginx/sites-available/kokorick
    ```

2.  **Paste Configuration**:
    *Replace `yourdomain.com` with your actual domain or Public IP.*

    ```nginx
    server {
        listen 80;
        server_name yourdomain.com www.yourdomain.com;

        # Serve React Frontend
        root /home/ubuntu/kokorick/build;
        index index.html;

        location / {
            try_files $uri $uri/ /index.html;
        }

        # Proxy API requests to Node.js Backend
        location /api {
            proxy_pass http://localhost:5000;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection 'upgrade';
            proxy_set_header Host $host;
            proxy_cache_bypass $http_upgrade;
        }
    }
    ```

3.  **Enable Site**:
    ```bash
    # Link the config
    sudo ln -s /etc/nginx/sites-available/kokorick /etc/nginx/sites-enabled/

    # Remove default Nginx page
    sudo rm /etc/nginx/sites-enabled/default

    # Test config for errors
    sudo nginx -t

    # Restart Nginx
    sudo systemctl restart nginx
    ```

## 6. SSL Setup (HTTPS) - Optional but Recommended

If you have a domain name pointing to this IP, secure it for free:

```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
```
Follow the prompts. Certbot will handle the rest!

---

## Troubleshooting

*   **App not loading?** Check Security Groups (Port 80/443 open?).
*   **502 Bad Gateway?** Check if Node server is running: `pm2 status`.
*   **API Errors?** Check logs: `pm2 logs`.
*   **Permission Denied?** Ensure you are using `sudo` for Nginx commands.
