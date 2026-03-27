# User Password Management Service

RESTful API for managing users and passwords. Built with Node.js, Express, and PostgreSQL. Secured with per-client API keys. Deployed via Docker Compose.

## Quick Start (Docker)

```bash
git clone <repository-url>
cd auth_project_asses
cp .env.example .env        # edit with your credentials
docker compose up -d --build
docker compose exec app npm run setup-apikeys my-client
```

The API key will be printed to the console. Use it in the `X-API-Key` header for all requests.

## Quick Start (Local)

Requires Node.js 18+ and a running PostgreSQL instance.

```bash
npm install
cp .env.example .env        # set DB_USER, DB_PASSWORD, etc.
npm run init-db              # create tables
npm run setup-apikeys my-client
npm start                    # http://localhost:3000
```

## Project Structure

```
src/
  app.js                  # Express app entry point
  config/                 # Database pool, logger
  routes/                 # Route definitions
  controllers/            # Request handlers
  models/                 # SQL queries (parameterized)
  middleware/             # API key auth, input validation
  logs/                   # Daily log files (YYYY-MM-DD.log)
migrations/               # SQL schema
scripts/                  # DB init, API key setup
docker/                   # Dockerfile, entrypoint
```

## API Endpoints

Base URL: `http://localhost:3000/api/v1` — all routes require `X-API-Key` header.

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/users` | Create user |
| `GET` | `/users` | List all users |
| `GET` | `/users/:id` | Get user by ID |
| `PUT` | `/users/:id` | Update user (partial) |
| `DELETE` | `/users/:id` | Delete user |
| `POST` | `/users/:id/validate-password` | Check password |

### Create User

```bash
curl -X POST http://localhost:3000/api/v1/users \
  -H "Content-Type: application/json" \
  -H "X-API-Key: YOUR_KEY" \
  -d '{
    "username": "john_doe",
    "fullName": "John Doe",
    "email": "john@example.com",
    "mobileNumber": "+1234567890",
    "language": "en",
    "culture": "en-US",
    "password": "SecurePass123!"
  }'
```

Required fields: `username`, `fullName`, `email`, `password`. Optional: `mobileNumber`, `language`, `culture`.

### Update User

`PUT /users/:id` — all fields optional, only provided fields are updated.

### Validate Password

```bash
curl -X POST http://localhost:3000/api/v1/users/{id}/validate-password \
  -H "Content-Type: application/json" \
  -H "X-API-Key: YOUR_KEY" \
  -d '{"password": "SecurePass123!"}'
```

Returns `{"success": true, "data": {"isValid": true}}`.

## User Schema

| Field | Type | Notes |
|-------|------|-------|
| id | UUID | Auto-generated, immutable |
| username | string | Unique, 3-50 chars |
| fullName | string | Required |
| email | string | Unique |
| mobileNumber | string | Optional |
| language | string | Optional |
| culture | string | Optional |
| password | string | Stored as bcrypt hash, never returned in responses |

## Logging

Every API call is logged to `src/logs/YYYY-MM-DD.log` (one file per day). Each JSON log entry contains: timestamp, log level (INFO/ERROR), client IP, client name, hostname, API method, request params, and message. Passwords and API keys are automatically redacted.

## Error Responses

| Status | Meaning |
|--------|---------|
| 400 | Missing/invalid fields |
| 401 | Missing or invalid API key |
| 404 | User not found |
| 409 | Username already exists |
| 429 | Rate limit exceeded |
| 500 | Internal server error |

## Security

- Passwords hashed with bcrypt (10 salt rounds), never returned in API responses
- API key authentication on all endpoints
- Rate limiting: 100 req/15min general, 20 req/15min on password validation
- Helmet security headers
- Parameterized SQL queries (no injection)
- Multi-stage Docker build, non-root container user, read-only filesystem
- Log sanitization: passwords/tokens/keys are redacted
- `.env` excluded from Docker image and git

3. **Set up reverse proxy** (nginx):
```nginx
upstream app {
    server app:3000;
}

server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://app;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

4. **Enable SSL** (certbot):
```bash
certbot certonly --standalone -d your-domain.com
```

5. **Monitor logs**:
```bash
docker-compose logs -f app
```

## Dependencies

- **express**: Web framework
- **pg**: PostgreSQL client
- **bcryptjs**: Password hashing
- **uuid**: UUID generation
- **dotenv**: Environment configuration
- **cors**: Cross-Origin Resource Sharing
- **helmet**: Security headers
- **express-rate-limit**: Rate limiting
- **nodemon**: Development auto-reload (dev only)

## License

MIT

## Support

For issues, questions, or suggestions, open an issue on GitHub or contact the development team.

## Version History

### v1.0.0 (2026-03-25)
- Initial release
- User management (CRUD operations)
- Password validation
- API key authentication
- Daily logging
- Docker support
