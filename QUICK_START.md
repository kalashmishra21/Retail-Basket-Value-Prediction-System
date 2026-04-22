# ⚡ Quick Start Guide

## 🐳 Run with Docker (Easiest Way)

### 1. Start Docker Desktop
- Open Docker Desktop
- Wait until it's running (whale icon in system tray)

### 2. Run Project
```bash
# Open terminal in project folder
cd "C:\Users\kalas\OneDrive\Desktop\OJT4th Sem"

# Start everything
docker-compose up --build
```

### 3. Access Application
- **Frontend**: http://localhost:3001
- **Backend**: http://localhost:8000/api
- **Database**: PostgreSQL (automatic)

### 4. Stop Project
```bash
# Press Ctrl+C in terminal
# Or run:
docker-compose down
```

---

## 💻 Run Locally (Without Docker)

### Backend
```bash
cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
```

### Frontend
```bash
npm install
npm run dev
```

---

## 🌐 Deploy to Production

### Frontend (Vercel - FREE)
```bash
npm install -g vercel
vercel login
vercel --prod
```

### Backend (Render - FREE)
1. Go to https://render.com
2. Sign up with GitHub
3. New Web Service → Connect repo
4. Add PostgreSQL database
5. Deploy!

**Complete guide**: See `DOCKER_DEPLOYMENT_GUIDE.md`

---

## 📊 View Database

### With Docker
```bash
docker exec -it retail_basket_db psql -U postgres -d retail_basket_db
```

### With pgAdmin
1. Download: https://www.pgadmin.org/download/
2. Connect to: localhost:5432
3. Username: postgres
4. Password: postgres123

---

## 🆘 Common Issues

### Port already in use
```bash
# Kill process on port 8000
netstat -ano | findstr :8000
taskkill /PID <PID> /F
```

### Docker not starting
```bash
# Clean restart
docker-compose down -v
docker-compose up --build
```

### Database errors
```bash
# Reset database
docker-compose down -v
docker-compose up -d db
docker exec -it retail_basket_backend python manage.py migrate
```

---

**Need help?** Check `DOCKER_DEPLOYMENT_GUIDE.md` for detailed instructions!
