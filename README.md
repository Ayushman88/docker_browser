# Remote Ephemeral Browser

A secure, disposable browser session that runs inside an isolated Docker container. Each session gets a fresh Chrome instance with a unique fingerprint, resource limits, and automatic cleanup when the session ends.

Phase 2 adds email OTP authentication, JWT-protected APIs, observability endpoints, and Docker Compose-based multi-container deployment.

## Prerequisites

- **Docker** installed and running
- **Node.js** 18+
- Selenium Chrome image: `docker pull selenium/standalone-chrome:latest`

## Quick Start

### 1. Pull the browser image (one-time)

We use `nkpro/chrome-novnc` so the remote Chrome is visible in your browser (the Selenium image has a known noVNC display bug in recent Chrome versions).

```bash
docker pull nkpro/chrome-novnc:latest
```

**Apple Silicon (M1/M2/M3):** If the image has no arm64 build, use:

```bash
docker pull --platform linux/amd64 nkpro/chrome-novnc:latest
```

### 2. Start the backend

```bash
cd backend
npm install
npm run dev
```

The API runs at `http://localhost:3001`.

> Add required auth env vars in `backend/.env`: `APP_MAIL`, `APP_PASSWORD`, `JWT_SECRET`.

### 3. Start the frontend

```bash
cd frontend
npm install
npm run dev
```

The app runs at `http://localhost:5173`.

### 4. Use the app

1. Open `http://localhost:5173` (landing page → **Sign in** or **Get started**)
2. Enter your email and request OTP
3. Verify OTP and sign in (JWT issued by backend)
4. Open the **Console** (`/dashboard`), then **New browser session**
5. A new tab opens with the remote Chrome streamed via noVNC; active containers appear in the session table
6. If prompted for VNC password, use **passwd** (default for this image)
7. Click **End Session** when done (container is removed automatically)

## Docker Compose (Multi-container)

Run full stack with networking + persistent backend volume:

```bash
docker compose up --build
```

- Frontend: `http://localhost:8080`
- Backend: `http://localhost:3001`
- Health: `http://localhost:3001/health`
- Metrics: `http://localhost:3001/metrics`

## Project Structure

```
rebrowser/
├── backend/           # Node.js API (Express + Docker SDK)
│   ├── src/
│   │   ├── index.js   # API routes
│   │   ├── docker.js  # Container lifecycle
│   │   └── sessionStore.js
│   └── .env.example
├── frontend/          # React + Vite
│   └── src/
│       └── App.jsx
└── README.md
```

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/auth/send-otp` | Send OTP to user email |
| POST | `/api/auth/verify-otp` | Verify OTP and return JWT |
| GET | `/api/auth/me` | Validate JWT and return user |
| POST | `/api/session` | Create a new browser session |
| GET | `/api/sessions` | List your active sessions (container IDs, ports, image) |
| GET | `/api/session/:id` | Get session status |
| DELETE | `/api/session/:id` | End session and remove container |
| GET | `/health` | Health check endpoint |
| GET | `/metrics` | Basic runtime metrics |

## Environment Variables

### Backend

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | 3001 | API server port |
| `VNC_HOST` | localhost | Host for noVNC URLs (use your server hostname when deploying) |
| `APP_MAIL` | - | Gmail address used for OTP sender |
| `APP_PASSWORD` | - | Gmail app password for SMTP |
| `JWT_SECRET` | - | Secret used to sign JWT tokens |
| `CORS_ORIGIN` | * | Allowed frontend origins |
| `DATA_DIR` | /app/data | Persistent storage directory for OTP/audit logs |

### Frontend

| Variable | Default | Description |
|----------|---------|-------------|
| `VITE_API_URL` | http://localhost:3001 | Backend API URL |

## Run backend from Docker Hub

If the backend image is published (e.g. `ayushman88/docker_browser`):

```bash
# Pull and run (mount Docker socket so the backend can create browser containers)
docker run -d \
  --name rebrowser-api \
  -v /var/run/docker.sock:/var/run/docker.sock \
  -p 3001:3001 \
  ayushman88/docker_browser:latest
```

Then run the frontend locally (`cd frontend && npm run dev`) or build and serve it separately.

## Publish backend to Docker Hub

1. Create an account at [hub.docker.com](https://hub.docker.com) and create a repository (e.g. `docker_browser`).
2. Log in and build, tag, and push from the backend folder:

```bash
docker login
cd backend
docker build -t YOUR_DOCKERHUB_USERNAME/docker_browser:latest .
docker push YOUR_DOCKERHUB_USERNAME/docker_browser:latest
```

Replace `YOUR_DOCKERHUB_USERNAME` with your Docker Hub username (e.g. `ayushman88`).

## Resource Limits

Each container runs with:

- **Memory**: configurable (`CHROME_MEMORY_MB`, default **768MB** — was 512MB)
- **CPU**: configurable (`CHROME_NANO_CPUS`, default **2** cores worth of CPU quota)
- **Shared memory**: 2GB (required for Chrome)
- **Auto-remove**: Container is deleted when the session ends

**Why the first session can feel slow:** the `nkpro/chrome-novnc` image may need a **pull**, and **Chrome cold-starts** inside the VM. On **Apple Silicon**, session containers run as **linux/amd64** (emulation), which adds overhead. The API **pre-pulls the browser image in the background** after startup so later sessions start faster. Pre-pull on the host also helps: `docker pull nkpro/chrome-novnc:latest`.

## Security and Image Reliability

- Uses environment variables for secrets and runtime config.
- API endpoints are protected using JWT bearer tokens (post-OTP login).
- noVNC host ports are bound to loopback (`127.0.0.1`) by default to prevent direct remote session hijacking.
- Image scanning is configured in GitHub Actions via Trivy (`.github/workflows/ci.yml`): **CRITICAL** findings with a known fix fail the build; unfixed issues are ignored for the gate (see workflow).
- Production Dockerfiles use **Alpine 3.22** bases (`node:20-alpine3.22`, `nginx:1.29-alpine3.22`) to keep OS-layer patches current.
- Frontend image uses a multi-stage Docker build for optimization.
- For production, use a secret manager / Docker secrets and rotate SMTP + JWT secrets regularly.

## Logging and Monitoring

- Structured audit events are written to backend logs and persisted in `DATA_DIR`.
- Runtime counters are exposed via `/metrics`.
- Docker health checks are configured in `docker-compose.yml`.

## CI/CD (Conceptual)

The provided CI pipeline demonstrates:
1. Build backend and frontend container images.
2. Scan images with Trivy (critical gate as configured in the workflow).
3. On `main`, push images to GHCR after a successful scan.

## Contributors

- **[Ayushman88](https://github.com/Ayushman88)** — Backend (Express API, Docker container lifecycle, session management)
- **[Aryan Kale](https://github.com/hyper158)** — Worked in Docs and Architecture of the project
- **[Sandesh Mutadak](https://github.com/sandesh910)** — Worked on Docker Files.
- **[Madhav Adwalkar](https://github.com/Maddy2040)** — Worked on Frontend.
- **[frchaitanyaaa](https://github.com/frchaitanyaaa)** — Enhancement on UI and Loading page.
  

## License

MIT
