# Deployment Guide for Kokorick (EC2 + Nginx + PM2)

This guide walks you through deploying the full-stack application (React Frontend + Node.js Backend) to an AWS EC2 instance running Ubuntu.

## Prerequisites
- AWS Account
- A domain name (e.g., `example.com`) pointing to your EC2 instance's Public IP (A Record).

---

## Step 1: Launch EC2 Instance
1.  **OS**: Ubuntu Server 22.04 LTS (HVM).
2.  **Instance Type**: `t2.micro` (Free Tier) or `t3.small` (Recommended for better performance).
3.  **Security Group**: Allow Inbound traffic for:
    -   **SSH** (Port 22) - My IP
    -   **HTTP** (Port 80) - Anywhere (0.0.0.0/0)
    -   **HTTPS** (Port 443) - Anywhere (0.0.0.0/0)

## Step 2: Connect to Your Instance
Open your terminal and SSH into the server:
```bash
ssh -i /path/to/your-key.pem ubuntu@your-ec2-public-ip
```

## Step 3: Install Dependencies
Update the system and install Node.js (v20), Nginx, and Git.

```bash
# Update packages
sudo apt update && sudo apt upgrade -y

# Install Node.js 20.x
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Install Nginx
sudo apt install -y nginx

# Install PM2 (Process Manager for Node.js) globally
sudo npm install -g pm2
```

## Step 4: Deploy Your Code
You can either clone your repository or upload your project files.

### Option A: Clone from GitHub (Recommended)
```bash
git clone https://github.com/yourusername/kokorick.git
cd kokorick
```

### Option B: Upload Files (SCP)
If your code is local, zip it and upload:
```bash
# On your local machine
scp -i /path/to/key.pem -r /path/to/kokorick ubuntu@your-ec2-ip:~/kokorick
```

## Step 5: Install & Build
Navigate to the project directory on the server:

```bash
cd ~/kokorick

# Install dependencies (Root)
npm install

# Build the Frontend
# This creates a 'build' folder with static files
npm run build
```

## Step 6: Configure Backend
1.  **Create .env file**:
    ```bash
    nano .env
    ```
    Paste your environment variables. Since you are using DynamoDB, you need your AWS credentials:
    ```env
    PORT=5000
    AWS_REGION=us-east-1
    AWS_ACCESS_KEY_ID=your_access_key
    AWS_SECRET_ACCESS_KEY=your_secret_key
    # Add any other variables from your local .env
    ```
    Save and exit (`Ctrl+X`, `Y`, `Enter`).

2.  **Start Backend with PM2**:
    ```bash
    pm2 start ecosystem.config.js
    pm2 save
    pm2 startup
    # Run the command output by 'pm2 startup' to enable auto-restart on boot
    ```

## Step 7: Configure Nginx
Nginx will serve the frontend static files and proxy API requests to the backend.

1.  **Create Nginx Config**:
    ```bash
    sudo nano /etc/nginx/sites-available/kokorick
    ```

2.  **Paste Configuration**:
    Replace `yourdomain.com` with your actual domain (or Public IP if testing).

    ```nginx
    server {
        listen 80;
        server_name yourdomain.com www.yourdomain.com;

        root /home/ubuntu/kokorick/build;
        index index.html;

        # Serve Frontend (React Router support)
        location / {
            try_files $uri $uri/ /index.html;
        }

        # Proxy API Requests to Backend
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
    sudo ln -s /etc/nginx/sites-available/kokorick /etc/nginx/sites-enabled/
    sudo rm /etc/nginx/sites-enabled/default  # Remove default config
    sudo nginx -t                             # Test configuration
    sudo systemctl restart nginx              # Restart Nginx
    ```

## Step 8: Setup SSL (HTTPS)
Secure your site with a free Let's Encrypt certificate.

```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
```
Follow the prompts (enter email, agree to terms). Certbot will automatically update your Nginx config for HTTPS.

---

## Troubleshooting
- **Check Backend Logs**: `pm2 logs`
- **Check Nginx Logs**: `sudo tail -f /var/log/nginx/error.log`
- **Restart Backend**: `pm2 restart all`
- **Restart Nginx**: `sudo systemctl restart nginx`
