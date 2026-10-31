# PagePeek

### Capture. Preview. Save.

PagePeek is a full-stack URL Preview Application that allows users to generate screenshots of websites simply by submitting their URLs. Users can create accounts, securely authenticate, capture website previews, and maintain a personal history of previously generated screenshots.

Built using **React, FastAPI, PostgreSQL, and Playwright**, PagePeek provides an intuitive interface backed by an asynchronous backend architecture for efficient website preview generation and management.

---

## Overview

PagePeek simplifies the process of capturing and revisiting websites. Instead of manually taking screenshots and organizing them, users can submit a URL and let the application automatically generate and store its preview.

### Key Features

- **User Authentication:** Secure registration and login using JWT authentication and Argon2 password hashing.
- **Website Screenshot Generation:** Automatically capture website screenshots using Playwright and Chromium.
- **Preview Management:** Save website URLs along with their corresponding screenshots.
- **Personal Dashboard:** Access all previously generated previews from a single dashboard.
- **Delete Previews:** Remove saved previews and their associated screenshot files.
- **User-specific Data:** Ensure users can access and manage only their own previews.
- **URL Validation:** Validate submitted URLs and protect against common SSRF attack vectors.
- **Persistent Storage:** Store user information and preview metadata in PostgreSQL.
- **Responsive Interface:** Use the application across desktop, tablet, and mobile devices.
- **Dockerized Environment:** Run the application using Docker Compose without manually installing PostgreSQL.

---

## Technology Stack

| Category | Technology |
|---|---|
| Frontend | React.js, Vite, JavaScript |
| Routing | React Router DOM |
| API Communication | Axios |
| Icons | Lucide React |
| Backend | Python, FastAPI |
| ORM | SQLAlchemy 2.x |
| Database | PostgreSQL |
| Migrations | Alembic |
| Authentication | JWT |
| Password Hashing | Argon2 |
| Browser Automation | Playwright |
| Browser Engine | Chromium |
| Containerization | Docker, Docker Compose |
| API Documentation | Swagger UI, OpenAPI |

---

## Application Architecture

PagePeek follows a client-server architecture with separate responsibilities for the frontend, backend, database, and screenshot generation service.

```text
                         USER
                           |
                           v
                +----------------------+
                |    React Frontend    |
                |    (Vite + React)    |
                +----------------------+
                           |
                           | REST API
                           | JWT Authentication
                           v
                +----------------------+
                |     FastAPI          |
                |     Backend          |
                +----------------------+
                           |
                +----------+-----------+
                |                      |
                v                      v
       +----------------+     +-------------------+
       |   PostgreSQL   |     |    Playwright     |
       |                |     |    Chromium       |
       | Users          |     |                   |
       | URL Previews   |     | Screenshot        |
       |                |     | Generation        |
       +----------------+     +-------------------+
                                       |
                                       v
                              +-------------------+
                              | Screenshot Storage|
                              |                   |
                              | User-specific     |
                              | Screenshot Files  |
                              +-------------------+
```

### How It Works

1. A user registers or logs into PagePeek.
2. FastAPI authenticates the user and issues an access token.
3. The user submits a website URL through the dashboard.
4. The backend validates the submitted URL.
5. Playwright launches Chromium and navigates to the website.
6. A screenshot is generated and stored in the backend.
7. The URL and screenshot path are saved in PostgreSQL.
8. The frontend displays the generated preview.
9. Users can retrieve, view, and delete their previously saved previews.

---

## Project Structure

```text
PagePeek/
│
├── backend/
│   ├── app/
│   │   ├── api/
│   │   │   └── routes/
│   │   │       ├── auth.py
│   │   │       └── previews.py
│   │   │
│   │   ├── core/
│   │   │   ├── config.py
│   │   │   ├── security.py
│   │   │   └── dependencies.py
│   │   │
│   │   ├── db/
│   │   │   ├── base.py
│   │   │   └── session.py
│   │   │
│   │   ├── models/
│   │   │   ├── user.py
│   │   │   ├── preview.py
│   │   │   └── __init__.py
│   │   │
│   │   ├── schemas/
│   │   │   ├── auth.py
│   │   │   └── preview.py
│   │   │
│   │   ├── services/
│   │   │   ├── url_validator.py
│   │   │   └── screenshot_service.py
│   │   │
│   │   └── main.py
│   │
│   ├── alembic/
│   ├── storage/
│   │   └── screenshots/
│   ├── requirements.txt
│   └── Dockerfile
│
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   ├── context/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── hooks/
│   │   ├── App.jsx
│   │   └── main.jsx
│   │
│   ├── package.json
│   └── vite.config.js
│
├── docker-compose.yml
├── .env.example
├── .gitignore
└── README.md
```

