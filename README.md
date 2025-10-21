# Coffee Event App

A production-ready Next.js web application for managing a 2-day coffee event with role-based access for Edecanes (attendee registration) and Baristas (queue management).

## Features

### 🎯 Role-Based Access

- **Edecanes**: Register attendees and create coffee orders
- **Baristas**: Manage live queue, update order statuses, send WhatsApp notifications
- **Admin**: View all orders and export data to CSV

### ☕ Order Management

- Complete order lifecycle: Queued → In Progress → Ready → Delivered
- Unique 4-digit pickup codes for each order
- Real-time queue updates with 5-second polling
- WhatsApp integration for ready notifications

### 🔒 Security

- Passcode-based authentication
- HTTP-only cookies with JWT tokens
- Row-level security in Supabase
- Server-side API routes only

## Tech Stack

- **Frontend**: Next.js 14 (App Router), TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: Supabase (PostgreSQL)
- **Authentication**: JWT with HTTP-only cookies
- **Deployment**: Vercel-ready

## Quick Start

### 1. Environment Setup

Copy the environment file and configure your variables:

```bash
cp .env.example .env.local
```

Update `.env.local` with your values:

```env
# Supabase Configuration
SUPABASE_URL=your_supabase_url_here
SUPABASE_SERVICE_KEY=your_supabase_service_key_here

# Authentication Passcodes
REGISTER_PASSCODE=register123
BAR_PASSCODE=bar123

# Cookie Secret (generate with: openssl rand -base64 32)
COOKIE_SECRET=your_cookie_secret_here
```

### 2. Database Setup

Run the SQL schema in your Supabase SQL editor:

```sql
-- See database-schema.sql for the complete schema
```

### 3. Install Dependencies

```bash
npm install
```

### 4. Development

```bash
npm run dev
```

Visit `http://localhost:3000` to access the application.

## Usage

### For Edecanes (Registration)

1. Go to `/login` and enter the register passcode
2. Access `/register` to create new orders
3. Fill out the form with attendee details
4. Generate unique pickup codes for customers

### For Baristas (Queue Management)

1. Go to `/login` and enter the bar passcode
2. Access `/bar` to view the live queue
3. Update order status: Start → Ready → Delivered
4. Send WhatsApp notifications when orders are ready

### For Admins (Data Management)

1. Go to `/login` and enter the admin passcode (admin123)
2. Access `/admin` to view all orders
3. Export data to CSV for analysis

## API Endpoints

### Authentication

- `POST /api/auth/login` - Login with passcode
- `POST /api/auth/logout` - Logout and clear session

### Orders

- `POST /api/orders` - Create new order (Edecanes only)
- `GET /api/orders` - List orders (Baristas/Admin only)
- `PATCH /api/orders/[id]` - Update order status (Baristas only)

### Export

- `GET /api/export.csv` - Download CSV export (Admin only)

## Database Schema

The application uses a single `orders` table with the following structure:

```sql
create table orders (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz default now(),
  first_name text not null,
  last_name text not null,
  email text not null,
  phone text not null,        -- WhatsApp in E.164 format
  drink text not null,
  notes text,
  status text not null check (status in ('queued','in_progress','ready','delivered')) default 'queued',
  pickup_code text not null,
  ready_at timestamptz,
  delivered_at timestamptz
);
```

## Security Features

- **Row Level Security**: All database access is denied by default
- **Service Key Only**: Client never has direct database access
- **JWT Tokens**: Secure, HTTP-only cookies for authentication
- **Input Validation**: Server-side validation for all inputs
- **International Phone Support**: Country selector with automatic E.164 format validation

## WhatsApp Integration

When an order is marked as "Ready", baristas can send a pre-formatted WhatsApp message:

```
Hola {first_name} {last_name}! Tu café {drink} está listo. Código: {pickup_code}. Pásalo a recoger en la barra ☕️
```

## Deployment

### Vercel Deployment

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy!

### Environment Variables for Production

Make sure to set all required environment variables in your deployment platform:

- `SUPABASE_URL`
- `SUPABASE_SERVICE_KEY`
- `REGISTER_PASSCODE`
- `BAR_PASSCODE`
- `COOKIE_SECRET`

## Development

### Project Structure

```
src/
├── app/
│   ├── api/           # API routes
│   ├── register/      # Edecanes page
│   ├── bar/          # Baristas page
│   ├── admin/        # Admin page
│   └── login/        # Authentication
├── lib/
│   ├── supabase.ts   # Database client
│   └── auth.ts       # Authentication utilities
└── middleware.ts     # Route protection
```

### Key Features

- **Real-time Updates**: Bar page polls every 5 seconds
- **Responsive Design**: Works on desktop and mobile
- **Error Handling**: Comprehensive error states
- **Loading States**: User feedback during operations
- **Form Validation**: Client and server-side validation

## License

MIT License - feel free to use for your events!

# Updated Wed Oct 15 13:16:37 CST 2025
