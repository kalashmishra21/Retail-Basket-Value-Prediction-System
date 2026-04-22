# 🐳 Docker + PostgreSQL Deployment Guide

## 📍 Current Status
- **Database**: SQLite (`backend/db.sqlite3`)
- **Location**: Local file system
- **View Data**: Use DB Browser for SQLite

---

## 🚀 Docker Setup (Step-by-Step)

### Prerequisites
✅ Docker Desktop installed (already done)
✅ Docker running

### Step 1: Start Docker Desktop
```bash
# Windows: Open Docker Desktop application
# Wait until Docker is running (whale icon in system tray)
```

### Step 2: Build and Run with Docker Compose
```bash
# Navigate to project root
cd "C:\Users\kalas\OneDrive\Desktop\OJT4th Sem"

# Build and start all containers
docker-compose up --build

# Or run in background (detached mode)
docker-compose up -d --build
```

### Step 3: Check Running Containers
```bash
docker ps

# You should see 3 containers:
# 1. retail_basket_db (PostgreSQL)
# 2. retail_basket_backend (Django)
# 3. retail_basket_frontend (React)
```

### Step 4: Access Application
- **Frontend**: http://localhost:3001
- **Backend API**: http://localhost:8000/api
- **PostgreSQL**: localhost:5432

### Step 5: View PostgreSQL Data
```bash
# Connect to PostgreSQL container
docker exec -it retail_basket_db psql -U postgres -d retail_basket_db

# Inside PostgreSQL:
\dt                    # List all tables
SELECT * FROM api_user;  # View users
SELECT * FROM api_prediction;  # View predictions
\q                     # Exit
```

### Step 6: Run Migrations (if needed)
```bash
docker exec -it retail_basket_backend python manage.py migrate
docker exec -it retail_basket_backend python manage.py createsuperuser
```

### Step 7: Stop Containers
```bash
# Stop all containers
docker-compose down

# Stop and remove volumes (deletes data)
docker-compose down -v
```

---

## 📊 View Data Options

### Option 1: pgAdmin (GUI Tool)
1. Download: https://www.pgadmin.org/download/
2. Install and open
3. Add server:
   - Host: localhost
   - Port: 5432
   - Database: retail_basket_db
   - Username: postgres
   - Password: postgres123

### Option 2: DBeaver (Free & Powerful)
1. Download: https://dbeaver.io/download/
2. Install and open
3. New Connection → PostgreSQL
4. Same credentials as above

### Option 3: Command Line
```bash
docker exec -it retail_basket_db psql -U postgres -d retail_basket_db
```

---

## 🌐 Production Deployment

### Frontend Deployment Options (FREE)

#### 1. **Vercel** (RECOMMENDED) ⭐
- **Best for**: React/Vite apps
- **Free Tier**: Unlimited projects
- **Speed**: Very fast CDN
- **SSL**: Automatic HTTPS

**Steps:**
```bash
# Install Vercel CLI
npm install -g vercel

# Login
vercel login

# Deploy
vercel

# Production deploy
vercel --prod
```

**Resources:**
- Website: https://vercel.com
- Docs: https://vercel.com/docs
- Guide: https://vercel.com/guides/deploying-vite-with-vercel

#### 2. **Netlify** (Alternative)
- **Best for**: Static sites
- **Free Tier**: 100GB bandwidth
- **Features**: Form handling, serverless functions

**Steps:**
```bash
# Install Netlify CLI
npm install -g netlify-cli

# Login
netlify login

# Deploy
netlify deploy

# Production
netlify deploy --prod
```

**Resources:**
- Website: https://www.netlify.com
- Docs: https://docs.netlify.com

#### 3. **Render** (Full-stack option)
- **Best for**: Full-stack apps
- **Free Tier**: 750 hours/month
- **Features**: Auto-deploy from GitHub

**Resources:**
- Website: https://render.com
- Docs: https://render.com/docs

---

### Backend Deployment Options (FREE)

#### 1. **Render** (RECOMMENDED) ⭐
- **Free Tier**: PostgreSQL + Web Service
- **Auto-deploy**: From GitHub
- **SSL**: Automatic HTTPS

**Steps:**
1. Go to https://render.com
2. Sign up with GitHub
3. New → Web Service
4. Connect your GitHub repo
5. Settings:
   - Build Command: `pip install -r requirements.txt`
   - Start Command: `gunicorn config.wsgi:application`
   - Environment Variables: Add from `.env`
6. Create PostgreSQL database (free tier)
7. Link database to web service

