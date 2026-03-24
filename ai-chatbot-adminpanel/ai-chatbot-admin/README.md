# AI Chatbot Admin Panel

A modern, feature-rich admin panel built with Next.js 15, React 19, TypeScript, and Tailwind CSS for managing the AI Chatbot SaaS platform.

## 🚀 Features

### Core Functionality
- **Dashboard** - Real-time statistics, charts, and activity monitoring
- **Tenant Management** - Create, update, suspend, and manage all tenants
- **User Management** - Manage users across all tenants with role-based access control
- **Document Management** - View, filter, and reprocess uploaded documents
- **Chatbot Configuration** - Configure public chatbot widget appearance and behavior for each tenant
- **Widget Integration** - Copy-paste ready code snippets for HTML, React, Next.js integration
- **API Key Management** - Generate, view, and revoke API keys for tenants
- **Analytics & Usage** - Track usage metrics, costs, and performance
- **System Health** - Monitor system status, uptime, and service health

### Technical Features
- **Modern UI/UX** - Clean, responsive design with Tailwind CSS
- **Type-Safe** - Full TypeScript support throughout the application
- **State Management** - Zustand for efficient state management with persistence
- **API Client** - Centralized API client with authentication and error handling
- **Real-time Data** - Auto-refreshing dashboards and health monitoring
- **Charts & Visualizations** - Interactive charts using Recharts library
- **Responsive Design** - Mobile-first approach, works on all screen sizes

## 📋 Prerequisites

