# 🔥 Firebase Setup Guide for Çiçeğim

Complete guide to set up Firebase for the Çiçeğim plant care application.

## 📋 Prerequisites

- Google Account
- Node.js and npm installed
- Çiçeğim project cloned locally

## 🚀 Step 1: Create Firebase Project

### 1.1 Go to Firebase Console
Visit: **https://console.firebase.google.com/**

### 1.2 Create New Project
1. Click **"Add project"** or **"Create a project"**
2. Enter project name: **`cicegim-app`** (or your preferred name)
3. Click **"Continue"**
4. **Disable** Google Analytics (optional for this project)
5. Click **"Create project"**
6. Wait for project creation to complete
7. Click **"Continue"**

---

## 🌐 Step 2: Register Web App

### 2.1 Add Web App to Firebase Project
1. In Firebase Console, click the **Web icon (</> symbol)**
2. Enter app nickname: **`Cicegim Web App`**
3. **Check** "Also set up Firebase Hosting" (optional)
4. Click **"Register app"**

### 2.2 Copy Firebase Configuration
You'll see a configuration object like this:

```javascript
const firebaseConfig = {
  apiKey: "AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
  authDomain: "cicegim-app.firebaseapp.com",
  projectId: "cicegim-app",
  storageBucket: "cicegim-app.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abcdef123456"
};
```

**⚠️ IMPORTANT:** Keep this configuration safe! We'll add it to `.env` file (which is gitignored).

### 2.3 Click "Continue to console"

---

## 🔐 Step 3: Enable Authentication

### 3.1 Navigate to Authentication
1. In left sidebar, click **"Authentication"**
2. Click **"Get started"**

### 3.2 Enable Email/Password Authentication
1. Click **"Sign-in method"** tab
2. Click **"Email/Password"**
3. Toggle **"Enable"** switch
4. Click **"Save"**

### 3.3 Enable Google Sign-In (Optional)
1. Click **"Google"** in the sign-in providers list
2. Toggle **"Enable"** switch
3. Select a support email
4. Click **"Save"**

---

## 🗄️ Step 4: Set Up Firestore Database

### 4.1 Create Database
1. In left sidebar, click **"Firestore Database"**
2. Click **"Create database"**

### 4.2 Choose Security Rules
- Select **"Start in test mode"** (for development)
- Click **"Next"**

⚠️ **Note:** Test mode rules allow all reads/writes. Change to production rules before deploying!

### 4.3 Select Location
- Choose your preferred Cloud Firestore location (e.g., `us-central` or closest to your users)
- Click **"Enable"**

### 4.4 Create Collections (Optional - Auto-created on first use)
Collections will be automatically created when the app writes data:
- **`users`** - User profiles
- **`plants`** - User's plant data

---

## 📦 Step 5: Set Up Storage

### 5.1 Enable Storage
1. In left sidebar, click **"Storage"**
2. Click **"Get started"**
3. Accept the default security rules
4. Click **"Next"**
5. Select the same location as Firestore
6. Click **"Done"**

This will store plant images uploaded by users.

---

## 🔧 Step 6: Configure Your Local Project

### 6.1 Update `.env` File
Navigate to `/home/user/Cicegim/flora-app/.env` and update with your Firebase config:

```bash
# Gemini API Configuration
VITE_GEMINI_API_KEY=your_gemini_key_here

# Firebase Configuration
VITE_FIREBASE_API_KEY=AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
VITE_FIREBASE_AUTH_DOMAIN=cicegim-app.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=cicegim-app
VITE_FIREBASE_STORAGE_BUCKET=cicegim-app.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789012
VITE_FIREBASE_APP_ID=1:123456789012:web:abcdef123456
```

### 6.2 Install Firebase Dependencies
The Firebase dependencies are already in `package.json`:
```bash
cd flora-app
npm install
```

### 6.3 Verify Firebase is Initialized
The Firebase configuration is in `src/firebase.js` and will be automatically initialized when you run the app.

---

## 🛡️ Step 7: Set Up Security Rules (Production)

