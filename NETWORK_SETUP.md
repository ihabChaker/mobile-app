# Network Configuration for Physical Device Testing

## Problem

When testing on a physical device, you get "Network Error" because the app can't reach the backend server.

## Solution

### Step 1: Find Your Computer's IP Address

**On Windows:**

```bash
ipconfig
```

Look for "IPv4 Address" under your WiFi adapter (e.g., `192.168.1.100`)

**On Mac/Linux:**

```bash
ifconfig | grep "inet " | grep -v 127.0.0.1
```

Or simply:

```bash
hostname -I
```

First IP shown is usually your local network IP (e.g., `192.168.1.100`)

### Step 2: Update `.env` File

Open `/mobile-app/.env` and update the `EXPO_PUBLIC_API_URL`:

```env
# For Physical Device (CHANGE THIS IP TO YOUR COMPUTER'S IP)
EXPO_PUBLIC_API_URL=http://192.168.1.100:3000/api/v1
```

**Replace `192.168.1.100` with YOUR computer's actual IP address!**

### Step 3: Ensure Same Network

Make sure:

- ✅ Your phone and computer are on the **same WiFi network**
- ✅ No firewall is blocking port 3000
- ✅ Backend server is running (`npm run start:dev`)

### Step 4: Restart Expo

After changing `.env`:

```bash
# Stop the current Expo server (Ctrl+C)
# Clear cache and restart
npx expo start --clear
```

### Step 5: Test Connection

In your phone's browser, navigate to:

```
http://YOUR_IP_ADDRESS:3000/api/v1/health
```

You should see: `{"status":"ok"}`

If this works, the app should work too!

## Common Issues

### "Network Error" or "Connection Refused"

**Problem**: Can't reach backend
**Solution**:

1. Verify backend is running: `cd backend && npm run start:dev`
2. Check firewall settings
3. Verify IP address is correct

### "Validation failed (numeric string is expected)"

**Problem**: Backend receiving wrong parameter types
**Solution**: Already fixed in latest code - ensure you're using the updated version

### Backend not accessible from phone

**Problem**: Firewall blocking connection
**Solution** (Linux/Mac):

```bash
# Temporarily allow port 3000
sudo ufw allow 3000/tcp
```

**Solution** (Windows):

1. Open Windows Defender Firewall
2. Click "Advanced settings"
3. Create new Inbound Rule for port 3000

## Quick Reference

| Scenario         | API URL                        |
| ---------------- | ------------------------------ |
| Android Emulator | `http://10.0.2.2:3000/api/v1`  |
| iOS Simulator    | `http://localhost:3000/api/v1` |
| Physical Device  | `http://YOUR_IP:3000/api/v1`   |

## Current Configuration

Check your current API URL:

```bash
cat .env | grep EXPO_PUBLIC_API_URL
```

## Testing Backend is Running

```bash
# From your computer
curl http://localhost:3000/api/v1/health

# From your phone's browser
http://YOUR_IP_ADDRESS:3000/api/v1/health
```

Both should return: `{"status":"ok"}`