---

## Getting Started

PagePeek can be started using Docker Compose, which manages the backend and PostgreSQL database.

### Prerequisites

- Git
- Docker Engine
- Docker Compose plugin

For running the frontend separately:

- Node.js
- npm

For running the backend separately:

- Python 3.12+
- PostgreSQL, unless using the Docker database

### 1. Clone the Repository

```bash
git clone <YOUR_GITHUB_REPOSITORY_URL>
cd PagePeek
```

### 2. Configure Environment Variables

Create your local environment file:

```bash
cp .env.example .env
```

Example `.env` configuration:

```env
POSTGRES_DB=pagepeek
POSTGRES_USER=pagepeek_user
POSTGRES_PASSWORD=your_secure_database_password

# URL-encoded representation of the database password
POSTGRES_PASSWORD_URLENCODED=your_url_encoded_password

SECRET_KEY=your_secure_random_secret_key
```

Generate a secure secret key:

```bash
openssl rand -hex 32
```

**Important:**

- Replace the example credentials with your own.
- Never commit `.env` to GitHub.
- Ensure the URL-encoded password matches the actual PostgreSQL password.
- Keep private credentials out of frontend environment variables.

### 3. Build and Start the Application

Run:

```bash
docker compose up --build -d
```

Check running containers:

```bash
docker compose ps
```

View backend logs:

```bash
docker compose logs -f backend
```

### 4. Apply Database Migrations

Run:

```bash
docker compose exec backend alembic upgrade head
```

Alembic applies the database schema migrations.

### 5. Access PagePeek

Once the containers are running, open:

| Service | URL |
|---|---|
| Frontend | http://localhost:5173 |
| Backend | http://localhost:8000 |
| Swagger API Documentation | http://localhost:8000/docs |
| Health Check | http://localhost:8000/health |

---

## API Documentation

PagePeek provides REST APIs through FastAPI.

Interactive API documentation is available at:

**http://localhost:8000/docs**

### Authentication APIs

| Method | Endpoint | Description | Authentication |
|---|---|---|---|
| POST | `/api/auth/register` | Register a new user | No |
| POST | `/api/auth/login` | Authenticate a user | No |
| GET | `/api/auth/me` | Retrieve current user details | Yes |

### Preview APIs

| Method | Endpoint | Description | Authentication |
|---|---|---|---|
| POST | `/api/previews/` | Generate and save a website preview | Yes |
| GET | `/api/previews/` | Retrieve all saved previews | Yes |
| GET | `/api/previews/{preview_id}/image` | Retrieve screenshot image | Yes |
| DELETE | `/api/previews/{preview_id}` | Delete a saved preview and its screenshot | Yes |

### Authentication Workflow

**1. Register a User**

`POST /api/auth/register`

Request:

```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "StrongPassword123"
}
```

**2. Login**

`POST /api/auth/login`

Request:

```json
{
  "email": "john@example.com",
  "password": "StrongPassword123"
}
```

Response:

```json
{
  "access_token": "your_access_token",
  "token_type": "bearer"
}
```

Use the returned token in the Authorization header for protected endpoints:

```http
Authorization: Bearer YOUR_ACCESS_TOKEN
```

### Generate Website Preview

`POST /api/previews/`

Request:

```json
{
  "url": "https://example.com"
}
```

The backend validates the URL, generates a screenshot using Playwright, and stores the preview information in PostgreSQL.

### Retrieve Saved Previews

`GET /api/previews/`

Returns the previews belonging to the authenticated user.

### Retrieve Screenshot

