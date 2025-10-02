# Polling System Frontend

React-based frontend application for a real-time polling system with modern UI and WebSocket integration.

## Features

- **Real-time Updates**: Live poll results using Socket.IO
- **Authentication**: Login and registration with JWT
- **Role-Based UI**: Different interfaces for Admin and User roles
- **Poll Management**: Create, edit, and delete polls (Admin)
- **Voting Interface**: Vote on polls with instant feedback
- **User Management**: Manage poll access for specific users (Admin)
- **Responsive Design**: Mobile-friendly UI with Tailwind CSS
- **Protected Routes**: Route guards for authenticated users

## Technology Stack

- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **HTTP Client**: Axios
- **WebSockets**: Socket.IO Client
- **Routing**: React Router DOM
- **State Management**: React Context API
- **Icons**: Lucide React

## Project Structure

```
src/
├── api/                    # API client configurations
│   ├── axios.ts           # Axios instance with interceptors
│   ├── auth.ts            # Authentication API calls
│   └── polls.ts           # Polls API calls
├── components/            # React components
│   ├── CreatePollModal.tsx
│   ├── EditPollModal.tsx
│   ├── ManageAllowedUsersModal.tsx
│   ├── Navbar.tsx
│   ├── PollCard.tsx
│   ├── PollResults.tsx
│   └── ProtectedRoute.tsx
├── context/               # React context providers
│   └── AuthContext.tsx
├── pages/                 # Page components
│   ├── AdminDashboard.tsx
│   ├── Login.tsx
│   ├── Register.tsx
│   └── UserPolls.tsx
├── services/              # Service utilities
│   └── socket.ts          # Socket.IO configuration
├── App.tsx                # Main app component
├── main.tsx               # Entry point
└── index.css              # Global styles
```

## Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- Backend server running (see backend README)

## Installation

```bash
npm install
```

## Environment Variables

Create a `.env` file in the frontend directory:

```env
VITE_API_URL=http://localhost:3000
```

## Running the Application

### Development Mode
```bash
npm run dev
```

The application will start on `http://localhost:5173`

### Build for Production
```bash
npm run build
```

### Preview Production Build
```bash
npm run preview
```

## Features in Detail

### Authentication

#### Login Page
- Email and password authentication
- JWT token storage in localStorage
- Automatic redirect to dashboard after login
- Role-based redirect (Admin or User dashboard)

#### Register Page
- User registration form
- Username, email, and password fields
- Input validation
- Automatic login after successful registration

### Admin Dashboard

**Features:**
- View all polls in the system
- Create new polls with multiple options
- Edit existing polls
- Delete polls
- Manage user access for each poll
- Real-time vote updates

**Create Poll:**
- Add poll question
- Add multiple answer options
- Select allowed users
- Instant creation feedback

**Edit Poll:**
- Modify question and options
- Update allowed users
- Real-time validation

**Manage Users:**
- View all users
- Toggle user access to specific polls
- Real-time updates

### User Dashboard

**Features:**
- View assigned polls only
- Vote on polls
- See real-time results
- Vote confirmation feedback
- Cannot vote multiple times on same poll

### Components

#### Navbar
- User information display
- Role badge (Admin/User)
- Logout functionality
- Responsive design

#### PollCard
- Poll question display
- Voting interface
- Poll actions (Edit/Delete for Admin)
- User management button
- Responsive layout

#### PollResults
- Visual representation of votes
- Percentage calculations
- Vote count display
- Real-time updates via WebSocket

#### Modals
- CreatePollModal: Create new polls
- EditPollModal: Edit existing polls
- ManageAllowedUsersModal: Manage user access

### Real-time Updates

The application uses Socket.IO for real-time features:

```typescript
// Connection with JWT authentication
const socket = io(API_URL, {
  auth: { token: getToken() }
});

// Listen for poll updates
socket.on('pollUpdated', (updatedPoll) => {
  // Update UI with new poll data
});
```

### API Integration

#### Authentication API
```typescript
// Login
POST /auth/login
{
  "email": "user@example.com",
  "password": "password123"
}

// Register
POST /auth/register
{
  "email": "user@example.com",
  "password": "password123",
  "username": "username"
}
```

