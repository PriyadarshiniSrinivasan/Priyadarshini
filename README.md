# My Full-Stack Application

![CI/CD Pipeline](https://github.com/PriyadarshiniSrinivasan/Priyadarshini/actions/workflows/ci-cd.yml/badge.svg)

A full-stack application with NestJS backend and Next.js frontend.

## 🏗️ Architecture

- **Backend**: NestJS with Prisma ORM
- **Frontend**: Next.js with Material-UI
- **Database**: PostgreSQL
- **Authentication**: Okta
- **Containerization**: Docker

## 🚀 CI/CD Pipeline

This project uses GitHub Actions for continuous integration and deployment. The pipeline automatically:

1. ✅ Runs on every push to `main` branch
2. 🧪 Builds and tests the backend
3. 🎨 Builds and tests the frontend
4. 🐳 Builds Docker images
5. 📊 Reports build status

## 📋 Prerequisites

- Node.js 20+
- Docker and Docker Compose
- PostgreSQL
- Okta Account (for authentication)

## 🛠️ Local Development

### Using Docker Compose

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

### Manual Setup

#### Backend

```bash
cd apps/nest-backend
npm install
npm run start:dev
```

#### Frontend

```bash
cd apps/next-frontend/next-frontend-app
npm install
npm run dev
```

## 📁 Project Structure

```
my-fullstack-app/
├── apps/
│   ├── nest-backend/          # NestJS API
│   │   ├── src/
│   │   ├── prisma/
│   │   └── Dockerfile
│   └── next-frontend/         # Next.js UI
│       └── next-frontend-app/
│           ├── src/
│           └── Dockerfile
├── .github/
│   └── workflows/
│       └── ci-cd.yml          # CI/CD Pipeline
└── docker-compose.yml
```

## 🔑 Environment Variables

Create `.env` files for local development:

### Backend (.env)
```
DATABASE_URL="postgresql://user:password@localhost:5432/mydb"
JWT_SECRET="your-secret-key"
OKTA_ISSUER="https://your-domain.okta.com/oauth2/default"
OKTA_CLIENT_ID="your-client-id"
```

### Frontend (.env.local)
```
NEXT_PUBLIC_API_URL="http://localhost:3000"
```

## 📦 Available Scripts

### Backend
- `npm run build` - Build the application
- `npm run start:dev` - Start in development mode
- `npm run lint` - Lint code
- `npm test` - Run tests

### Frontend
- `npm run build` - Build for production
- `npm run dev` - Start development server
- `npm run lint` - Lint code

## 🧪 Testing

```bash
# Backend tests
cd apps/nest-backend
npm test

# Frontend tests
cd apps/next-frontend/next-frontend-app
npm test
```

## 🚢 Deployment

The CI/CD pipeline is configured to:
- Automatically test all code changes
- Build Docker images
- (Future) Deploy to production on successful builds

## 📝 License

This project is private and not licensed for public use.
