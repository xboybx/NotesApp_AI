# Environment Setup & Configuration

## Required Environment Variables
Create a `.env` file in the root directory with these variables:

```env
# Database
MONGODB_URI=your_mongodb_connection_string_here

# Authentication
BETTER_AUTH_SECRET=your_secure_random_secret_here
BETTER_AUTH_URL=http://localhost:3000
NEXT_PUBLIC_APP_URL=http://localhost:3000

# AI / OpenRouter
OPENROUTER_API_KEY=your_openrouter_api_key_here
```

## Variable Descriptions

### Database Variables
- `MONGODB_URI`: MongoDB connection string
  - Local development: `mongodb://localhost:27017/notewise-ai`
  - MongoDB Atlas: `mongodb+srv://<user>:<password>@cluster.mongodb.net/notewise-ai`

### Authentication Variables
- `BETTER_AUTH_SECRET`: A secure random string for encrypting session data
  - Generate with: `openssl rand -hex 32`
  - Must be kept secret in production
- `BETTER_AUTH_URL`: The base URL of your application
  - Development: `http://localhost:3000`
  - Production: `https://your-domain.com`
- `NEXT_PUBLIC_APP_URL`: Same as BETTER_AUTH_URL, exposed to client-side code

### AI/OpenRouter Variables
- `OPENROUTER_API_KEY`: API key from OpenRouter.ai
  - Get your key from: https://openrouter.ai/keys
  - Required for all AI features to work
  - Costs: Pay-as-you-go, very affordable for development

## Installation Steps

### 1. Clone the Repository
```bash
git clone <repository-url>
cd notesapp_ai
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Set Up Environment Variables
Copy `.env.example` to `.env` and fill in all values.

### 4. Start MongoDB
- **Local**: Ensure MongoDB is running on port 27017
- **Atlas**: Ensure your IP is whitelisted and connection string is correct

### 5. Run Development Server
```bash
npm run dev
```
Visit: http://localhost:3000

### 6. Build for Production
```bash
npm run build
npm start
```

## Deployment Platforms

### Vercel (Recommended)
The app is currently deployed on Vercel: https://notes-app-ai-one.vercel.app/
- Push to GitHub, connect to Vercel
- Add all environment variables in Vercel dashboard
- Auto-deploys on every push to main branch

### Other Platforms
- Netlify: Similar to Vercel, works out of the box
- Docker: Can be containerized and deployed anywhere
- Traditional VPS: Build and run with Node.js

## Development Tools

### Recommended VS Code Extensions
- ESLint - For linting TypeScript/JavaScript
- Prettier - For code formatting
- Tailwind CSS IntelliSense - Autocomplete for Tailwind
- PostCSS Language Support - For CSS processing

### Code Quality Commands
```bash
npm run lint      # Run ESLint checks
npm run build     # Type check and build
```

## Common Setup Issues

### MongoDB Connection Errors
- Check if MongoDB is running locally
- Verify connection string is correct
- Ensure IP is whitelisted for Atlas
- Check network connectivity

### OpenRouter API Errors
- Verify API key is correct
- Check account has sufficient credits
- Ensure the model you're using is supported
- Check rate limits on OpenRouter dashboard

### Better Auth Errors
- Verify BETTER_AUTH_SECRET is long and random
- Check BETTER_AUTH_URL matches your actual domain
- Ensure cookies are enabled in the browser
- Clear browser cache if session issues persist

## Production Checklist
- [ ] All environment variables set correctly
- [ ] MongoDB is production-ready (Atlas recommended)
- [ ] OpenRouter API key has sufficient credits
- [ ] BETTER_AUTH_SECRET is secure and unique
- [ ] HTTPS is enabled in production
- [ ] All images and assets are optimized
- [ ] Database indexes are created
- [ ] Error monitoring is set up