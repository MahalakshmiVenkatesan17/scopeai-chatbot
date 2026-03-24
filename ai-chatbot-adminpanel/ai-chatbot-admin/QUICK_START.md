# Quick Start Guide - AI Chatbot Admin Panel

## 🚀 Get Started in 5 Minutes

### Step 1: Install Dependencies
```bash
cd "E:\AI Chatbot\ai-chatbot-admin"
npm install
```

### Step 2: Configure Environment
```bash
cp .env.example .env.local
```

Edit `.env.local` if your backend runs on a different port:
```env
NEXT_PUBLIC_API_URL=http://localhost:3000
```

### Step 3: Start Development Server
```bash
npm run dev
```

### Step 4: Open in Browser
Navigate to: **http://localhost:3001** (or the port shown in your terminal)

### Step 5: Login
Use your super admin credentials configured in the backend.

## 📋 What You Get

### Pages Available:
- **Dashboard** - `/dashboard` - System overview and statistics
- **Tenants** - `/tenants` - Manage all tenants
- **Users** - `/users` - Manage all users
- **Documents** - `/documents` - View and manage documents
- **Chatbot Config** - `/chatbot-config` - Configure chatbot widgets
- **API Keys** - `/api-keys` - Manage tenant API keys
- **Analytics** - `/analytics` - Usage metrics and charts
- **System Health** - `/system-health` - Monitor system status

## 🔧 Common Commands

```bash
# Development
npm run dev          # Start dev server

# Production
npm run build        # Build for production
npm start            # Start production server

# Linting
npm run lint         # Run ESLint
```

## 🐛 Troubleshooting

### Backend Connection Issues
1. Ensure backend is running: `http://localhost:3000`
2. Check `.env.local` has correct `NEXT_PUBLIC_API_URL`
3. Verify CORS is configured on backend to allow admin panel

### Login Issues
1. Check backend authentication endpoints are working
2. Verify super admin user exists in backend database
3. Clear localStorage: `localStorage.clear()` in browser console

### Build Errors
1. Delete `.next` folder: `rm -rf .next`
2. Reinstall dependencies: `rm -rf node_modules && npm install`
3. Run build again: `npm run build`

## 📚 Learn More

- Full Documentation: `README.md`
- Backend API Integration: Check `lib/api-client.ts`
- Type Definitions: Check `types/index.ts`
- Add New Pages: See README.md → Customization section

## 🎯 Next Steps

1. ✅ Start the application
2. ✅ Login with admin credentials
3. ✅ Explore the dashboard
4. ✅ Try creating a test tenant
5. ✅ Configure a chatbot for that tenant
6. ✅ Generate an API key
7. ✅ Monitor system health

## 💡 Tips

- All data is fetched from the backend API
- JWT token is stored in localStorage
- Logout clears the token automatically
- Charts update automatically when data changes
- Search and filters work in real-time

## 🚀 Deploy to Production

1. Set production environment variables
2. Build the application: `npm run build`
3. Start production server: `npm start`
4. Configure reverse proxy (nginx/Apache)
5. Use HTTPS in production
6. Set proper CORS on backend

---

**Need Help?** Check the full `README.md` for detailed documentation.
