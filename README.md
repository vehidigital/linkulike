# Linkulike - Bio Link Platform

A modern, feature-rich bio link platform built with Next.js 14, TypeScript, and Prisma. Create beautiful, customizable bio link pages that showcase all your important links in one place.

## ✨ Features

### 🎨 Design & Customization
- **Beautiful Themes**: Choose from dozens of stunning pre-built themes
- **Custom Design**: Create your own with our intuitive theme editor
- **Color & Typography**: Full control over colors, fonts, and styling
- **Mobile Optimized**: Perfect on every device

### 🔗 Link Management
- **Drag & Drop**: Reorder links with intuitive drag and drop
- **Rich Icons**: 20+ social media and custom icons
- **Link Analytics**: Track clicks and engagement
- **Active/Inactive**: Toggle links on and off

### 📊 Analytics & Insights
- **Click Tracking**: Monitor which links perform best
- **Visual Charts**: Beautiful analytics dashboard
- **Performance Metrics**: Understand your audience
- **Export Data**: Download your analytics

### 🚀 Performance & Security
- **Lightning Fast**: Built with Next.js 14 for optimal performance
- **SEO Optimized**: Meta tags and Open Graph support
- **Secure**: NextAuth.js authentication
- **Database**: PostgreSQL with Prisma ORM

## 🛠️ Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Database**: PostgreSQL
- **ORM**: Prisma
- **Authentication**: NextAuth.js
- **Styling**: Tailwind CSS
- **UI Components**: Radix UI + shadcn/ui
- **Icons**: Lucide React
- **Deployment**: Vercel (recommended)

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ 
- PostgreSQL database
- npm or yarn

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/linkulike.git
cd linkulike
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Set Up Environment Variables

Copy the example environment file and configure it:

```bash
cp env.example .env.local
```

Update `.env.local` with your configuration:

```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/linkulike"

# NextAuth.js
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key-here"

# App Configuration
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

### 4. Set Up Database

```bash
# Generate Prisma client
npx prisma generate

# Run database migrations
npx prisma db push

# (Optional) Seed the database
npx prisma db seed
```

### 5. Start Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the application.

## 📁 Project Structure

```
linkulike/
├── app/                    # Next.js App Router
│   ├── (auth)/            # Authentication routes
│   ├── (public)/          # Public routes
│   ├── api/               # API routes
│   └── dashboard/         # Dashboard pages
├── components/            # React components
│   ├── dashboard/         # Dashboard components
│   ├── profile/           # Profile components
│   └── ui/               # UI components (shadcn/ui)
├── lib/                  # Utility functions
├── prisma/               # Database schema and migrations
├── types/                # TypeScript type definitions
└── hooks/                # Custom React hooks
```

## 🎯 Key Features Explained

### Dashboard
The dashboard provides a comprehensive interface for managing your bio links:

- **Link Management**: Add, edit, delete, and reorder links
- **Profile Settings**: Customize your profile information
- **Theme Editor**: Design your bio link page
- **Analytics**: View performance metrics

### Public Profile Pages
Each user gets a beautiful public profile page at `/{username}`:

- **Responsive Design**: Looks great on all devices
- **Custom Themes**: Apply your chosen theme
- **Click Tracking**: Automatically tracks link clicks
- **Social Sharing**: Easy sharing functionality

### API Routes
RESTful API endpoints for all functionality:

- `GET/POST/PUT /api/links` - Link management
- `GET/PUT /api/user/profile` - Profile management
- `POST /api/links/[id]/click` - Click tracking

## 🎨 Customization

### Themes
The platform includes several built-in themes:
- Default (Gradient)
- Dark Mode
- Light Mode
- Sunset
- Ocean
- Forest

### Custom Themes
Create your own themes by customizing:
- Background colors and gradients
- Button styles and colors
- Text colors
- Font families

## 📊 Analytics

Track your bio link performance with:
- Total clicks per link
- Click trends over time
- Top performing links
- Recent activity

## 🔒 Security

- **Authentication**: Secure login with NextAuth.js
- **Authorization**: User-specific data access
- **Input Validation**: Zod schema validation
- **SQL Injection Protection**: Prisma ORM
- **XSS Protection**: React's built-in protection

## 🚀 Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Set environment variables in Vercel dashboard
4. Deploy!

### Other Platforms

The app can be deployed to any platform that supports Next.js:
- Netlify
- Railway
- DigitalOcean App Platform
- AWS Amplify

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

If you need help or have questions:

- Create an issue on GitHub
- Check the documentation
- Join our community

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/) - The React framework
- [Prisma](https://prisma.io/) - Database toolkit
- [NextAuth.js](https://next-auth.js.org/) - Authentication
- [Tailwind CSS](https://tailwindcss.com/) - CSS framework
- [shadcn/ui](https://ui.shadcn.com/) - UI components
- [Radix UI](https://www.radix-ui.com/) - Headless UI primitives

---

Made with ❤️ by the Linkulike team 