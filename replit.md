# RestaurantAI - Intelligent Staff Scheduling System

## Overview

RestaurantAI is a modern web application designed to optimize restaurant staff scheduling using AI-powered demand forecasting and intelligent recommendations. The system helps restaurant managers make data-driven decisions about staffing, reduce labor costs, and improve operational efficiency through predictive analytics.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter for client-side routing
- **State Management**: TanStack Query (React Query) for server state management
- **UI Framework**: Shadcn/ui components built on Radix UI primitives
- **Styling**: Tailwind CSS with custom CSS variables for theming
- **Build Tool**: Vite with hot module replacement (HMR)

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ES modules
- **Data Layer**: Drizzle ORM with PostgreSQL (Neon Database)
- **Storage Pattern**: Repository pattern with in-memory fallback storage
- **API Design**: RESTful endpoints with JSON responses

### Key Components

#### Data Models
- **Staff**: Employee information including availability, skills, and hourly rates
- **Shifts**: Scheduled work periods with status tracking
- **Demand Forecasts**: AI-generated predictions for customer demand
- **Schedule Templates**: Reusable scheduling patterns
- **AI Recommendations**: System-generated optimization suggestions

#### Core Features
1. **Smart Scheduling**: AI-powered shift optimization based on demand forecasts
2. **Staff Management**: Complete CRUD operations for employee data
3. **Analytics Dashboard**: Real-time metrics and performance insights
4. **AI Predictions**: Machine learning-based demand forecasting
5. **Settings Management**: Configurable business rules and preferences

## Data Flow

### Client-Server Communication
1. Client makes HTTP requests to Express.js API endpoints
2. Server validates requests using Zod schemas
3. Data is processed through storage layer (in-memory or database)
4. Responses are returned as JSON with proper error handling
5. Client updates UI using React Query for cache management

### AI Processing Pipeline
1. Historical demand data is analyzed for patterns
2. Seasonal adjustments and trend analysis are applied
3. Staff requirements are calculated based on predicted demand
4. Optimization algorithms generate scheduling recommendations
5. Confidence scores are assigned to predictions

### Real-time Updates
- Client queries are cached and automatically revalidated
- Mutations trigger cache invalidation for affected data
- Toast notifications provide user feedback for actions
- Loading states maintain responsive UI during operations

## External Dependencies

### Core Libraries
- **React Ecosystem**: React 18, React DOM, React Hook Form
- **State Management**: TanStack Query for server state
- **UI Components**: Radix UI primitives with Shadcn/ui wrapper
- **Styling**: Tailwind CSS with PostCSS processing
- **Validation**: Zod for runtime type validation
- **Date Handling**: date-fns for date operations

### Database Integration
- **ORM**: Drizzle ORM for type-safe database operations
- **Database**: PostgreSQL via Neon serverless database
- **Migrations**: Drizzle Kit for schema management
- **Connection**: @neondatabase/serverless for connection pooling

### Development Tools
- **Build System**: Vite with React plugin
- **Type Checking**: TypeScript with strict configuration
- **Development Server**: Express with Vite middleware in development
- **Error Handling**: Custom error overlay for development

## Deployment Strategy

### Build Process
1. **Frontend Build**: Vite compiles React app to static assets
2. **Backend Build**: esbuild bundles Express server with external packages
3. **Assets**: Static files are output to `dist/public` directory
4. **Server**: Compiled server code is output to `dist/index.js`

### Environment Configuration
- **Development**: Uses Vite dev server with Express middleware
- **Production**: Serves static files from Express server
- **Database**: PostgreSQL connection via environment variable
- **Session Storage**: Connect-pg-simple for PostgreSQL session store

### Hosting Requirements
- Node.js runtime environment
- PostgreSQL database (Neon recommended)
- Environment variables for database connection
- Static file serving capability

### Database Setup
- Run `npm run db:push` to apply schema changes
- Database migrations are handled by Drizzle Kit
- Schema is defined in `shared/schema.ts` for type safety
- Supports both development and production database configurations

The application follows a monorepo structure with shared types and schemas, enabling full-stack type safety and consistent data models across client and server components.