- Node.js 20.x or higher
- npm 10.x or higher
- AI Chatbot Backend API running (default: http://localhost:3000)

## 🛠️ Installation

1. **Navigate to the project directory**
   ```bash
   cd ai-chatbot-admin
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   ```bash
   cp .env.example .env.local
   ```

   Edit `.env.local`:
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:3000
   NEXT_PUBLIC_API_TIMEOUT=30000
   NEXT_PUBLIC_APP_NAME=AI Chatbot Admin
   NEXT_PUBLIC_APP_VERSION=1.0.0
   ```

4. **Run the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to [http://localhost:3001](http://localhost:3001) (or the port shown in terminal)

## 📁 Project Structure

```
ai-chatbot-admin/
├── app/                          # Next.js App Router pages
│   ├── api-keys/                 # API key management page
│   ├── analytics/                # Analytics and usage metrics page
│   ├── chatbot-config/           # Chatbot configuration page
│   ├── dashboard/                # Main dashboard page
│   ├── documents/                # Document management page
│   ├── login/                    # Authentication page
│   ├── system-health/            # System health monitoring page
│   ├── tenants/                  # Tenant management page
│   ├── users/                    # User management page
│   ├── widget-integration/       # Widget code and integration guide
│   ├── layout.tsx                # Root layout
│   ├── page.tsx                  # Home page (redirects)
│   └── globals.css               # Global styles
├── components/                   # React components
│   ├── dashboard/                # Dashboard-specific components
│   ├── layout/                   # Layout components
│   └── ui/                       # Reusable UI components
├── lib/                          # Utility libraries
│   └── api-client.ts             # Centralized API client
├── store/                        # State management (Zustand)
│   └── auth-store.ts             # Authentication state
├── types/                        # TypeScript type definitions
│   └── index.ts                  # All type definitions
├── .env.example                  # Environment variables template
├── package.json                  # Project dependencies
├── tailwind.config.ts            # Tailwind CSS configuration
├── tsconfig.json                 # TypeScript configuration
└── README.md                     # This file
```

## 🔧 Tech Stack

### Core Technologies
- **Next.js 15** - React framework with App Router
- **React 19** - UI library
- **TypeScript 5** - Type-safe JavaScript
- **Tailwind CSS 4** - Utility-first CSS framework

### Key Libraries
- **axios** - HTTP client for API requests
- **zustand** - Lightweight state management
- **recharts** - Charting library
- **lucide-react** - Icon library
- **date-fns** - Date formatting

## 🔐 Authentication

The admin panel uses JWT-based authentication:

1. **Login** - POST `/auth/login` with email and password
2. **Token Storage** - JWT token stored in localStorage
3. **Auto-Redirect** - Unauthorized users redirected to login
4. **Token Validation** - Automatic token validation on app load

## 📡 API Integration

The API client (`lib/api-client.ts`) provides type-safe methods for all backend endpoints:

- Authentication APIs
- Dashboard statistics
- Tenant management (CRUD operations)
- User management
- Document management
- Chatbot configuration
- API key management
- Analytics and usage metrics
- System health monitoring

All API calls automatically include the JWT token and handle errors appropriately.

## 🎯 Pages Overview

### Dashboard (`/dashboard`)
- System-wide statistics cards
- Weekly activity charts
- Tenant distribution visualization
- Recent activity feed

### Tenants (`/tenants`)
- Paginated tenant list
- Search and filter by status
- Create new tenants
- Update tenant details
- Suspend/activate tenants

### Users (`/users`)
- Paginated user list
- Filter by role and status
- Search by email or name
- View user activity

### Documents (`/documents`)
- View all uploaded documents
- Filter by status
- Reprocess failed documents
- View document metadata

### Chatbot Configuration (`/chatbot-config`)
- Select tenant
- Configure widget appearance
- Set behavior options
- Customize messages and colors

### Widget Integration (`/widget-integration`)
- Copy integration code snippets
- Basic HTML, React, Next.js examples
- Advanced configuration with callbacks
- Test configuration endpoint
- Step-by-step integration guide

### API Keys (`/api-keys`)
- Select tenant
- Generate new API keys
- View key usage statistics
- Revoke keys

### Analytics (`/analytics`)
- Usage metrics and trends
- Token usage charts
- Performance statistics
- Filter by time period

### System Health (`/system-health`)
- Real-time system status
- Service health checks
- Memory usage statistics
- Auto-refresh every 30 seconds

## 🚀 Development

### Run Development Server
```bash
npm run dev
```

### Build for Production
```bash
npm run build
```

### Start Production Server
```bash
npm start
```

### Type Checking
```bash
npm run typecheck  # Note: may need to add this script to package.json
```

### Linting
```bash
npm run lint
```

## 📊 State Management

The app uses Zustand for lightweight state management:

### Auth Store (`store/auth-store.ts`)
- User authentication state
- Login/logout functionality
- Persisted to localStorage
- Auto-restore on app load

## 🎨 Customization

### Adding New Pages
1. Create new folder in `app/` directory
2. Add `page.tsx` with your component
3. Update sidebar navigation in `components/layout/Sidebar.tsx`
4. Add API methods in `lib/api-client.ts` if needed
5. Add types in `types/index.ts`

### Styling
- Tailwind classes in components
- Global styles in `app/globals.css`
- Theme colors in component files

## 🐛 Troubleshooting

### API Connection Issues
- Verify backend is running at configured URL
- Check CORS settings on backend
- Ensure correct API URL in `.env.local`

### Authentication Issues
- Clear localStorage and try logging in again
- Verify JWT token format and expiration
- Check backend authentication endpoints

### Build Errors
- Run `npm install` to ensure all dependencies
- Delete `.next` folder and rebuild
- Check for TypeScript errors

## 📝 Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `NEXT_PUBLIC_API_URL` | Backend API URL | `http://localhost:3000` |
| `NEXT_PUBLIC_API_TIMEOUT` | API request timeout (ms) | `30000` |
| `NEXT_PUBLIC_APP_NAME` | Application name | `AI Chatbot Admin` |
| `NEXT_PUBLIC_APP_VERSION` | Application version | `1.0.0` |

## 🔒 Security Considerations

1. **Environment Variables** - Never commit `.env.local`
2. **Token Storage** - Consider httpOnly cookies for production
3. **CORS** - Configure backend to allow admin domain
4. **HTTPS** - Always use HTTPS in production
5. **Input Validation** - Validate all inputs on frontend and backend

## 🎯 Roadmap

Future enhancements:
- [ ] Real-time notifications with WebSocket
- [ ] Advanced filtering and sorting
- [ ] Export data to CSV/Excel
- [ ] Dark mode support
- [ ] Mobile app version
- [ ] Automated testing suite
- [ ] Multi-language support

## 📚 Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [React Documentation](https://react.dev)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [TypeScript Documentation](https://www.typescriptlang.org/docs)

---

Built with ❤️ using Next.js 15 and React 19
