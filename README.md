# Real-Time Polling System

A full-stack polling application built with NestJS and React, featuring real-time updates, role-based access control, and MongoDB integration.

## Features

- **Real-time Updates**: Live poll results using WebSockets
- **Role-Based Access**: Admin and user roles with different permissions
- **Authentication**: JWT-based authentication with bcrypt password hashing
- **Poll Management**: Create, edit, delete, and manage polls
- **Voting System**: Vote on polls with real-time result updates
- **Access Control**: Restrict polls to specific users
- **Responsive Design**: Modern UI built with React and Tailwind CSS

## Technology Stack

### Backend
- NestJS
- MongoDB with Mongoose
- Socket.IO for WebSockets
- JWT for authentication
- Passport for authentication strategies
- TypeScript

### Frontend
- React with TypeScript
- Vite
- Tailwind CSS
- Axios for API calls
- React Router for navigation
- Socket.IO client for real-time updates

## Project Structure

```
.
├── backend/          # NestJS backend application
│   ├── src/
│   │   ├── auth/     # Authentication module
│   │   ├── users/    # Users module
│   │   ├── polls/    # Polls module with WebSocket gateway
│   │   └── common/   # Shared utilities and filters
│   └── test/         # E2E tests
├── frontend/         # React frontend application
│   ├── src/
│   │   ├── api/      # API client configurations
│   │   ├── components/  # React components
│   │   ├── context/  # React context providers
│   │   ├── pages/    # Page components
│   │   └── services/ # WebSocket services
│   └── public/       # Static assets
└── README.md
```

## Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- MongoDB (local instance or MongoDB Atlas)

## Setup Instructions

### 1. Clone the Repository

```bash
git clone <repository-url>
cd polling-system
```

### 2. Environment Variables

Create a `.env` file in the `backend` directory with the following variables:

```env
MONGODB_URI=mongodb://localhost:27017/polling-system
JWT_SECRET=your_jwt_secret_key
PORT=3000
```

### 3. Backend Setup

```bash
cd backend
npm install
npm run build
npm run start:dev
```

The backend server will start on `http://localhost:3000`

### 4. Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

The frontend development server will start on `http://localhost:5173`

## Deployment

### Backend Deployment

1. Build the backend:
```bash
cd backend
npm run build
```

2. Start in production mode:
```bash
npm run start:prod
```

### Frontend Deployment

1. Build the frontend:
```bash
cd frontend
npm run build
```

2. The built files will be in the `frontend/dist` directory

### Full Stack Deployment

The backend is configured to serve the frontend static files. After building both:

1. Build frontend:
```bash
cd frontend
npm run build
```

2. Build and start backend:
```bash
cd backend
npm run build
npm run start:prod
```

The application will be available at `http://localhost:3000`

## Testing

### Backend Tests

```bash
cd backend

# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Test coverage
npm run test:cov
```

## API Endpoints

### Authentication
- `POST /auth/register` - Register a new user
- `POST /auth/login` - Login user

### Users
- `GET /users` - Get all users (Admin only)
- `GET /users/:id` - Get user by ID
- `PATCH /users/:id` - Update user
- `DELETE /users/:id` - Delete user (Admin only)

### Polls
- `GET /polls` - Get all accessible polls
- `GET /polls/:id` - Get poll by ID
- `POST /polls` - Create new poll (Admin only)
- `PATCH /polls/:id` - Update poll (Admin only)
- `DELETE /polls/:id` - Delete poll (Admin only)
- `POST /polls/:id/vote` - Vote on a poll
- `PATCH /polls/:id/allowed-users` - Update allowed users (Admin only)

### WebSocket Events
- `pollUpdated` - Emitted when poll results change


## AI-Assisted Development

This project was developed with assistance from **GitHub Copilot**, which was used to:

- Generate boilerplate code and reduce repetitive typing
- Provide TypeScript type definitions and interfaces
- Auto-complete API endpoint handlers and service methods
- Suggest React component structures and hooks usage
- Optimize code with best practices and modern JavaScript/TypeScript features

GitHub Copilot significantly improved development speed by providing intelligent code suggestions, reducing syntax errors, and offering real-time best practice recommendations. The AI assistant helped maintain consistent code style across the project and suggested efficient algorithms for data handling and state management.

## Features in Detail

### Admin Dashboard
- Create, edit, and delete polls
- View all polls in the system
- Manage user access to specific polls
- Real-time poll result monitoring

### User Dashboard
- View available polls
- Vote on accessible polls
- See real-time result updates
- Access only polls assigned by admin

### Security
- Password hashing with bcrypt
- JWT token-based authentication
- Role-based access control (RBAC)
- Protected routes on frontend
- Route guards on backend
