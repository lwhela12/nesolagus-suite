# Docker Database Setup

**The easiest way to get started!** ✅

This guide shows you how to set up PostgreSQL using Docker Compose with **one command**.

---

## Prerequisites

- Docker Desktop installed ([download here](https://www.docker.com/products/docker-desktop))
- That's it! No PostgreSQL installation needed.

---

## Quick Start (30 seconds)

```bash
cd studio

# 1. Copy environment variables
cp .env.example .env

# 2. Start database (and run migrations)
npm run setup:db

# 3. Start Next.js dev server
npm run dev
```

**Done!** Your database is running and the Studio UI is live at http://localhost:3000

---

## What Just Happened?

`npm run setup:db` did:
1. ✅ Started PostgreSQL in Docker (port 5433)
2. ✅ Started Redis in Docker (port 6380)
3. ✅ Waited for database to be ready
4. ✅ Ran Prisma migrations (created tables)
5. ✅ Generated Prisma Client

---

## Docker Compose Services

### PostgreSQL
- **Image**: `postgres:15-alpine`
- **Port**: `5433` (to avoid conflicts with engine's postgres)
- **Database**: `nesolagus_studio`
- **User**: `studio_user`
- **Password**: `studio_password`

### Redis (Optional)
- **Image**: `redis:7-alpine`
- **Port**: `6380` (to avoid conflicts)
- **Purpose**: Caching, sessions (future use)

### pgAdmin (Optional - Commented Out)
- **Purpose**: Web-based database GUI
- **Port**: `5050`
- **Enable**: Uncomment in `docker-compose.yml`

---

## Available Commands

### Database Management

```bash
# Start database
npm run db:up

# Stop database (keeps data)
npm run db:down

# View database logs
npm run db:logs

# Reset database (⚠️ deletes all data)
npm run db:reset
```

### Prisma Commands

```bash
# Run migrations
npm run db:migrate

# Generate Prisma Client
npm run db:generate

# Open Prisma Studio (visual database editor)
npm run db:studio

# Seed database (if seed script exists)
npm run db:seed

# Deploy migrations (production)
npm run db:migrate:deploy
```

### Complete Setup

```bash
# One command to rule them all
npm run setup:db

# This runs:
# 1. docker-compose up -d
# 2. sleep 5 (wait for postgres)
# 3. npx prisma migrate dev
# 4. npx prisma generate
```

---

## Connection Details

### Environment Variables

`.env` should contain:

```env
# Docker PostgreSQL
DATABASE_URL="postgresql://studio_user:studio_password@localhost:5433/nesolagus_studio?schema=public"

# Redis (optional)
REDIS_URL="redis://localhost:6380"
```

**Note**: Port `5433` (not `5432`) to avoid conflicts with the engine's database.

---

## Verifying Setup

### Check Docker Containers

```bash
docker ps

# Should show:
# - studio_postgres (port 5433)
# - studio_redis (port 6380)
```

### Check Database Connection

```bash
# Using psql (if installed)
psql postgresql://studio_user:studio_password@localhost:5433/nesolagus_studio

# Or using Docker
docker exec -it studio_postgres psql -U studio_user -d nesolagus_studio
```

### Open Prisma Studio

```bash
npm run db:studio

# Opens http://localhost:5555
# Visual interface to browse database
```

---

## Data Persistence

**Data is persisted** in Docker volumes:
- `studio_postgres_data` - Database files
- `studio_redis_data` - Redis data

**Stopping containers** (`npm run db:down`) preserves data.

**Deleting volumes** (`npm run db:reset`) erases all data.

---

## Troubleshooting

### Port Already in Use

If port 5433 is already taken:

```yaml
# Edit docker-compose.yml
services:
  postgres:
    ports:
      - '5434:5432'  # Change to 5434

# Update .env
DATABASE_URL="postgresql://...@localhost:5434/..."
```

### Container Won't Start

```bash
# Check Docker Desktop is running
docker info

# View detailed logs
docker-compose logs postgres

# Remove old containers
docker-compose down -v
docker-compose up -d
```

### Connection Refused

```bash
# Wait for database to be ready
docker-compose ps

# Check health status (should show "healthy")
docker inspect studio_postgres | grep Health

# Restart if needed
npm run db:down
npm run db:up
```

### Prisma Client Not Generated

```bash
# Manually generate
npm run db:generate

# Check node_modules/@prisma/client exists
ls node_modules/@prisma/client
```

---

## Production Considerations

### Don't Use Docker Compose in Production

This setup is for **local development only**.

For production, use:
- Neon (serverless Postgres)
- Supabase
- Railway
- Heroku Postgres
- AWS RDS
- Any managed PostgreSQL

### Migration Strategy

```bash
# Development
npm run db:migrate      # Creates and applies migrations

# Production
npm run db:migrate:deploy  # Only applies existing migrations
```

---

## Advantages of Docker Setup

✅ **One command** setup (`npm run setup:db`)
✅ **No local PostgreSQL** installation needed
✅ **Isolated** - Won't conflict with other projects
✅ **Consistent** - Same environment for all developers
✅ **Easy cleanup** - `docker-compose down -v` removes everything
✅ **Fast** - Alpine images are small (~40MB)
✅ **Works offline** - No need for cloud database

---

## Comparison: Docker vs Cloud

| Feature | Docker (Local) | Neon (Cloud) |
|---------|----------------|--------------|
| Setup Time | 30 seconds | 1 minute |
| Cost | Free | Free (with limits) |
| Internet Required | No | Yes |
| Team Access | No | Yes |
| Backups | Manual | Automatic |
| Scalability | N/A | Auto-scales |
| Production Ready | No | Yes |

**Recommendation**:
- Use **Docker** for local development (this guide)
- Use **Neon/Supabase** for staging/production (see SETUP.md)

---

## Next Steps

Now that your database is running:

1. **Start development server**: `npm run dev`
2. **Visit Studio UI**: http://localhost:3000
3. **Explore database**: `npm run db:studio`
4. **Generate a survey**: http://localhost:3000/generate

---

## Cleanup

### Stop but Keep Data

```bash
npm run db:down
```

### Complete Removal

```bash
# Remove containers and volumes
npm run db:reset

# Remove Docker images (optional)
docker rmi postgres:15-alpine redis:7-alpine
```

---

**Questions?** See [SETUP.md](SETUP.md) for alternative database options.
