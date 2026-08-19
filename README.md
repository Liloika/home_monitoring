# 🏠 Home Infrastructure

Self-hosted home lab running on a local server. All services are accessible via local domains over HTTPS with a custom PKI.

---

## 🗺️ Architecture

```
Internet
    │
    ▼
[Ubuntu Server <your-local-ip>]
    ├── Bind9        — local DNS (.home.lan zone)
    ├── Nginx        — reverse proxy + SSL termination
    ├── PKI          — self-signed CA + certificates
    └── Docker       — all services in containers
```

---

## 🚀 Services

| Service | Domain | Description |
|---------|--------|-------------|
| **Grafana** | `grafana.home.lan` | Metrics dashboards — CPU, memory, disk |
| **Prometheus** | — | Metrics scraper (node-exporter) |
| **Keycloak** | `keycloak.home.lan` | SSO / Identity provider (OIDC) |
| **Gitea** | `gitea.home.lan` | Self-hosted Git server |
| **TheLounge** | `thelounge.home.lan` | IRC web client |
| **Shop** | `shop.home.lan` | Web app with JWT auth + PostgreSQL |
| **i2pd** | — | I2P anonymous network node |

---

## 🔐 Security

- All services behind **HTTPS** with certificates from a local CA
- Local CA root certificate installed on all devices
- Grafana `/metrics` protected by **Basic Auth**
- Grafana auth via **Keycloak SSO** (OIDC / OAuth2)
- Shop auth via **JWT** stored in `httpOnly` cookies (not accessible by JS)
- Separate `access_token` (30 min) and `refresh_token` (7 days)

---

## 🌐 DNS

Local DNS server (Bind9) resolves `.home.lan` zone:

```
*.home.lan  →  <your-local-ip>
```

All devices use `<your-local-ip>` as their DNS server.

---

## 📦 Stack

- **OS**: Ubuntu 24.04
- **Containers**: Docker + Docker Compose
- **Reverse proxy**: Nginx
- **DNS**: Bind9
- **PKI**: OpenSSL (custom root CA)
- **Monitoring**: Prometheus + Node Exporter + Grafana
- **Auth**: Keycloak (SSO), JWT (httpOnly cookies)
- **Backend**: FastAPI (Python 3.12)
- **Database**: PostgreSQL 16
- **Frontend**: React 18
- **VCS**: Gitea (self-hosted)
- **Anonymous network**: i2pd (I2P)

---

## 🗂️ Repository Structure

```
services/
├── bind9/          — DNS server config + zones
├── grafana/        — Grafana + Prometheus + Node Exporter
├── gitea/          — Gitea + PostgreSQL
├── keycloak/       — Keycloak + PostgreSQL
├── nginx/          — Nginx reverse proxy config
├── pki/            — PKI scripts + certificates
├── shop/           — Web application
│   ├── backend/    — FastAPI
│   └── frontend/   — React
├── thelounge/      — IRC client
└── i2p/            — I2P node + tunnels
```

---

## ⚡ Quick Start

```bash
# Clone
git clone https://github.com/Liloika/home_monitoring
cd home_monitoring/services

# Copy and fill env files
for dir in */; do
  [ -f "$dir/example.env" ] && cp "$dir/example.env" "$dir/.env"
done

# Run deploy script
bash deploy.sh
```

---

## 📋 Requirements

- Docker 24+
- Docker Compose v2
- Ubuntu 22.04 / 24.04
- Static local IP
