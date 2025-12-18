# QoderTest - User Authentication System

A complete user authentication system built with Express.js, TypeScript, and SQLite.

## Features

- JWT-based authentication with access/refresh token rotation
- OAuth2 login (Google, GitHub)
- Two-factor authentication (TOTP)
- Rate limiting and security headers

## Quick Start

```bash
# Install dependencies
npm install

# Generate Prisma client
npm run db:generate

# Run database migrations
npm run db:migrate

# Copy environment file and configure
cp .env.example .env

# Start development server
npm run dev
```

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/auth/register | Register new user |
| POST | /api/auth/login | User login |
| POST | /api/auth/logout | User logout |
| POST | /api/auth/refresh | Refresh access token |
| GET | /api/auth/oauth/google | Google OAuth login |
| GET | /api/auth/oauth/github | GitHub OAuth login |
| POST | /api/auth/2fa/setup | Setup 2FA |
| POST | /api/auth/2fa/verify | Verify and enable 2FA |
| GET | /api/auth/me | Get current user profile |

## Tech Stack

- Express.js + TypeScript
- Prisma ORM + SQLite
- JWT (jsonwebtoken)
- Passport.js (OAuth)
- otplib (TOTP)
- Zod (validation)