# Harvest - Local Produce Marketplace

A React Native app built with Expo that connects local farmers with customers, featuring real-time chat, Stripe payments, and a comprehensive marketplace.

## Features

### 🛒 Marketplace
- Browse local produce by category
- Search and filter products
- Add items to cart with quantity selection
- Secure checkout with Stripe integration

### 💬 Real-time Chat
- Direct messaging between customers and farmers
- Product-specific conversations
- Unread message indicators
- Message history and timestamps

### 👨‍🌾 Seller Features
- Farmer enrollment and verification
- Product management dashboard
- Stripe Connect integration for payments
- Sales analytics and reporting
- Premium subscription features

### 🔐 Authentication & Security
- Supabase authentication with email/password
- Row Level Security (RLS) for data protection
- Secure API endpoints with proper authorization

### 💳 Payment Processing
- Stripe Connect for marketplace payments
- Platform billing for vendor subscriptions
- Automatic fee distribution
- Seasonal billing system

## Tech Stack

- **Frontend**: React Native with Expo
- **Backend**: Supabase (PostgreSQL + Edge Functions)
- **Payments**: Stripe Connect + Stripe Checkout
- **Real-time**: Supabase Realtime
- **Navigation**: Expo Router
- **State Management**: React Context + Custom Hooks

## Getting Started

### Prerequisites
- Node.js 18+
- Expo CLI
- Supabase account
- Stripe account

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   - Copy `.env.example` to `.env`
   - Add your Supabase and Stripe credentials

4. Run the development server:
   ```bash
   npm run dev
   ```

### Database Setup

The app uses Supabase with the following main tables:
- `profiles` - User profiles
- `farmers` - Farmer/seller information
- `products` - Product listings
- `orders` - Order management
- `conversations` - Chat conversations
- `messages` - Chat messages
- Stripe integration tables for payments

### Deployment

#### Mobile App Stores

1. **iOS App Store**:
   ```bash
   npm run build:ios
   npm run submit:ios
   ```

2. **Google Play Store**:
   ```bash
   npm run build:android
   npm run submit:android
   ```

#### Web Deployment
```bash
npm run build:web
```

## Environment Variables

Required environment variables:

```env
EXPO_PUBLIC_SUPABASE_URL=your_supabase_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

For Supabase Edge Functions:
```env
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=your_webhook_secret
STRIPE_CONNECT_WEBHOOK_SECRET=your_connect_webhook_secret
```

## Key Features Implementation

### Chat System
- Real-time messaging using Supabase Realtime
- Conversation threading by user-farmer-product
- Message read receipts and unread counts
- Support for text messages and future file attachments

### Marketplace Payments
- Stripe Connect for multi-vendor payments
- Automatic fee splitting between platform and vendors
- Secure checkout sessions
- Order tracking and history

### Seller Onboarding
- Farmer verification process
- Stripe Connect account setup
- Product management tools
- Analytics dashboard

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.