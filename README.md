# Proxmox VM Dashboard

A modern web dashboard for monitoring and managing Proxmox Virtual Environment (VE) virtual machines. Built with React (frontend) and Node.js (backend), featuring real-time VM status updates, tag-based filtering, and node management.

![Dashboard Preview](https://img.shields.io/badge/Status-Active-success)
![License](https://img.shields.io/badge/License-MIT-blue)

## Features

- 📊 **Real-time VM Monitoring** - Live status updates every 30 seconds
- 🏷️ **Tag-based Filtering** - Filter VMs by custom tags
- 🖥️ **Node Management** - View and filter by Proxmox nodes
- 🔍 **Advanced Search** - Search by VM name, ID, or node
- 📈 **Resource Metrics** - CPU, memory, disk usage per VM
- 🎨 **Modern UI** - Built with React, Tailwind CSS, and TypeScript
- ⚡ **Fast & Responsive** - TanStack Query for efficient data fetching
- 🌓 **Dark Mode** - Automatic dark/light theme support

## Tech Stack

### Backend
- Node.js 20+
- Express.js
- Axios (Proxmox API client)
- Winston (Logging)
- Helmet (Security)

### Frontend
- React 18
- TypeScript
- Vite
- TanStack Query (data fetching)
- TanStack Table (data tables)
- Tailwind CSS
- Lucide React (icons)

## Prerequisites

- **Proxmox VE** 7.0+ server
- **Node.js** 20+ and npm
- **Proxmox API Token** (or username/password)
- Ubuntu 22.04+ (for this guide)

## Quick Start (Ubuntu)

### 1. Install Node.js

```bash
# Install Node.js 20.x LTS
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# Verify installation
node --version  # Should show v20.x.x
npm --version   # Should show 10.x.x
```

### 2. Clone the Repository

```bash
cd ~
git clone https://github.com/Niima6/proxmox-vm-dashboard.git
cd proxmox-vm-dashboard
```

### 3. Configure Backend

#### Create Proxmox API Token

1. Log into your Proxmox web interface
2. Navigate to **Datacenter → Permissions → API Tokens**
3. Click **Add**
4. User: `root@pam` (or your user)
5. Token ID: `dashboard`
6. **Uncheck** "Privilege Separation"
7. Click **Add**
8. **Copy the token secret** (shown only once)

#### Configure Backend Environment

```bash
cd backend
cp .env.example .env
nano .env
```

Update the `.env` file:

```bash
# Proxmox API Configuration
PROXMOX_HOST=192.168.1.100  # Your Proxmox IP/hostname
PROXMOX_PORT=8006
PROXMOX_API_TOKEN_ID=root@pam!dashboard
PROXMOX_API_TOKEN_SECRET=xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx

# Server Configuration
PORT=3001
NODE_ENV=development

# Security
CORS_ORIGIN=http://localhost:3000

# SSL Certificate Verification (false for self-signed certs)
REJECT_UNAUTHORIZED=false
```

Save and exit (Ctrl+X, Y, Enter)

#### Install Backend Dependencies

```bash
npm install
```

#### Create Logs Directory

```bash
mkdir -p logs
```

### 4. Configure Frontend

```bash
cd ../frontend
npm install
```

### 5. Start the Application

#### Terminal 1: Start Backend

```bash
cd ~/proxmox-vm-dashboard/backend
npm run dev
```

You should see:
```
🚀 Server running on port 3001
📡 Proxmox host: 192.168.1.100
🌍 Environment: development
```

#### Terminal 2: Start Frontend

```bash
cd ~/proxmox-vm-dashboard/frontend
npm run dev
```

You should see:
```
  VITE v5.x.x  ready in xxx ms

  ➜  Local:   http://localhost:3000/
  ➜  Network: use --host to expose
```

### 6. Access the Dashboard

Open your browser and navigate to:
```
http://localhost:3000
```

You should see the dashboard with your VMs!

## Production Deployment (Ubuntu)

### 1. Install PM2 Process Manager

```bash
sudo npm install -g pm2
```

### 2. Build Frontend

```bash
cd ~/proxmox-vm-dashboard/frontend
npm run build
```

### 3. Serve Frontend with Nginx

```bash
sudo apt update
sudo apt install nginx -y
```

Create Nginx configuration:

```bash
sudo nano /etc/nginx/sites-available/proxmox-dashboard
```

Add:

```nginx
server {
    listen 80;
    server_name your-domain.com;  # or your server IP

    # Frontend
    root /home/your-user/proxmox-vm-dashboard/frontend/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    # Backend API
    location /api {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Enable the site:

```bash
sudo ln -s /etc/nginx/sites-available/proxmox-dashboard /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### 4. Start Backend with PM2

```bash
cd ~/proxmox-vm-dashboard/backend
cp .env.example .env
# Edit .env with production values
NODE_ENV=production npm install --production
pm2 start src/app.js --name proxmox-backend
pm2 save
pm2 startup
```

### 5. Configure Firewall

```bash
sudo ufw allow 'Nginx Full'
sudo ufw enable
```

## Usage

### Filter VMs

- **By Node**: Select a node from the dropdown
- **By Status**: Filter running/stopped/paused VMs
- **By Tags**: Click tags to filter (multi-select)
- **Search**: Type VM name, ID, or node name

### Refresh Data

Click the **Refresh** button in the top-right corner to manually update VM data.

### View VM Details

Click on any VM row to see detailed information (coming soon).

## API Endpoints

### Backend API

- `GET /api/vms` - List all VMs
  - Query params: `node`, `tags`, `status`
- `GET /api/vms/:node/:vmid` - Get VM details
- `GET /api/nodes` - List cluster nodes
- `GET /api/tags` - List all unique tags
- `GET /health` - Health check

## Troubleshooting

### Backend won't start

1. Check `.env` configuration
2. Verify Proxmox host is reachable:
   ```bash
   ping your-proxmox-host
   curl -k https://your-proxmox-host:8006
   ```
3. Check logs:
   ```bash
   tail -f backend/logs/combined.log
   ```

### Frontend shows "Network Error"

1. Ensure backend is running on port 3001
2. Check browser console for errors
3. Verify CORS settings in backend `.env`

### No VMs showing

1. Check Proxmox API token permissions
2. Verify token in `.env` matches Proxmox
3. Check backend logs for API errors

### Self-signed Certificate Errors

Set `REJECT_UNAUTHORIZED=false` in backend `.env`

## Development

### Backend Development

```bash
cd backend
npm run dev  # Auto-restart on file changes
```

### Frontend Development

```bash
cd frontend
npm run dev  # Hot module replacement
```

### Linting

```bash
cd frontend
npm run lint
```

## Project Structure

```
proxmox-vm-dashboard/
├── backend/
│   ├── src/
│   │   ├── routes/          # API routes
│   │   ├── services/        # Proxmox API client
│   │   ├── middleware/      # Express middleware
│   │   ├── utils/           # Logger, helpers
│   │   └── app.js           # Main server
│   ├── logs/                # Log files
│   ├── .env                 # Environment config
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/      # React components
│   │   ├── hooks/           # Custom hooks
│   │   ├── api/             # API client
│   │   ├── types/           # TypeScript types
│   │   └── utils/           # Formatters
│   ├── index.html
│   └── package.json
└── README.md
```

## Contributing

Contributions are welcome! Please:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

MIT License - see LICENSE file for details

## Acknowledgments

- [Proxmox VE](https://www.proxmox.com/) - Virtualization platform
- [TanStack](https://tanstack.com/) - React Query and Table libraries
- [Tailwind CSS](https://tailwindcss.com/) - CSS framework
- [Lucide](https://lucide.dev/) - Icon library

## Support

For issues and questions:
- Open an [issue](https://github.com/Niima6/proxmox-vm-dashboard/issues)
- Check existing issues for solutions

---

**Built with ❤️ for the Proxmox community**