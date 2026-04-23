# 🚀 EC2 Backend-Only Deployment Commands

## Quick Deployment (Copy-Paste)

```bash
# Navigate to project
cd /home/ubuntu/Retail-Basket-Value-Prediction-System

# Pull latest code
git pull origin main

# Stop all containers
sudo docker compose down

# Remove old frontend container/image
sudo docker rm -f retail_basket_frontend
sudo docker rmi retail-basket-value-prediction-system-frontend

# Rebuild backend
sudo docker compose build --no-cache backend

# Start backend + database
sudo docker compose up -d

# Check status
sudo docker compose ps

# View logs
sudo docker compose logs -f
```

---

## Or Use the Deployment Script

```bash
# Make script executable
chmod +x DEPLOY_BACKEND_ONLY.sh

# Run deployment
./DEPLOY_BACKEND_ONLY.sh
```

---

## Verify Deployment

```bash
# Check running containers (should see only 2: backend + db)
sudo docker compose ps

# Test backend API
curl http://localhost:8000/api/health/

# Check backend logs
sudo docker compose logs backend --tail=50

# Check database logs
sudo docker compose logs db --tail=20
```

---

## Expected Output

```
NAME                      IMAGE                    STATUS
retail_basket_backend     backend:latest           Up (healthy)
retail_basket_db          postgres:15-alpine       Up (healthy)
```

**Frontend should NOT appear in the list!**

---

## Backend API Access

- **Internal**: `http://localhost:8000`
- **External**: `http://<YOUR_EC2_IP>:8000`
- **Health Check**: `http://<YOUR_EC2_IP>:8000/api/health/`

---

## Troubleshooting

### Backend not starting?
```bash
# Check logs
sudo docker compose logs backend

# Restart backend
sudo docker compose restart backend
```

### Database connection failed?
```bash
# Check database is running
sudo docker compose ps db

# Check database logs
sudo docker compose logs db

# Verify environment variables
cat backend/.env | grep DB_
```

### Port 8000 not accessible?
```bash
# Check if port is open
sudo netstat -tulpn | grep 8000

# Check AWS Security Group:
# - Inbound rule for port 8000 (TCP)
# - Source: 0.0.0.0/0 (or your IP)
```

---

## Maintenance Commands

```bash
# Restart services
sudo docker compose restart

# Stop services
sudo docker compose down

# View real-time logs
sudo docker compose logs -f

# Check disk space
sudo docker system df

# Clean up unused images
sudo docker system prune -a
```

---

## What Changed?

✅ **Removed**: Frontend service (React + Nginx)  
✅ **Kept**: Backend (Django + Gunicorn)  
✅ **Kept**: Database (PostgreSQL)  
✅ **Added**: Auto-restart policy (`restart: unless-stopped`)  
✅ **Added**: Gunicorn timeout (60s)

---

## Frontend on Vercel

Your frontend is now on Vercel. Update these:

**Vercel Environment Variable**:
```
VITE_API_URL=http://<YOUR_EC2_IP>:8000
```

**Backend CORS Settings** (`backend/.env`):
```
CORS_ALLOWED_ORIGINS=https://your-vercel-app.vercel.app
CSRF_TRUSTED_ORIGINS=https://your-vercel-app.vercel.app
```

Then restart backend:
```bash
sudo docker compose restart backend
```

---

## Security Note

⚠️ **Important**: Update `backend/.env` with your Vercel URL in CORS settings!

```env
CORS_ALLOWED_ORIGINS=https://your-app.vercel.app,http://localhost:3001
CSRF_TRUSTED_ORIGINS=https://your-app.vercel.app,http://localhost:3001
```
