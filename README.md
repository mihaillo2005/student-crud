# Student CRUD Management System

A full-stack Student Management System consisting of a **Spring Boot REST API** backend, a **PostgreSQL** database, and a **Vite + Tailwind CSS** frontend.

## Project Structure

```text
Ladrillo-System/
├── render.yaml          # Render Blueprint deployment configuration
├── student/             # Spring Boot REST API Backend (Docker)
│   ├── Dockerfile       # Multi-stage Docker build for Temurin 21 JDK/JRE
│   ├── pom.xml          # Maven dependencies
│   └── src/             # Controller, Entity, Repository, application.properties
└── frontend/            # Vite + Tailwind CSS Frontend (Static Site)
    ├── src/             # Dashboard UI, API client, toast notifications
    └── vite.config.js   # Local proxy configuration to port 8080
```

---

## Deploy to Render.com (Blueprint)

This repository includes a [`render.yaml`](./render.yaml) blueprint that configures all 3 required components automatically:

1. **`student-db`**: Free PostgreSQL database (`db_student`).
2. **`student-backend`**: Spring Boot REST API built via Docker (`./student/Dockerfile`) and connected to `student-db`.
3. **`student-frontend`**: Vite + Tailwind CSS static web application deployed to Render CDN with single-page app routing.

### Step-by-Step Render Deployment:

1. Commit and push this repository to GitHub: **[https://github.com/mihaillo2005/student-crud](https://github.com/mihaillo2005/student-crud)**.
2. Log into the **[Render.com Dashboard](https://dashboard.render.com/)**.
3. Click **New +** and select **Blueprint**.
4. Select your GitHub repository **`student-crud`**.
5. Render will automatically detect [`render.yaml`](./render.yaml) and prepare all 3 resources (`student-db`, `student-backend`, `student-frontend`).
6. Click **Apply**.
7. Once `student-backend` finishes deploying, note its public Render URL (e.g., `https://student-backend-xxxx.onrender.com`).
8. If the generated backend URL differs from `https://student-backend.onrender.com`, update the `VITE_API_BASE_URL` environment variable on `student-frontend` in the Render dashboard and trigger a redeploy.

---

## Local Development

### 1. Backend (Spring Boot)
Ensure PostgreSQL is running locally with database `db_student`:
```powershell
cd student
.\mvnw.cmd spring-boot:run
```
*Backend runs on `http://localhost:8080`.*

### 2. Frontend (Vite + Tailwind CSS)
```powershell
cd frontend
npm.cmd install
npm.cmd run dev
```
*Frontend runs on `http://localhost:5173` with local proxy to `http://localhost:8080`.*
