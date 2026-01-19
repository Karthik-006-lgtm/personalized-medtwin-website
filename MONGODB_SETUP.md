# MongoDB Atlas (Cloud) Setup - Easy Option

## Step 1: Create Free Account
1. Go to: https://www.mongodb.com/cloud/atlas/register
2. Sign up with Google or email (takes 1 minute)
3. Choose FREE tier (M0) when asked

## Step 2: Create a Cluster
1. After login, click "Build a Database"
2. Choose "FREE" (M0) option
3. Select a cloud provider (AWS recommended)
4. Choose region closest to you
5. Click "Create Cluster" (takes 3-5 minutes to deploy)

## Step 3: Create Database User
1. In "Security" section, click "Database Access"
2. Click "Add New Database User"
3. Choose "Password" authentication
4. Username: `healthmonitor`
5. Password: `Health2026!` (or create your own)
6. Set privileges to "Read and write to any database"
7. Click "Add User"

## Step 4: Allow Network Access
1. Go to "Network Access" tab
2. Click "Add IP Address"
3. Click "Allow Access from Anywhere" (for development)
4. Click "Confirm"

## Step 5: Get Connection String
1. Go back to "Database" section
2. Click "Connect" on your cluster
3. Choose "Connect your application"
4. Copy the connection string (looks like):
   ```
   mongodb+srv://healthmonitor:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```
5. Replace `<password>` with your actual password

## Step 6: Update Your Project
1. Open `backend/.env` file in your project
2. Replace the MongoDB line with your connection string:
   ```
   MONGODB_URI=mongodb+srv://healthmonitor:Health2026!@cluster0.xxxxx.mongodb.net/health-monitor?retryWrites=true&w=majority
   ```

**That's it! No installation needed! 🎉**

You can now skip to Step 2 of the installation!
