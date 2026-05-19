# GaitApp - Dual Sensor Gait Analysis System

A full-stack application connecting to dual ESP32 Bluetooth Low Energy (BLE) smart insoles to provide real-time biomechanical analysis, session recording, and historical telemetry viewing.

### 1. GitHub Repositories
* **Frontend:** [GaitApp-Application](https://github.com/ashreekar/GaitApp-Application)
* **Backend:** [GaitApp-Backend](https://github.com/ashreekar?tab=repositories) (Ensure you link the exact backend repo here)

### 2. Frameworks Used
* **Frontend:** React.js, Vite, Tailwind CSS, Zustand (State Management), MUI Charts.
* **Mobile Wrappers:** Capacitor (for native BLE access and mobile builds).
* **Backend:** Node.js, Express.js.
* **Database:** MongoDB (via Mongoose).
* **Hardware:** ESP32 Arduino Core.

### 3. Required Software Versions
* **Node.js:** v18.0.0 or higher
* **npm:** v9.0.0 or higher
* **MongoDB:** v6.0 or higher (or MongoDB Atlas)
* **Android Studio:** Latest version (Required for Capacitor Android builds)
* **Arduino IDE:** v2.x (For flashing ESP32 firmware)

### 4. .env.example
Create a `.env` file in both the frontend and backend root directories based on these examples:

**Backend (`.env`)**
```env
PORT=5000
MONGODB_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/gaitdb?retryWrites=true&w=majority
JWT_SECRET=your_super_secret_jwt_key_here
NODE_ENV=development