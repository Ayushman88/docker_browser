# Remote Ephemeral Browser

A secure, disposable browser session that runs inside an isolated Docker container. Each session gets a fresh Chrome instance with a unique fingerprint, resource limits, and automatic cleanup when the session ends.

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

### 3. Start the frontend

```bash
cd frontend
npm install
npm run dev
```

The app runs at `http://localhost:5173`.

### 4. Use the app

1. Open `http://localhost:5173`
2. Click **Start Private Browser**
3. A new tab opens with the remote Chrome streamed via noVNC
4. If prompted for VNC password, use **passwd** (default for this image)
5. You should see a full desktop with Chromium—use it like a normal browser
6. Click **End Session** when done (container is removed automatically)

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
| POST | `/api/session` | Create a new browser session |
| GET | `/api/session/:id` | Get session status |
| DELETE | `/api/session/:id` | End session and remove container |

## Environment Variables

### Backend

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | 3001 | API server port |
| `VNC_HOST` | localhost | Host for noVNC URLs (use your server hostname when deploying) |

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

- **Memory**: 512MB
- **CPU**: 1 core
- **Shared memory**: 2GB (required for Chrome)
- **Auto-remove**: Container is deleted when the session ends

## Contributors

- **[Ayushman88](https://github.com/Ayushman88)** — Backend (Express API, Docker container lifecycle, session management)
- **[Aryan Kale](https://github.com/hyper158)** — Worked in Docs and Architecture of the project
- **[Sandesh Mutadak](https://github.com/sandesh910)** — Worked on Docker Files.
- **[Madhav Adwalkar](https://github.com/Maddy2040)** — Worked on Frontend.
- **[frchaitanyaaa](https://github.com/frchaitanyaaa)** — Enhancement on UI and Loading page.
  

## License

MIT
