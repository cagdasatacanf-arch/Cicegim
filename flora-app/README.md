# Çiçeğim - Gemini AI Plant Care App

AI-powered plant identification and care tracking application using Google Gemini.

## Features

- **AI Plant Identification** - Identify plants using Gemini 2.0 Flash with vision capability
- **Plant Collection** - Manage your plants with photos and care information
- **Watering Schedule** - Automatic watering reminders based on plant needs
- **Turkish Interface** - Full Turkish language support
- **Offline Storage** - LocalStorage for offline access
- **Modern UI** - Beautiful mobile-first design with Tailwind CSS

## Tech Stack

- **Frontend**: React 18 + Vite
- **Styling**: Tailwind CSS v3
- **Icons**: Lucide React
- **AI**: Google Gemini 2.0 Flash Exp
- **State**: React useState + LocalStorage

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Get Gemini API Key

1. Go to https://aistudio.google.com/app/apikey
2. Click "Create API Key"
3. Copy your API key

### 3. Configure Environment

```bash
cp .env.example .env
```

Edit `.env`:
```env
VITE_GEMINI_API_KEY=your_actual_api_key_here
```

### 4. Start Development Server

```bash
npm run dev
```

### 5. Open App

Navigate to http://localhost:5173

## Project Structure

```
flora-app/
├── src/
│   ├── App.jsx           # Main application (single component)
│   ├── index.css         # Tailwind styles
│   └── main.jsx          # Entry point
├── .env.example          # Environment template
├── .env                  # Your API keys (gitignored)
├── package.json
└── README.md
```

## How It Works

### Plant Identification Flow

1. **Image Capture**: User uploads or captures plant photo
2. **Base64 Conversion**: Image converted to base64 format
3. **Gemini API Call**: Image sent to Gemini with prompt
4. **JSON Response**: Gemini returns structured plant data:
   ```json
   {
     "commonName": "Peace Lily",
     "scientificName": "Spathiphyllum",
     "wateringInterval": 7,
     "healthStatus": "Healthy",
     "careTips": "Water weekly..."
   }
   ```
5. **Storage**: Plant saved to localStorage
6. **Display**: Added to collection with care information

### Gemini API Integration

```javascript
const identifyWithGemini = async (base64Image) => {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${API_KEY}`;

  const payload = {
    contents: [{
      parts: [
        { text: "Expert plant identification prompt..." },
        { inlineData: { mimeType: "image/jpeg", data: base64Image } }
      ]
    }]
  };

  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });

  const result = await response.json();
  return JSON.parse(result.candidates[0].content.parts[0].text);
};
```

### Error Handling

- **Exponential Backoff**: Retries API calls with increasing delays
- **5 Retries**: Maximum retry attempts
- **User-Friendly Messages**: Clear error notifications
- **Graceful Degradation**: App works without API key (with warning)

## Features in Detail

### Home Screen
- Status card showing plant count
- Plant list with watering status
- Quick water button for each plant
- Visual indicators (SU ZAMANI = needs water, İYİ = good)

### Plant Detail Screen
- Full-size plant photo
- Care information grid (water, temperature, health)
- Gemini AI care tips
- Water marking button
- Delete option

### Loading States
- Full-screen overlay during AI analysis
- Animated spinner
- Progress message

### Error Handling
- Toast notifications for errors
- Dismissible error messages
- API key warning banner

## Data Structure

### LocalStorage Key
```javascript
localStorage.getItem('cicegim_gemini_db')
```

### Plant Object
```javascript
{
  id: "1737337200000",
  commonName: "Barış Çiçeği",
  scientificName: "Spathiphyllum",
  wateringInterval: 7,
  healthStatus: "İyi",
  careTips: "Haftada bir sulayın, dolaylı ışık tercih eder",
  image: "data:image/jpeg;base64,/9j/4AAQ...",
  lastWatered: "2026-01-20T10:30:00.000Z"
}
```

## Watering Logic

```javascript
const getWateringStatus = (plant) => {
  const diff = new Date() - new Date(plant.lastWatered);
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  return days >= plant.wateringInterval ? 'urgent' : 'ok';
};
```

- Calculates days since last watering
- Compares with plant's watering interval
- Returns 'urgent' or 'ok' status

## Styling

### Color Palette
- **Primary**: #1B4332 (Forest Green)
- **Secondary**: #2D6A4F (Dark Green)
- **Accent**: Blue for water actions
- **Warning**: Red for urgent watering
- **Success**: Green for healthy status

### Design System
- **Rounded corners**: 1.5rem to 2.5rem
- **Shadows**: Soft, layered shadows
- **Typography**: System fonts, bold headers
- **Spacing**: Consistent padding/margins
- **Animations**: Smooth transitions

## Build for Production

```bash
npm run build
```

Built files will be in `dist/` directory.

## Troubleshooting

### API Key Not Working
- Check `.env` file exists
- Verify `VITE_GEMINI_API_KEY` is set
- Restart dev server after env changes
- Check API key is valid at https://aistudio.google.com

### Image Not Loading
- Check file size (<5MB recommended)
- Verify image format (JPEG, PNG supported)
- Check browser console for errors

### JSON Parse Error
- Gemini response may include markdown
- Code automatically extracts JSON from response
- Check console for raw API response

## Browser Support

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Mobile browsers (iOS Safari, Chrome Mobile)

## Performance

- **First Load**: ~500ms
- **Plant Identification**: 2-5 seconds
- **LocalStorage**: ~10ms read/write
- **App Size**: ~150KB gzipped

## Future Enhancements

- [ ] Firebase sync for cross-device access
- [ ] Push notifications for watering reminders
- [ ] Disease diagnosis with Gemini
- [ ] Calendar view for watering schedule
- [ ] Plant care history/logs
- [ ] Export/import plant collection
- [ ] Multilingual support

## License

Copyright © 2026 Çiçeğim Team. All rights reserved.
