# Hospital Bill Calculator

A professional medical billing calculator application for hospitals and clinics. This open-source project enables calculation of bills for outpatient and inpatient services, with comprehensive database management for medical items and procedures.

## Features

- **Outpatient Services**: Complete billing system with 10+ categories
- **Inpatient Services**: Advanced billing with 19+ categories including daily rates
- **Medicine Management**: Comprehensive dosage system with frequency calculations
- **Patient Information**: Admission/discharge tracking with automated day calculations
- **Database Management**: Full CRUD operations for medical items and procedures
- **AI Analytics**: Cost prediction, demand forecasting, and billing optimization
- **Responsive Design**: Works on desktop and mobile devices
- **Glass Morphism UI**: Professional dark theme with emerald accents

## Technology Stack

- **Frontend**: React with TypeScript, Tailwind CSS, shadcn/ui components
- **Backend**: Express.js with REST API
- **Database**: SQLite with Drizzle ORM
- **State Management**: TanStack Query
- **Routing**: Wouter
- **Styling**: Glass morphism effects with professional medical theme

## 🚀 Live Demo

**Try the application live:** [Coming Soon - Deploy to see live demo]

## Quick Start

### Prerequisites

- Node.js 18 or higher
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/hospital-bill-calculator.git
cd hospital-bill-calculator
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser and navigate to `http://localhost:5000`

### One-Click Deploy

Deploy instantly to these platforms:

[![Deploy to Railway](https://railway.app/button.svg)](https://railway.app/new/template)
[![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com/deploy)

### Building for Production

```bash
npm run build
npm start
```

## Project Structure

```
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/          # Application pages
│   │   ├── hooks/          # Custom React hooks
│   │   └── lib/            # Utility functions
├── server/                 # Express.js backend
│   ├── routes.ts           # API routes
│   ├── storage.ts          # Database operations
│   └── aiRoutes.ts         # AI analytics endpoints
├── shared/                 # Shared types and schemas
├── mobile/                 # React Native mobile app
└── docs/                   # Documentation
```

## API Endpoints

### Medical Items
- `GET /api/medical-items` - Get all medical items
- `POST /api/medical-items` - Create new medical item
- `PUT /api/medical-items/:id` - Update medical item
- `DELETE /api/medical-items/:id` - Delete medical item

### Bills
- `GET /api/bills` - Get all bills
- `POST /api/bills` - Create new bill
- `PUT /api/bills/:id` - Update bill
- `DELETE /api/bills/:id` - Delete bill

### AI Analytics
- `POST /api/ai/predict-cost` - Predict treatment costs
- `POST /api/ai/analyze-trends` - Analyze billing trends
- `POST /api/ai/optimize-billing` - Get billing optimization suggestions

## Deployment Options

### Option 1: Full-Stack Deployment (Recommended)
Deploy to platforms that support both frontend and backend:
- **Replit**: One-click deployment with database support
- **Railway**: Full-stack hosting with PostgreSQL
- **Render**: Free tier with database support
- **Vercel**: With serverless functions

### Option 2: Split Deployment
- **Frontend**: GitHub Pages, Netlify, Vercel
- **Backend**: Railway, Render, Heroku alternatives
- **Database**: PlanetScale, Neon, Supabase

### Option 3: Docker Deployment
```bash
docker build -t hospital-bill-calculator .
docker run -p 5000:5000 hospital-bill-calculator
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

For support, please open an issue on GitHub or contact the maintainers.

## Acknowledgments

- Built with modern web technologies for optimal performance
- Designed for professional medical billing environments
- Optimized for Bangladeshi healthcare system with Taka currency support

---

**Note**: This application is designed for medical billing purposes. Please ensure compliance with local healthcare regulations and data privacy laws when deploying in production environments.