`GET /api/previews/{preview_id}/image`

Returns the stored screenshot as a PNG image, provided the authenticated user owns the preview.

### Delete a Preview

`DELETE /api/previews/{preview_id}`

Deletes the specified preview and its associated screenshot.

**Authorization rules:**

- Authentication is required.
- Users can delete only their own previews.
- A preview belonging to another user is not accessible.
- The API returns `404 Not Found` when the requested preview is unavailable to the current user.

---

## Database Design

PagePeek uses PostgreSQL to store user accounts and website preview metadata.

### Users Table

| Field | Description |
|---|---|
| id | Unique user identifier |
| name | User's name |
| email | Unique email address |
| hashed_password | Argon2 password hash |
| created_at | Account creation timestamp |

### URL Previews Table

| Field | Description |
|---|---|
| id | Unique preview identifier |
| user_id | Reference to the owning user |
| url | Submitted website URL |
| screenshot_path | Screenshot storage location |
| created_at | Preview creation timestamp |

### Relationships

- One user can create multiple previews.
- Each preview belongs to exactly one user.
- User ownership is enforced through database relationships and authenticated API queries.

---

## Security Considerations

Since PagePeek navigates to URLs submitted by users, URL validation and access control are important parts of the application.

The application incorporates:

- Argon2 password hashing.
- JWT-based authentication.
- Protected API endpoints.
- User-level authorization.
- HTTP and HTTPS URL restrictions.
- Rejection of localhost and private IP addresses.
- DNS resolution checks.
- Browser request validation.
- Redirect and subresource validation.
- Screenshot path validation.
- Environment-based secret management.
- Request timeouts.

**SSRF protection:** Application-level validation is one layer of defense. Production deployments should also enforce network-level egress restrictions and protect against DNS rebinding, cloud metadata access, and requests to internal infrastructure.

---

## Testing

### Backend Tests

Run the backend test suite:

```bash
docker compose exec backend pytest
```

Tests should cover:

- User registration and login.
- Duplicate email handling.
- Invalid credentials.
- JWT authentication.
- Protected endpoints.
- URL validation.
- Private IP rejection.
- Screenshot generation.
- Preview creation and retrieval.
- Cross-user access prevention.
- Preview deletion.

### Frontend Tests

Run:

```bash
cd frontend
npm test
```

Frontend tests should cover:

- Login and registration forms.
- Authentication state.
- Protected routes.
- Dashboard rendering.
- URL submission.
- Preview display.
- Error handling.

The test commands require the corresponding test dependencies and scripts to be configured.

---

## Troubleshooting

### Backend is not starting

Check logs:

```bash
docker compose logs backend
```

### Database connection error

Check container status:

```bash
docker compose ps
```

Check database logs:

```bash
docker compose logs db
```

### Frontend cannot connect to backend

Verify:

- FastAPI is running on port `8000`.
- `VITE_API_URL` points to the correct backend address.
- CORS allows the frontend origin.
- There are no connection errors in the browser's Network tab.

### Screenshot generation fails

Check:

- Chromium is installed in the backend container.
- The submitted URL is valid and publicly accessible.
- The target website permits browser access.
- The navigation timeout has not expired.
- Backend logs for Playwright errors.

---

## Stopping the Application

Stop the containers:

```bash
docker compose down
```

This preserves the PostgreSQL named volume.

To remove the database volume:

```bash
docker compose down -v
```

**Warning:** The second command permanently deletes the PostgreSQL volume and all data stored in it. Use it only when intentionally resetting the database.

---

## Future Improvements

Potential enhancements include:

- Website title and metadata extraction.
- Custom screenshot viewport sizes.
- Full-page and viewport-only screenshot options.
- Secure public preview sharing.
- Background screenshot processing with Celery and Redis.
- Screenshot caching.
- API rate limiting.
- Cloud object storage integration.
- Advanced preview search and filtering.
- HttpOnly cookie-based authentication.

---

## License

This project is developed as a software engineering assessment and learning project.

A formal open-source license can be added if the project is distributed publicly.

---

<p align="center">
  <strong>PagePeek</strong>
  <br />
  Capture. Preview. Save.
</p>
