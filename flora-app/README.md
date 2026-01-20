# Flora - AI-Powered Plant Care Application

Flora is a modern mobile-first web application that helps users identify plants using AI, manage their plant collection, and maintain proper care schedules.

## Features

- **AI Plant Identification**: Identify plants instantly using Plant.id (Kindwise) API
- **Digital Garden**: Manage your plant collection with detailed care information
- **Watering Schedule**: Automatic watering reminders based on plant needs
- **Health Monitoring**: Premium feature for disease diagnosis
- **Offline Support**: LocalStorage persistence for offline access
- **Beautiful UI**: Modern design with Tailwind CSS and smooth animations

## Tech Stack

- **Frontend**: React 18 + Vite
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Backend**: Firebase (Authentication, Firestore, Storage)
- **AI**: Kindwise Plant.id API V3
- **State Management**: React Context API + LocalStorage

## Getting Started

### Prerequisites

- Node.js 16+ and npm
- Firebase account (for backend services)
- Plant.id API key (for plant identification)

### Installation

1. Clone the repository:
```bash
cd flora-app
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
   - Copy `.env.example` to `.env`
   - Fill in your Firebase configuration
   - Add your Plant.id API key

```bash
cp .env.example .env
# Edit .env with your credentials
```

4. Start the development server:
```bash
npm run dev
```

5. Open http://localhost:5173 in your browser

## Configuration

### Firebase Setup

1. Create a new Firebase project at https://console.firebase.google.com
2. Enable Authentication (Anonymous and Email/Password)
3. Create a Firestore database
4. Enable Storage
5. Copy your Firebase configuration to `.env`

### Plant.id API Setup

1. Sign up at https://web.plant.id/
2. Get your API key from the dashboard
3. Add it to `.env` as `VITE_PLANTID_API_KEY`

## Project Structure

```
flora-app/
├── src/
│   ├── components/        # React components
│   │   ├── Dashboard.jsx
│   │   ├── Onboarding.jsx
│   │   ├── ScanCamera.jsx
│   │   ├── PlantDetail.jsx
│   │   └── Paywall.jsx
│   ├── contexts/          # React Context providers
│   │   └── AppContext.jsx
│   ├── services/          # API services
│   │   ├── firebase.js
│   │   └── plantid.js
│   ├── App.jsx           # Main app component
│   ├── main.jsx          # Entry point
│   └── index.css         # Global styles
├── .env.example          # Environment variables template
├── tailwind.config.js    # Tailwind configuration
└── package.json
```

## Features in Detail

### Onboarding
- 3-step introduction to app features
- Anonymous authentication setup
- Skip option available

### Plant Identification
- Camera capture or file upload
- AI-powered identification using Plant.id
- Automatic extraction of care information
- Mock data for testing without API key

### Plant Management
- Add plants to your collection
- Edit plant nicknames
- Track watering schedules
- View detailed care information
- Delete plants from collection

### Care Calendar
- Automatic calculation of next watering date
- Visual indicators for plants needing water
- One-tap watering updates

### Premium Features
- Unlimited plant scans
- Disease diagnosis
- Priority support

## Building for Production

```bash
npm run build
```

The built files will be in the `dist/` directory.

## Development Notes

- The app uses localStorage for data persistence
- Mock plant identification available when API key is not configured
- Responsive design optimized for mobile devices
- PWA-ready architecture

## Color Palette

- **Primary Green**: #1B4332 (Forest Green)
- **Secondary Green**: #2D6A4F
- **Accent Colors**: Orange to Rose gradient for premium features
- **Background**: #F8FAF8

## Browser Support

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Mobile browsers (iOS Safari, Chrome Mobile)

## Contributing

This project was built based on the specifications in the PRD documents. To contribute:

1. Follow the existing code structure
2. Maintain the design system (colors, spacing, components)
3. Test on mobile devices
4. Ensure offline functionality works

## License

Copyright © 2026 Flora Team. All rights reserved.
