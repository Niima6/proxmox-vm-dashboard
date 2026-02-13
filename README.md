# Proxmox VM Dashboard

A web dashboard for monitoring Proxmox VE virtual machines. Real-time status, resource metrics, tag-based filtering, and dark mode.

**Backend:** Node.js, Express, Axios, Winston | **Frontend:** React 18, TypeScript, Vite, TanStack Query/Table, Tailwind CSS

## Prerequisites

- Proxmox VE 7.0+ with an API token
- Node.js 20+ (dev) or Docker (prod)

### Create a Proxmox API Token

1. Proxmox web UI > **Datacenter > Permissions > API Tokens > Add**
2. User: `root@pam`, Token ID: `dashboard`, uncheck "Privilege Separation"
3. Copy the token secret (shown only once)

## Quickstart Dev

```bash
# Clone
git clone https://github.com/Niima6/proxmox-vm-dashboard.git
cd proxmox-vm-dashboard

# Backend
cd backend
cp .env.example .env   # edit with your Proxmox credentials
npm install
mkdir -p logs
npm run dev            # http://localhost:3001

# Frontend (new terminal)
cd frontend
npm install
npm run dev            # http://localhost:3000
```

### Backend `.env`

```bash
PROXMOX_HOST=192.168.1.100
PROXMOX_PORT=8006
PROXMOX_API_TOKEN_ID=root@pam!dashboard
PROXMOX_API_TOKEN_SECRET=xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
PORT=3001
NODE_ENV=development
CORS_ORIGIN=http://localhost:3000
REJECT_UNAUTHORIZED=false   # set false for self-signed certs
```

## Quickstart Prod (Docker)

```bash
git clone https://github.com/Niima6/proxmox-vm-dashboard.git
cd proxmox-vm-dashboard

# Create root .env
cat <<EOF > .env
PROXMOX_HOST=192.168.1.100
PROXMOX_PORT=8006
PROXMOX_API_TOKEN_ID=root@pam!dashboard
PROXMOX_API_TOKEN_SECRET=xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
REJECT_UNAUTHORIZED=false
EOF

docker compose up -d   # http://localhost:3000
```

## API

| Endpoint | Description |
|---|---|
| `GET /api/vms` | List VMs (query: `node`, `tags`, `status`) |
| `GET /api/vms/:node/:vmid` | VM details (query: `type`) |
| `GET /api/nodes` | List cluster nodes |
| `GET /api/tags` | List unique tags |
| `GET /health` | Health check |

## Project Structure

```
backend/
  src/
    app.js              # Express server
    routes/             # API routes (vms, nodes, tags)
    services/proxmox.js # Proxmox API client
    middleware/          # Error handler
    utils/              # Logger
frontend/
  src/
    App.tsx             # React entry with QueryClient
    components/         # Dashboard, VMTable, Filters, Stats
    hooks/              # useVMs, useNodes, useTags
    api/client.ts       # Axios client
    types/              # TypeScript interfaces
docker-compose.yml      # Production deployment
```

## License

MIT
