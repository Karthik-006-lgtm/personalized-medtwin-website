# MongoDB Local Installation - Windows

## Automatic Installation (Easier)

### Option A: Using Chocolatey (Package Manager)

1. **Install Chocolatey** (if not installed):
   - Open PowerShell as Administrator
   - Run:
   ```powershell
   Set-ExecutionPolicy Bypass -Scope Process -Force; [System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072; iex ((New-Object System.Net.WebClient).DownloadString('https://community.chocolatey.org/install.ps1'))
   ```

2. **Install MongoDB**:
   ```powershell
   choco install mongodb -y
   ```

3. **Start MongoDB**:
   ```powershell
   mongod
   ```

---

## Manual Installation (Traditional)

### Step 1: Download MongoDB

1. Go to: https://www.mongodb.com/try/download/community
2. Select:
   - Version: 7.0.x (Current)
   - Platform: Windows
   - Package: MSI
3. Click "Download"

### Step 2: Install MongoDB

1. Run the downloaded `.msi` file
2. Click "Next" through the setup wizard
3. Choose "Complete" installation type
4. **Important:** Check "Install MongoDB as a Service"
5. Leave "Run service as Network Service user" checked
6. Leave default data and log directories
7. **Uncheck** "Install MongoDB Compass" (optional GUI, not needed)
8. Click "Install"
9. Wait for installation to complete
10. Click "Finish"

### Step 3: Verify Installation

Open new Command Prompt and run:
```cmd
mongod --version
```

You should see MongoDB version information.

### Step 4: Start MongoDB Service

MongoDB should start automatically if installed as a service.

To start manually:
```cmd
net start MongoDB
```

To check if it's running:
```cmd
sc query MongoDB
```

### Step 5: Test Connection

Open Command Prompt and run:
```cmd
mongosh
```

If you see MongoDB shell, it's working! Type `exit` to quit.

---

## Troubleshooting

### "mongod is not recognized"

**Fix:** Add MongoDB to PATH:
1. Search for "Environment Variables" in Windows
2. Click "Environment Variables"
3. Under "System Variables", find "Path"
4. Click "Edit"
5. Click "New"
6. Add: `C:\Program Files\MongoDB\Server\7.0\bin`
7. Click "OK" on all windows
8. Restart Command Prompt

### "MongoDB service won't start"

**Fix 1:** Run as Administrator:
```cmd
net start MongoDB
```

**Fix 2:** Create data directory:
```cmd
mkdir C:\data\db
mongod
```

---

## After Installation

Your MongoDB is ready! The project's `.env` file already has:
```
MONGODB_URI=mongodb://localhost:27017/health-monitor
```

This will work automatically! 🎉
