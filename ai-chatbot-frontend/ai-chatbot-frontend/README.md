# AI Chatbot Frontend

A React + Next.js + Tailwind CSS frontend application for the AI Chatbot SaaS platform, featuring an embeddable chatbot widget that tenants can integrate into their websites.

## 🌟 Features


- **Embeddable Chatbot Widget**: Easy-to-integrate chat widget for any website
- **Multi-tenant Support**: Isolated configurations and data per tenant
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile devices
- **Real-time Chat**: Instant messaging with AI-powered responses
- **Customizable UI**: Tenant-specific branding, colors, and styling
- **Anonymous Sessions**: No user registration required for website visitors
- **TypeScript Support**: Full type safety and better development experience
- **Modern Tech Stack**: Built with React 19, Next.js 15, and Tailwind CSS

## 🏗 Architecture

The frontend consists of three main parts:

1. **Demo Application** (`/`): A showcase of the chatbot widget and integration guide
2. **Embeddable Widget** (`/widget.js`): Standalone JavaScript widget for third-party websites
3. **Embed Page** (`/embed/[tenant]`): Iframe-loaded chat interface for the widget

### Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── page.tsx           # Demo homepage
│   ├── embed/[tenant]/    # Embedded chat interface for iframe
│   └── integration/       # Integration documentation
├── components/            # React components
│   └── ChatbotWidget/     # Chatbot widget components
├── hooks/                 # Custom React hooks
│   └── useChatbot.ts      # Main chatbot logic hook
├── lib/                   # Utility libraries
│   └── api.ts             # API client for backend communication
└── types/                 # TypeScript type definitions
    └── chatbot.ts         # Chatbot-related types
```

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm
- Running AI Chatbot Backend (see [backend README](../AI.Chatbot.BackEnd/README.md))

### Installation

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Configure environment:**
   ```bash
   # Copy .env.local file and update API URL if needed
   # Default: NEXT_PUBLIC_API_URL=http://localhost:3000/api/v1
   ```

3. **Start development server:**
   ```bash
   npm run dev
   ```

4. **Open your browser:**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🔧 Configuration

### Environment Variables

Create a `.env.local` file in the root directory:

```env
NEXT_PUBLIC_API_URL=http://localhost:3000/api/v1
```

### Backend Connection

Ensure your backend API is running on the specified URL. The frontend will:
- Fetch tenant configurations from `/public/chat/config/:tenantSlug`
- Initialize chat sessions via `/public/chat/session`
- Send messages to `/public/chat/session/:sessionToken/message`

### Widget Integration Flow

1. Tenant website includes `widget.js` with configuration
2. Widget creates a floating chat button on the page
3. When clicked, widget loads an iframe pointing to `/embed/[tenant]`
4. The embed page renders the full ChatbotWidget React component
5. Chat component connects to backend API for real-time messaging

## 📱 Widget Integration

### For Website Owners

To embed the chatbot widget on your website:

1. **Add configuration script** (in `<head>`):
   ```html
   <script>
     window.AIChatbotConfig = {
       tenant: 'your-tenant-slug',
       apiUrl: 'https://your-chatbot-api.com/api'
     };
   </script>
   ```

2. **Load widget script** (before `</body>`):
   ```html
   <script src="https://your-chatbot-frontend.com/widget.js" async></script>
   ```

### Configuration Options

| Option | Type | Required | Description |
|--------|------|----------|-------------|
| `tenant` | string | ✅ | Your tenant slug identifier |
| `apiUrl` | string | ❌ | Backend API base URL |
| `customCSS` | string | ❌ | Custom CSS styles for the widget |
| `onLoad` | function | ❌ | Callback when widget loads |
| `onMessage` | function | ❌ | Callback on message exchanges |
| `onError` | function | ❌ | Callback for error handling |

### Advanced Integration

```html
<script>
  window.AIChatbotConfig = {
    tenant: 'techcorp',
    apiUrl: 'https://api.example.com/api',
    customCSS: `
      .chatbot-widget {
        border-radius: 20px;
        box-shadow: 0 8px 32px rgba(0,0,0,0.2);
      }
    `,
    onLoad: function() {
      console.log('Chatbot loaded successfully');
    },
    onMessage: function(message, response) {
      // Track analytics
      gtag('event', 'chatbot_interaction', {
        'message_length': message.length,
        'response_time': response.usage.total_time
      });
    },
    onError: function(error) {
      console.error('Chatbot error:', error);
    }
  };
