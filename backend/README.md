# Polling System Backend

NestJS backend application for a real-time polling system with MongoDB and WebSocket support.

## Features

- JWT-based authentication with Passport
- Role-based access control (Admin/User)
- Real-time poll updates via WebSockets
- MongoDB with Mongoose ODM
- RESTful API architecture
- Global validation pipes
- Exception filtering
- CORS enabled

## Technology Stack

- **Framework**: NestJS
- **Database**: MongoDB with Mongoose
- **Authentication**: Passport JWT
- **WebSockets**: Socket.IO
- **Validation**: class-validator & class-transformer
- **Password Hashing**: bcrypt
- **Language**: TypeScript

## Project Structure

```
src/
├── auth/                    # Authentication module
│   ├── decorators/         # Custom decorators (CurrentUser, Roles)
│   ├── dto/                # Data transfer objects
│   ├── guards/             # Auth guards (JWT, Roles)
│   ├── strategies/         # Passport strategies
│   ├── auth.controller.ts
│   ├── auth.service.ts
│   └── auth.module.ts
├── users/                  # Users module
│   ├── dto/
│   ├── schemas/
│   ├── users.controller.ts
│   ├── users.service.ts
│   └── users.module.ts
├── polls/                  # Polls module
│   ├── dto/
│   ├── schemas/
│   ├── polls.controller.ts
│   ├── polls.service.ts
│   ├── polls.gateway.ts    # WebSocket gateway
│   └── polls.module.ts
├── common/                 # Shared utilities
│   ├── enums/
│   └── filters/
├── app.module.ts
└── main.ts
```

## Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- MongoDB (local or Atlas)

## Installation

```bash
npm install
```

## Environment Variables

Create a `.env` file in the backend directory:

```env
MONGODB_URI=mongodb://localhost:27017/polling-system
JWT_SECRET=your_jwt_secret_key
PORT=3000
```

## Running the Application

### Development Mode
```bash
npm run start:dev
```

### Production Mode
```bash
npm run build
npm run start:prod
```

### Debug Mode
```bash
npm run start:debug
```

## Testing

### Unit Tests
```bash
npm run test
```

### E2E Tests
```bash
npm run test:e2e
```

### Test Coverage
```bash
npm run test:cov
```

## API Documentation

### Authentication Endpoints

#### Register
```http
POST /auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123",
  "username": "username",
  "role": "user"
}
```

#### Login
```http
POST /auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}

Response:
{
  "access_token": "jwt_token_here",
  "user": {
    "id": "user_id",
    "email": "user@example.com",
    "username": "username",
    "role": "user"
  }
}
```

### Users Endpoints

#### Get All Users (Admin Only)
```http
GET /users
Authorization: Bearer {jwt_token}
```

#### Get User by ID
```http
GET /users/:id
Authorization: Bearer {jwt_token}
```

#### Update User
```http
PATCH /users/:id
Authorization: Bearer {jwt_token}
Content-Type: application/json

{
  "username": "new_username"
}
```

#### Delete User (Admin Only)
```http
DELETE /users/:id
Authorization: Bearer {jwt_token}
```

### Polls Endpoints

#### Get All Polls
```http
GET /polls
Authorization: Bearer {jwt_token}
```

Returns polls based on user role:
- Admin: All polls
- User: Only polls they have access to

#### Get Poll by ID
```http
GET /polls/:id
Authorization: Bearer {jwt_token}
```

#### Create Poll (Admin Only)
```http
POST /polls
Authorization: Bearer {jwt_token}
Content-Type: application/json

{
  "question": "What is your favorite color?",
  "options": [
    { "text": "Red" },
    { "text": "Blue" },
    { "text": "Green" }
  ],
  "allowedUsers": ["user_id_1", "user_id_2"]
}
```

#### Update Poll (Admin Only)
```http
PATCH /polls/:id
Authorization: Bearer {jwt_token}
Content-Type: application/json

{
  "question": "Updated question?",
  "options": [
    { "text": "Option 1" },
    { "text": "Option 2" }
  ]
}
```

#### Delete Poll (Admin Only)
```http
DELETE /polls/:id
Authorization: Bearer {jwt_token}
```

#### Vote on Poll
```http
POST /polls/:id/vote
Authorization: Bearer {jwt_token}
Content-Type: application/json

{
  "optionIndex": 0
}
```

#### Update Allowed Users (Admin Only)
```http
PATCH /polls/:id/allowed-users
Authorization: Bearer {jwt_token}
Content-Type: application/json

{
  "allowedUsers": ["user_id_1", "user_id_2", "user_id_3"]
}
```

## WebSocket Events

### Connection
```javascript
const socket = io('http://localhost:3000', {
  auth: {
    token: 'jwt_token_here'
  }
});
```

### Events

#### Poll Updated
Emitted when a poll's votes change:
```javascript
socket.on('pollUpdated', (poll) => {
  console.log('Poll updated:', poll);
});
```

## Database Schema

### User Schema
```typescript
{
  email: string (unique, required)
  password: string (required, hashed)
  username: string (required)
  role: 'admin' | 'user' (default: 'user')
  createdAt: Date
  updatedAt: Date
}
```

### Poll Schema
```typescript
{
  question: string (required)
  options: [{
    text: string (required)
    votes: number (default: 0)
  }]
  createdBy: ObjectId (ref: User, required)
  allowedUsers: [ObjectId] (ref: User)
  totalVotes: number (default: 0)
  createdAt: Date
  updatedAt: Date
}
```

## Security Features

- **Password Hashing**: All passwords hashed with bcrypt
- **JWT Authentication**: Secure token-based authentication
- **Role-Based Access Control**: Admin and User roles with different permissions
- **Input Validation**: Global validation pipes for all incoming data
- **CORS**: Enabled for cross-origin requests
- **Exception Filtering**: Global exception handler for consistent error responses

## Default Seed Data

On first run, the application creates default users:

**Admin:**
- Email: `admin@example.com`
- Password: `admin123`

**Users:**
- Email: `user1@example.com`, `user2@example.com`, `user3@example.com`
- Password: `user123`

## Error Handling

All errors are handled by the global exception filter and return consistent responses:

```json
{
  "statusCode": 400,
  "message": "Error message here",
  "timestamp": "2025-01-01T00:00:00.000Z",
  "path": "/api/endpoint"
}
```

## Development Tools

### Linting
```bash
npm run lint
```

### Format Code
```bash
npm run format
```

## AI-Assisted Development

This backend was developed with assistance from **GitHub Copilot**, which helped with:

- Generating module boilerplate code
- Creating DTO classes with validation decorators
- Implementing authentication strategies and guards
- Suggesting MongoDB schema definitions
- Auto-completing service methods and controller endpoints
- Generating test cases and mock data
- Providing TypeScript type definitions
- Optimizing async/await patterns and error handling

GitHub Copilot improved development speed by offering intelligent suggestions for NestJS-specific patterns, dependency injection, and best practices for building scalable backend applications.

## Deployment

### Build
```bash
npm run build
```

### Start Production Server
```bash
npm run start:prod
```

### Docker Support
Create a `Dockerfile`:

```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

EXPOSE 3000

CMD ["npm", "run", "start:prod"]
```

Build and run:
```bash
docker build -t polling-backend .
docker run -p 3000:3000 --env-file .env polling-backend
```
