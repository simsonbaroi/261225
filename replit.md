# Hospital Bill Calculator

## Overview
A professional medical billing calculator application for hospitals and clinics. It enables calculation of bills for outpatient and inpatient services, with comprehensive database management for medical items and procedures. The project aims to provide a robust, secure, and user-friendly solution for medical billing, including advanced features like AI-powered analytics for cost prediction and billing optimization, and a cross-platform presence with a native mobile application.

## User Preferences
- Language: English
- Technical Level: Non-technical user interface
- Focus: Professional medical billing accuracy
- Currency: Bangladeshi Taka (৳)
- Color Scheme: Professional-level dark theme with glass morphism effects
- UI Design: Glass cards with backdrop blur, neo-morphic shadows, and emerald accents
- UI Layout: Grid button layout for categories (6 buttons per row preferred)
- Button Style: Left-aligned text, rounded corners, enhanced shadows and hover effects
- Navigation: Dark gradient header with glass effects and emerald accents
- Total Section: Dark green color scheme with emerald gradient background

## System Architecture
**Web Frontend:** React with TypeScript, utilizing shadcn/ui components and wouter for routing.
**Mobile Frontend:** React Native with TypeScript, React Navigation, and React Native Paper, structured for native Android development.
**Backend:** Express.js server with an in-memory storage system (`MemoryStorage` class) for Replit compatibility.
**API:** Comprehensive REST API supporting medical items and bills management.
**Web Styling:** Tailwind CSS, implementing a consistent dark green medical theme with glass morphism effects and professional contrast ratios.
**Mobile Styling:** React Native Paper, featuring a custom medical theme and glass morphism effects.
**Data Management:** TanStack Query for web application state management, AsyncStorage for mobile data caching, and in-memory storage for core persistence.
**Core Functionality:**
- Outpatient and Inpatient bill calculation with extensive categories (10+ for outpatient, 19+ for inpatient, including daily rates).
- Dynamic manual entry systems for various categories (e.g., Blood, Limb and Brace) with auto-expanding rows and batch "Add All to Bill" functionality.
- Advanced search and dropdown functionalities (e.g., Laboratory, X-Ray, Orthopedic, Surgery, Procedures) with tag selection, keyboard navigation, real-time price counters, and intelligent duplicate prevention.
- Comprehensive medicine dosage system with manual entry, medication types, frequency selection, and calculated quantities, differentiating between outpatient (full bottles) and inpatient (partial/full bottles) rules.
- Patient information management for inpatient services, including admission/discharge dates, calculated admitted days, and collapsible sections.
- Categorized bill summary display with individual item removal, category totals, and grand total calculation.
- Responsive design across web and mobile platforms, including touch/swipe gestures for carousel navigation.
- AI and Machine Learning integration for medical billing analytics, including cost prediction, demand forecasting, billing optimization, and fraud detection, with an analytics dashboard.

## Recent Changes
- **2025-02-01**: PREPARED: Complete GitHub open source preparation with comprehensive documentation, deployment guides, Docker support, and CI/CD workflows
- **2025-02-01**: ENHANCED: Inpatient Registration Fees now includes same options as Outpatient (Outpatient Registration ₹100, Emergency Registration ₹200, Admission Fee ₹500, ICU Admission ₹1000, plus existing room fees)
- **2025-02-01**: COMPLETED: Project migration from Replit Agent to standard Replit environment with full functionality restored

## GitHub Open Source Preparation
- **Documentation**: Comprehensive README.md, API documentation, deployment guides, and contributing guidelines
- **Legal**: MIT License for open source distribution
- **CI/CD**: GitHub Actions workflows for automated testing and deployment to Railway/Render
- **Docker**: Full containerization support with Dockerfile and docker-compose.yml
- **Development**: Complete .gitignore, issue templates, and development setup guides
- **Deployment Options**: Multiple platform support (Railway, Render, Vercel, Docker) with detailed guides

## External Dependencies
- **Replit Environment:** Standard Replit platform for deployment and execution.
- **Node.js/npm:** For dependency management and runtime environment.