**Resources:**
- Website: https://render.com
- Docs: https://render.com/docs/deploy-django
- PostgreSQL: https://render.com/docs/databases

#### 2. **Railway** (Alternative)
- **Free Tier**: $5 credit/month
- **Easy setup**: One-click PostgreSQL
- **Auto-deploy**: From GitHub

**Steps:**
1. Go to https://railway.app
2. Sign up with GitHub
3. New Project → Deploy from GitHub
4. Add PostgreSQL service
5. Configure environment variables

**Resources:**
- Website: https://railway.app
- Docs: https://docs.railway.app

#### 3. **Fly.io** (Advanced)
- **Free Tier**: 3 VMs
- **Features**: Global deployment
- **Docker**: Native support

**Resources:**
- Website: https://fly.io
- Docs: https://fly.io/docs/django/

---

## 🔧 Environment Variables for Production

### Frontend (.env)
```env
VITE_API_URL=https://your-backend-url.com
```

### Backend (.env)
```env
DEBUG=False
SECRET_KEY=your-super-secret-key-here
ALLOWED_HOSTS=your-domain.com,www.your-domain.com
USE_POSTGRES=True
DB_NAME=your_db_name
DB_USER=your_db_user
DB_PASSWORD=your_db_password
DB_HOST=your_db_host
DB_PORT=5432
CORS_ALLOWED_ORIGINS=https://your-frontend-url.com
CSRF_TRUSTED_ORIGINS=https://your-frontend-url.com
BREVO_API_KEY=your_brevo_api_key
BREVO_EMAIL=your_email@gmail.com
```

---

## 📝 Deployment Checklist

### Before Deployment:
- [ ] Update SECRET_KEY (use strong random key)
- [ ] Set DEBUG=False
- [ ] Configure ALLOWED_HOSTS
- [ ] Set up PostgreSQL database
- [ ] Update CORS_ALLOWED_ORIGINS
- [ ] Test locally with Docker
- [ ] Run migrations
- [ ] Create superuser
- [ ] Test all features

### After Deployment:
- [ ] Test login/signup
- [ ] Test file upload
- [ ] Test predictions
- [ ] Test email (forgot password)
- [ ] Check database connections
- [ ] Monitor logs
- [ ] Set up backups

---

## 🎯 Recommended Stack (FREE)

**Frontend**: Vercel
- Fast, reliable, automatic HTTPS
- Perfect for React/Vite
- Easy GitHub integration

**Backend**: Render
- Free PostgreSQL database
- Auto-deploy from GitHub
- Built-in SSL

**Database**: Render PostgreSQL
- 1GB free storage
- Automatic backups
- Easy connection

**Total Cost**: $0/month 🎉

---

## 🔗 Useful Resources

### Docker
- Docker Docs: https://docs.docker.com
- Docker Compose: https://docs.docker.com/compose/
- Docker Hub: https://hub.docker.com

### PostgreSQL
- Official Docs: https://www.postgresql.org/docs/
- pgAdmin: https://www.pgadmin.org
- DBeaver: https://dbeaver.io

### Django Deployment
- Django Docs: https://docs.djangoproject.com/en/4.2/howto/deployment/
- Gunicorn: https://docs.gunicorn.org
- WhiteNoise: http://whitenoise.evans.io

### React/Vite Deployment
- Vite Docs: https://vitejs.dev/guide/static-deploy.html
- Vercel Guide: https://vercel.com/guides/deploying-vite-with-vercel

---

## 🆘 Troubleshooting

### Docker Issues
```bash
# Check Docker is running
docker --version

# View logs
docker-compose logs

# Restart containers
docker-compose restart

# Clean rebuild
docker-compose down -v
docker-compose up --build
```

### Database Connection Issues
```bash
# Check PostgreSQL is running
docker exec -it retail_basket_db pg_isready

# View PostgreSQL logs
docker logs retail_basket_db

# Reset database
docker-compose down -v
docker-compose up -d db
docker exec -it retail_basket_backend python manage.py migrate
```

### Port Already in Use
```bash
# Windows: Find process using port
netstat -ano | findstr :8000
netstat -ano | findstr :3001
netstat -ano | findstr :5432

# Kill process (replace PID)
taskkill /PID <PID> /F
```

---

## 📞 Support

If you face any issues:
1. Check Docker logs: `docker-compose logs`
2. Check container status: `docker ps -a`
3. Restart containers: `docker-compose restart`
4. Clean rebuild: `docker-compose down -v && docker-compose up --build`

---

**Happy Deploying! 🚀**