</script>
```

## 🎨 Customization

### Tenant-Specific Styling

Each tenant can customize their chatbot appearance through the backend configuration:

- **Colors**: Primary, secondary, text, and background colors
- **Positioning**: Bottom-right, bottom-left, top-right, top-left
- **Size**: Small, medium, large widget sizes
- **Behavior**: Auto-open, user info collection, file uploads
- **Messaging**: Welcome message, placeholder text, bot name

### Custom CSS

Add custom styles via the `customCSS` option or tenant configuration:

```css
.chatbot-widget {
  /* Widget container */
}

.chatbot-header {
  /* Header styling */
}

.chatbot-messages {
  /* Message area */
}

.chatbot-input {
  /* Input field */
}
```

## 🛠 Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build production application
- `npm run start` - Start production server
- `npm run lint` - Run ESLint for code quality

### Component Development

The chatbot widget is built with reusable components:

- **ChatbotWidget**: Main container component
- **ChatMessage**: Individual message display
- **MessageInput**: User input field with validation
- **TypingIndicator**: Shows when AI is responding
- **UserInfoForm**: Collects visitor information

### API Integration

The `useChatbot` hook manages all chatbot state and API interactions:

```typescript
const {
  isInitialized,
  isLoading,
  config,
  messages,
  sendMessage,
  initialize
} = useChatbot({
  tenantSlug: 'your-tenant',
  apiUrl: 'https://api.example.com/api',
  onMessage: (message, response) => {
    // Handle message events
  }
});
```

## 📚 API Reference

### Backend Endpoints

The frontend communicates with these backend endpoints:

- `GET /public/chat/config/:tenantSlug` - Get tenant configuration
- `POST /public/chat/session` - Initialize chat session
- `POST /public/chat/session/:token/message` - Send message
- `GET /public/chat/session/:token/messages` - Get message history
- `POST /public/chat/session/:token/end` - End session

### Type Definitions

Core TypeScript interfaces:

```typescript
interface ChatbotConfig {
  chatbotName: string;
  welcomeMessage: string;
  primaryColor: string;
  widgetPosition: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
  // ... other configuration options
}

interface ChatSession {
  sessionId: string;
  sessionToken: string;
  tenantSlug: string;
  visitorId: string;
}

interface ChatMessage {
  id: number;
  role: 'visitor' | 'assistant';
  content: string;
  createdAt: string;
}
```

## 🚀 Deployment

### Production Build

1. **Build the application:**
   ```bash
   npm run build
   ```

2. **Start production server:**
   ```bash
   npm start
   ```

### Environment Setup

For production deployment:

1. Update `NEXT_PUBLIC_API_URL` to your production backend
2. Configure CORS on the backend to allow your frontend domain
3. Ensure HTTPS is enabled for secure widget loading
4. Set up proper CDN for the `widget.js` file

### Docker Deployment (Optional)

```dockerfile
FROM node:18-alpine

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

EXPOSE 3000
CMD ["npm", "start"]
```

## 🧪 Testing

### Manual Testing

1. Start both backend and frontend servers
2. Open [http://localhost:3000](http://localhost:3000)
3. Click the chat icon to test the widget
4. Try different tenant configurations in the backend

### Integration Testing

Test the widget on a separate HTML page:

```html
<!DOCTYPE html>
<html>
<head>
  <title>Widget Test</title>
  <script>
    window.AIChatbotConfig = {
      tenant: 'techcorp',
      apiUrl: 'http://localhost:3000/api/v1'
    };
  </script>
</head>
<body>
  <h1>Test Page</h1>
  <script src="http://localhost:3001/widget.js"></script>
</body>
</html>
```

## 🐛 Troubleshooting

### Common Issues

1. **Widget not appearing**: Check browser console for JavaScript errors
2. **API connection failed**: Verify backend is running and accessible
3. **CORS errors**: Configure backend to allow your frontend domain
4. **Tenant not found**: Ensure tenant slug exists and is active in backend
5. **"Widget is loading..." message**: This issue has been fixed. The widget now loads the actual React chat interface via iframe at `/embed/[tenant]`
6. **Iframe not loading**: Check that your Next.js frontend is running and accessible from the tenant website

### Debug Mode

Enable debug logging by adding to widget configuration:

```javascript
window.AIChatbotConfig = {
  tenant: 'your-tenant',
  debug: true,
  onError: function(error) {
    console.error('Chatbot Debug:', error);
  }
};
```

## 📄 License

This project is part of the AI Chatbot SaaS platform. See the main project README for licensing information.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/new-feature`
3. Make your changes and test thoroughly
4. Commit your changes: `git commit -am 'Add new feature'`
5. Push to the branch: `git push origin feature/new-feature`
6. Submit a pull request

## 📞 Support

For technical support or questions:

- Check the [Integration Guide](http://localhost:3000/integration)
- Review the backend API documentation
- Open an issue in the project repository

---

Built with ❤️ using React, Next.js, and Tailwind CSS