#### Polls API
```typescript
// Get all polls
GET /polls

// Create poll
POST /polls
{
  "question": "Poll question?",
  "options": [{ "text": "Option 1" }],
  "allowedUsers": ["userId1"]
}

// Vote on poll
POST /polls/:id/vote
{
  "optionIndex": 0
}

// Update poll
PATCH /polls/:id
{
  "question": "Updated question?",
  "options": [{ "text": "New option" }]
}

// Delete poll
DELETE /polls/:id

// Update allowed users
PATCH /polls/:id/allowed-users
{
  "allowedUsers": ["userId1", "userId2"]
}
```

## Styling

The application uses Tailwind CSS with custom configurations:

- **Color Scheme**: Clean, professional design
- **Typography**: System font stack for optimal performance
- **Responsive**: Mobile-first approach
- **Animations**: Smooth transitions and hover effects
- **Dark Mode Ready**: Can be enabled via Tailwind config

## State Management

### AuthContext
- Manages authentication state
- Stores user information
- Handles login/logout
- Provides auth methods to components

### Local Storage
- JWT token storage
- Persistent authentication
- Automatic token refresh

## Protected Routes

Uses `ProtectedRoute` component to guard authenticated pages:

```typescript
<Route
  path="/admin"
  element={
    <ProtectedRoute>
      <AdminDashboard />
    </ProtectedRoute>
  }
/>
```

## Error Handling

- API error interceptors
- User-friendly error messages
- Automatic token refresh on 401
- Network error handling
- Form validation errors

## Security Features

- JWT token-based authentication
- Secure token storage
- Automatic token expiration handling
- Protected routes
- Role-based access control
- XSS protection via React

## Default Test Accounts

**Admin Account:**
- Email: `admin@example.com`
- Password: `admin123`

**User Accounts:**
- Email: `user1@example.com` / `user2@example.com` / `user3@example.com`
- Password: `user123`

## Development Tools

### Linting
```bash
npm run lint
```

### Type Checking
```bash
npx tsc --noEmit
```

## AI-Assisted Development

This frontend was developed with assistance from **GitHub Copilot**, which helped with:

- Generating React component boilerplate
- Creating TypeScript interfaces and types
- Implementing form validation logic
- Suggesting React hooks patterns
- Auto-completing API client methods
- Generating Tailwind CSS classes
- Creating responsive layouts
- Implementing WebSocket event handlers
- Suggesting error handling patterns
- Optimizing component re-renders

GitHub Copilot significantly improved development speed by providing intelligent suggestions for React best practices, TypeScript type safety, and modern frontend patterns. It helped maintain consistent code style and suggested efficient state management solutions.

## Build and Deployment

### Production Build
```bash
npm run build
```

Output will be in the `dist` directory.

### Environment-specific Builds

For different environments, create separate `.env` files:

- `.env.development` - Development environment
- `.env.production` - Production environment
- `.env.staging` - Staging environment

### Deployment Options

#### Static Hosting
Deploy the `dist` folder to:
- Vercel
- Netlify
- GitHub Pages
- AWS S3 + CloudFront
- Firebase Hosting

#### With Backend
The backend can serve the frontend:
1. Build the frontend: `npm run build`
2. Backend serves from `dist` folder

### Docker Support

Create a `Dockerfile`:

```dockerfile
FROM node:18-alpine as build

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

Build and run:
```bash
docker build -t polling-frontend .
docker run -p 80:80 polling-frontend
```

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Performance Optimizations

- Code splitting with React.lazy
- Vite's optimized build process
- Tree shaking for smaller bundles
- Asset optimization
- Lazy loading of images
- Efficient re-renders with React.memo

## Troubleshooting

### Connection Issues
- Ensure backend is running
- Check API URL in `.env`
- Verify CORS settings on backend

### WebSocket Issues
- Check Socket.IO connection
- Verify JWT token is valid
- Ensure WebSocket port is not blocked

### Build Issues
- Clear node_modules and reinstall
- Check Node.js version compatibility
- Verify all dependencies are installed

## License

MIT
