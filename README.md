# MLC Shop — Mobile App (React Native + Expo)

A cross-platform mobile storefront matching the **MLC Shop** design and functionality. It shares the same FastAPI backend, user accounts, and real-time cloud-synchronized cart with the React website.

---

## 🌟 Key Features

1. **Shared Authentication**:
   - Sign up and sign in using the **exact same account** as the website (`demo@mlc.test` or your own account).
   - Generates and stores bearer tokens identical to the web application.

2. **Real-Time Synchronized Cart**:
   - When you add, increment, or remove an item on the **website**, it appears **instantly** in the mobile app.
   - When you add or change an item in the **mobile app**, the change is saved to the cloud and reflects on the website.

3. **Complete Shopping Experience**:
   - Filter by categories (*All, Deals, Crypto, Fashion, Health, Art, Home, Sport, Music, Gaming*).
   - Search products, brands, and catalogue items.
   - Product pricing, deal badges, star ratings, and review counts matching the website design tokens.
   - Full test checkout with delivery options (*Standard Delivery* & *Pick Up*) and Luhn-validated test card.
   - Real-time Order history tab.

---

## 🚀 Step-by-Step Guide to Run the Mobile App

Because you haven't created a mobile app before, here is the easiest, beginner-friendly way to run it:

### Option 1: Run in your Browser or Mobile Device with Expo Go

Expo makes mobile development painless without needing complex Android Studio or Xcode setups.

#### Step 1: Open a terminal in the `mobile` folder
```powershell
cd "c:\Users\tonyc\Documents\WORK\HNG\week1\ML Shop\mobile"
```

#### Step 2: Start the Expo Development Server
Run:
```powershell
cmd.exe /c "npm start"
```
*(or `npx expo start`)*

This starts the Metro bundler and displays a **QR code** in your terminal.

#### Step 3: Run on your Phone
1. Install **Expo Go** from the App Store (iOS) or Google Play Store (Android).
2. Open the Expo Go app:
   - **Android**: Scan the QR code displayed in your terminal.
   - **iOS**: Scan the QR code using your default Camera app and tap the Expo notification.
3. The app will bundle and open directly on your phone!

#### Step 4 (Alternative): Run in your Web Browser (Quick Preview)
In the terminal where Expo is running, press **`w`**.
Expo will launch the mobile UI directly in your browser (`http://localhost:8081`).

---

## 🌐 Connecting to the Backend API

By default, the mobile app is pre-configured in [`src/api.ts`](./src/api.ts) to communicate with your live Render backend:
```typescript
export const API_BASE_URL = 'https://mlcshop.onrender.com/api';
```

If you are running the backend **locally** (`http://127.0.0.1:8000`), update `API_BASE_URL` in `src/api.ts`:
- **Android Emulator**: `http://10.0.2.2:8000/api`
- **iOS Simulator**: `http://127.0.0.1:8000/api`
- **Physical Phone via Expo Go**: `http://<YOUR_COMPUTER_LOCAL_IP>:8000/api` (e.g. `http://192.168.1.15:8000/api`)
- **Render Production (Default)**: `https://mlcshop.onrender.com/api` (works out of the box anywhere with internet!)

---

## 🧪 Testing Account & Cart Synchronization

1. Open the website at `http://localhost:5173` (or your Vercel URL).
2. Log in with your account (or demo user: `demo@mlc.test` / `password123`).
3. Open the **mobile app**, tap **Sign In** (or the Account icon), and log in with the **same email and password**.
4. On the website, browse to any product (e.g. *Smart Watch WH22*) and click **+ Add to cart**.
5. Look at the mobile app: tap **Cart** (or watch the cart badge update) — the item appears in your mobile cart automatically!
6. Modify the quantity or add an item from mobile — switch back to your web browser and see the web cart update!
