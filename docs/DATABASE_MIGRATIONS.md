# Database Migrations Guide

## 🗄️ **Running Migrations on Railway Production**

### **Method 1: Railway CLI (Recommended)**

1. **Install Railway CLI** (if not already installed):
   ```bash
   npm install -g @railway/cli
   ```

2. **Login to Railway**:
   ```bash
   railway login
   ```

3. **Connect to your project**:
   ```bash
   railway link
   ```

4. **Run migrations on API service**:
   ```bash
   railway run --service continuo-api "cd api && npx prisma migrate deploy"
   ```

### **Method 2: Railway Dashboard Terminal**

1. **Go to Railway Dashboard**
2. **Click on `continuo-api` service**
3. **Go to "Deployments" tab**
4. **Click "Deploy" → "Deploy from GitHub"**
5. **Add this command to the deployment**:
   ```bash
   cd api && npx prisma migrate deploy && npm start
   ```

### **Method 3: Manual Connection**

1. **Go to Railway Dashboard**
2. **Click on `continuo-api` service**
3. **Go to "Settings" → "Connect"**
4. **Use the connection details to run**:
   ```bash
   npx prisma migrate deploy
   ```

## 🔧 **Migration Commands**

### **Generate Prisma Client**
```bash
npx prisma generate
```

### **Run Migrations**
```bash
npx prisma migrate deploy
```

### **Check Migration Status**
```bash
npx prisma migrate status
```

### **Reset Database (Development Only)**
```bash
npx prisma migrate reset
```

## 📋 **What Migrations Will Create**

The migrations will create these tables:
- `users` - User accounts and authentication
- `companies` - Company information
- `customers` - Customer management
- `contacts` - Contact information
- `leads` - Lead management
- `opportunities` - Sales opportunities
- `activities` - Lead activities
- `accounts` - Chart of accounts
- `transactions` - Financial transactions

## 🎯 **After Migrations**

1. **Test user registration** at your web app
2. **Create your first admin account**
3. **Test login functionality**
4. **Verify all features work**

## 🚨 **Troubleshooting**

### **If Migrations Fail**
- Check database connection string
- Verify database service is running
- Check Railway logs for errors

### **If Tables Already Exist**
- Use `npx prisma migrate status` to check
- Use `npx prisma db push` if needed

### **If Prisma Client Issues**
- Run `npx prisma generate` first
- Check if all dependencies are installed 