### 7.1 Firestore Security Rules
In Firebase Console → **Firestore Database** → **Rules** tab:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can only read/write their own data
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }

    // Users can only read/write their own plants
    match /plants/{plantId} {
      allow read, write: if request.auth != null &&
                           resource.data.userId == request.auth.uid;
    }
  }
}
```

Click **"Publish"** to apply the rules.

### 7.2 Storage Security Rules
In Firebase Console → **Storage** → **Rules** tab:

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /users/{userId}/{allPaths=**} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

Click **"Publish"** to apply the rules.

---

## 🧪 Step 8: Test Firebase Integration

### 8.1 Start Development Server
```bash
cd /home/user/Cicegim/flora-app
npm run dev
```

### 8.2 Check Browser Console
Open http://localhost:5173/ and check the browser console for:
```
Firebase initialized successfully
```

If you see errors, verify your `.env` configuration.

### 8.3 Test Authentication (Once Implemented)
- Try signing up with email/password
- Check Firebase Console → **Authentication** → **Users** to see registered users

### 8.4 Test Firestore (Once Implemented)
- Add a plant in the app
- Check Firebase Console → **Firestore Database** to see the data

---

## 📱 Step 9: Firebase for Flutter App (Optional)

### 9.1 Add Firebase to Flutter
1. Install FlutterFire CLI:
```bash
dart pub global activate flutterfire_cli
```

2. Configure Firebase for Flutter:
```bash
cd /home/user/Cicegim/cicegim_flutter
flutterfire configure
```

3. Select your Firebase project
4. Select platforms (android, ios)

### 9.2 Update Flutter Dependencies
Add to `pubspec.yaml`:
```yaml
dependencies:
  firebase_core: ^2.24.2
  firebase_auth: ^4.16.0
  cloud_firestore: ^4.14.0
  firebase_storage: ^11.6.0
```

---

## 🚀 Step 10: Deploy to Firebase Hosting (Optional)

### 10.1 Install Firebase CLI
```bash
npm install -g firebase-tools
```

### 10.2 Login to Firebase
```bash
firebase login
```

### 10.3 Initialize Firebase Hosting
```bash
cd /home/user/Cicegim/flora-app
firebase init hosting
```

Select:
- Use existing project → **cicegim-app**
- Public directory → **dist**
- Configure as SPA → **Yes**
- Set up automatic builds → **No**

### 10.4 Build and Deploy
```bash
npm run build
firebase deploy
```

Your app will be live at: `https://cicegim-app.web.app`

---

## 🔍 Troubleshooting

### Error: "Firebase not initialized"
- Check `.env` file has correct values
- Restart dev server after updating `.env`
- Verify all Firebase services are enabled in console

### Error: "Permission denied"
- Check Firestore/Storage security rules
- Ensure user is authenticated before accessing data
- Verify userId matches in security rules

### Error: "API key restrictions"
- Go to Google Cloud Console → **Credentials**
- Find your API key
- Add HTTP referrers or remove restrictions

---

## 📚 Useful Resources

- **Firebase Docs:** https://firebase.google.com/docs
- **Firestore Docs:** https://firebase.google.com/docs/firestore
- **Firebase Auth Docs:** https://firebase.google.com/docs/auth
- **Firebase Storage Docs:** https://firebase.google.com/docs/storage

---

## 🔒 Security Checklist

Before going to production:

- [ ] Change Firestore rules from test mode to production rules
- [ ] Change Storage rules to restrict access
- [ ] Enable API key restrictions in Google Cloud Console
- [ ] Add `.env` to `.gitignore` (already done ✅)
- [ ] Never commit Firebase config to Git
- [ ] Set up Firebase App Check for additional security
- [ ] Enable rate limiting in Firebase Console

---

## 📞 Support

If you encounter issues:
1. Check Firebase Console logs
2. Check browser console for errors
3. Verify all environment variables are set correctly
4. Ensure Firebase services are enabled

---

**Note:** Firebase has a generous free tier (Spark Plan) that's perfect for development and small apps. Upgrade to Blaze Plan (pay-as-you-go) only when you exceed free tier limits.

---

## 🎉 You're All Set!

Firebase is now configured for your Çiçeğim app. The app can now use:
- ✅ User Authentication
- ✅ Cloud Database (Firestore)
- ✅ File Storage (for plant images)
- ✅ Hosting (optional)

Happy coding! 🌱
