# 🚀 AWS EC2 Deployment with Docker - Complete Guide

## 📋 College Requirement
✅ Containerize app using Docker  
✅ Deploy to AWS EC2  
✅ Share public link for testing  

---

## 🎯 What We'll Deploy

- **Backend**: Django + PostgreSQL (Docker containers)
- **Frontend**: React + Vite (Docker container)
- **Database**: PostgreSQL (Docker container)
- **All running on single AWS EC2 instance**

---

## 📋 STEP 1: Create AWS Account (Free Tier)

### 1.1 Sign Up for AWS
1. Go to: https://aws.amazon.com/free/
2. Click "Create a Free Account"
3. Enter email, password, account name
4. Choose "Personal" account type
5. Enter payment details (required but won't be charged for free tier)
6. Verify phone number
7. Select "Basic Support - Free"

### 1.2 Free Tier Benefits (12 Months)
- **EC2**: 750 hours/month of t2.micro instance
- **Storage**: 30GB EBS storage
- **Data Transfer**: 15GB/month
- **Enough for**: College project ✅

---

## 📋 STEP 2: Launch EC2 Instance

### 2.1 Login to AWS Console
https://console.aws.amazon.com/

### 2.2 Go to EC2 Dashboard
1. Search "EC2" in top search bar
2. Click "EC2" service
3. Click "Launch Instance"

### 2.3 Configure Instance

**Name**: `retail-basket-prediction-server`

**Application and OS Images (AMI)**:
- Select: **Ubuntu Server 22.04 LTS**
- Architecture: 64-bit (x86)
- Free tier eligible ✅

**Instance Type**:
- Select: **t2.micro** (Free tier eligible)
- 1 vCPU, 1GB RAM
- Enough for Docker containers

**Key Pair (Login)**:
- Click "Create new key pair"
- Key pair name: `retail-basket-key`
- Key pair type: RSA
- Private key format: `.pem` (for Mac/Linux) or `.ppk` (for Windows PuTTY)
- Click "Create key pair"
- **IMPORTANT**: Save this file safely! You'll need it to connect.

**Network Settings**:
Click "Edit" and configure:

- **Auto-assign public IP**: Enable
- **Firewall (Security Groups)**: Create new security group
- **Security group name**: `retail-basket-sg`
- **Description**: Security group for retail basket prediction

**Add these rules**:
1. SSH (Port 22) - Source: My IP (for your connection)
2. HTTP (Port 80) - Source: Anywhere (0.0.0.0/0)
3. HTTPS (Port 443) - Source: Anywhere (0.0.0.0/0)
4. Custom TCP (Port 3001) - Source: Anywhere (0.0.0.0/0) - Frontend
5. Custom TCP (Port 8000) - Source: Anywhere (0.0.0.0/0) - Backend

**Configure Storage**:
- Size: **30 GB** (Free tier limit)
- Volume type: gp3 (General Purpose SSD)

### 2.4 Launch Instance
1. Review all settings
2. Click "Launch Instance"
3. Wait 2-3 minutes for instance to start
4. Note down **Public IPv4 address** (e.g., 54.123.45.67)

---

## 📋 STEP 3: Connect to EC2 Instance

### 3.1 For Windows (Using Git Bash or PowerShell)

```bash
# Navigate to folder where key file is saved
cd Downloads

# Set permissions (Git Bash)
chmod 400 retail-basket-key.pem

# Connect to EC2
ssh -i retail-basket-key.pem ubuntu@YOUR_EC2_PUBLIC_IP
```

Example:
```bash
ssh -i retail-basket-key.pem ubuntu@54.123.45.67
```

### 3.2 For Windows (Using PuTTY)
1. Open PuTTY
2. Host Name: `ubuntu@YOUR_EC2_PUBLIC_IP`
3. Port: 22
4. Connection → SSH → Auth → Browse → Select `.ppk` file
5. Click "Open"

### 3.3 First Time Connection
- Type "yes" when asked about fingerprint
- You should see Ubuntu welcome message

---

## 📋 STEP 4: Install Docker on EC2

### 4.1 Update System
```bash
sudo apt update
sudo apt upgrade -y
```

### 4.2 Install Docker
```bash
# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Add user to docker group (no need for sudo)
sudo usermod -aG docker ubuntu

# Start Docker service
sudo systemctl start docker
sudo systemctl enable docker

# Verify installation
docker --version
```

### 4.3 Install Docker Compose
```bash
# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose

# Make executable
sudo chmod +x /usr/local/bin/docker-compose

# Verify installation
docker-compose --version
```

### 4.4 Logout and Login Again
```bash
exit
```

Then reconnect:
```bash
ssh -i retail-basket-key.pem ubuntu@YOUR_EC2_PUBLIC_IP
```

This activates docker group membership.

---

## 📋 STEP 5: Upload Project to EC2

### Method 1: Using Git (Recommended)

```bash
# Install Git
sudo apt install git -y

# Clone your repository
git clone https://github.com/kalashmishra121/Retail-Basket-Value-Prediction-System.git

# Navigate to project
cd Retail-Basket-Value-Prediction-System
```

### Method 2: Using SCP (If not on GitHub)

From your local machine:
```bash
# Compress project
tar -czf project.tar.gz /path/to/your/project

# Upload to EC2
scp -i retail-basket-key.pem project.tar.gz ubuntu@YOUR_EC2_PUBLIC_IP:~

# On EC2, extract
tar -xzf project.tar.gz
```

---

## 📋 STEP 6: Configure Environment Variables

### 6.1 Update Backend .env File

```bash
cd Retail-Basket-Value-Prediction-System
nano backend/.env
```

Update with these values:
```env
# Django Settings
SECRET_KEY=django-insecure-aws-production-key-xyz123abc456
DEBUG=False
ALLOWED_HOSTS=YOUR_EC2_PUBLIC_IP,localhost,127.0.0.1

# Database Settings (PostgreSQL)
USE_POSTGRES=True
DB_NAME=retail_basket_db
DB_USER=postgres
DB_PASSWORD=postgres123
DB_HOST=db
DB_PORT=5432

# CORS Settings (Update with your EC2 IP)
CORS_ALLOWED_ORIGINS=http://YOUR_EC2_PUBLIC_IP:3001,http://localhost:3001
CSRF_TRUSTED_ORIGINS=http://YOUR_EC2_PUBLIC_IP:3001,http://localhost:3001

# Email Settings (Brevo)
BREVO_API_KEY=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
BREVO_EMAIL=rakeshmish917@gmail.com
```

**IMPORTANT**: Replace `YOUR_EC2_PUBLIC_IP` with actual IP (e.g., 54.123.45.67)

Save: `Ctrl + O`, Enter, `Ctrl + X`

### 6.2 Update Frontend Environment

```bash
nano .env
```

Add:
```env
VITE_API_URL=http://YOUR_EC2_PUBLIC_IP:8000
```

Save and exit.

---

## 📋 STEP 7: Update docker-compose.yml

```bash
nano docker-compose.yml
```

Make sure it looks like this:

```yaml
version: '3.8'

services:
  # PostgreSQL Database
  db:
    image: postgres:15-alpine
    container_name: retail_basket_db
    environment:
      POSTGRES_DB: retail_basket_db
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres123
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 10s
      timeout: 5s
      retries: 5

  # Django Backend
  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    container_name: retail_basket_backend
    command: gunicorn config.wsgi:application --bind 0.0.0.0:8000 --workers 3
    volumes:
      - ./backend:/app
      - static_volume:/app/staticfiles
      - media_volume:/app/media
    ports:
      - "8000:8000"
    env_file:
      - ./backend/.env
    depends_on:
      db:
        condition: service_healthy

  # React Frontend
  frontend:
    build:
      context: .
      dockerfile: Dockerfile
    container_name: retail_basket_frontend
    ports:
      - "3001:80"
    depends_on:
      - backend

volumes:
  postgres_data:
  static_volume:
  media_volume:
```

Save and exit.

---

## 📋 STEP 8: Build and Run Docker Containers

### 8.1 Build Images
```bash
docker-compose build
```

This will take 5-10 minutes first time.

### 8.2 Start Containers
```bash
docker-compose up -d
```

`-d` means detached mode (runs in background)

### 8.3 Check Running Containers
```bash
docker-compose ps
```

You should see 3 containers running:
- retail_basket_db
- retail_basket_backend
- retail_basket_frontend

### 8.4 View Logs
```bash
# All containers
docker-compose logs

# Specific container
docker-compose logs backend
docker-compose logs frontend
docker-compose logs db
```

---

## 📋 STEP 9: Run Database Migrations

### 9.1 Access Backend Container
```bash
docker-compose exec backend bash
```

### 9.2 Run Migrations
```bash
python manage.py migrate
```

### 9.3 Create Superuser
```bash
python manage.py createsuperuser
```

Enter:
- Username: admin
- Email: rakeshmish917@gmail.com
- Password: (choose strong password)

### 9.4 Collect Static Files
```bash
python manage.py collectstatic --noinput
```

### 9.5 Exit Container
```bash
exit
```

---

## 📋 STEP 10: Test Your Deployment

### 10.1 Get Your Public URLs

**Frontend**: `http://YOUR_EC2_PUBLIC_IP:3001`  
**Backend API**: `http://YOUR_EC2_PUBLIC_IP:8000/api/`  
**Admin Panel**: `http://YOUR_EC2_PUBLIC_IP:8000/admin/`

Example:
```
Frontend: http://54.123.45.67:3001
Backend: http://54.123.45.67:8000/api/
Admin: http://54.123.45.67:8000/admin/
```

### 10.2 Test All Features
- [ ] Frontend loads
- [ ] Signup works
- [ ] Login works
- [ ] Upload CSV works
- [ ] Predictions work
- [ ] Dashboard shows data
- [ ] Metrics page works
- [ ] Visualization works
- [ ] Forgot password email works

---

## 📋 STEP 11: Share Public Link

### Your Public Links:
```
Frontend (Main App): http://YOUR_EC2_PUBLIC_IP:3001
Backend API: http://YOUR_EC2_PUBLIC_IP:8000/api/
Admin Panel: http://YOUR_EC2_PUBLIC_IP:8000/admin/
```

### For College Submission:
```
Project Name: Retail Basket Value Prediction System
Deployment: AWS EC2 with Docker
Public URL: http://YOUR_EC2_PUBLIC_IP:3001

Test Credentials:
Username: admin
Password: [your_password]

Technology Stack:
- Frontend: React + Vite (Docker)
- Backend: Django REST Framework (Docker)
- Database: PostgreSQL (Docker)
- Deployment: AWS EC2 (Ubuntu 22.04)
- Containerization: Docker + Docker Compose
```

---

## 🔧 Useful Docker Commands

### Container Management
```bash
# Start all containers
docker-compose up -d

# Stop all containers
docker-compose down

# Restart containers
docker-compose restart

# View logs
docker-compose logs -f

# Check status
docker-compose ps

# Rebuild containers
docker-compose up -d --build
```

### Database Backup
```bash
# Backup database
docker-compose exec db pg_dump -U postgres retail_basket_db > backup.sql

# Restore database
docker-compose exec -T db psql -U postgres retail_basket_db < backup.sql
```

### Clean Up
```bash
# Remove all containers
docker-compose down

# Remove containers and volumes
docker-compose down -v

# Remove unused images
docker system prune -a
```

---

## 🔒 Security Best Practices

### 1. Update Security Group Rules
After testing, restrict SSH access:
- SSH (Port 22): Change from "Anywhere" to "My IP"

### 2. Use Strong Passwords
- Database password
- Django SECRET_KEY
- Admin password

### 3. Enable HTTPS (Optional but Recommended)
```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx -y

# Get SSL certificate (requires domain name)
sudo certbot --nginx -d yourdomain.com
```

### 4. Regular Updates
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Update Docker images
docker-compose pull
docker-compose up -d
```

---

## 📊 Monitoring

### Check Resource Usage
```bash
# CPU and Memory
docker stats

# Disk usage
df -h

# Docker disk usage
docker system df
```

### View Application Logs
```bash
# Real-time logs
docker-compose logs -f backend

# Last 100 lines
docker-compose logs --tail=100 backend
```

---

## 🐛 Troubleshooting

### Issue 1: Containers Not Starting
```bash
# Check logs
docker-compose logs

# Rebuild
docker-compose down
docker-compose up -d --build
```

### Issue 2: Database Connection Error
```bash
# Check database is running
docker-compose ps db

# Check database logs
docker-compose logs db

# Restart database
docker-compose restart db
```

### Issue 3: Port Already in Use
```bash
# Check what's using port
sudo lsof -i :8000

# Kill process
sudo kill -9 PID
```

### Issue 4: Can't Access from Browser
1. Check EC2 security group allows ports 3001, 8000
2. Check containers are running: `docker-compose ps`
3. Check EC2 public IP is correct
4. Try: `curl http://localhost:8000/api/` from EC2

### Issue 5: Frontend Can't Connect to Backend
1. Check CORS settings in backend/.env
2. Verify VITE_API_URL in .env
3. Check backend is accessible: `curl http://localhost:8000/api/`

---

## 💰 AWS Cost Management

### Free Tier Limits:
- **EC2 t2.micro**: 750 hours/month (1 instance 24/7)
- **Storage**: 30GB
- **Data Transfer**: 15GB outbound/month

### To Avoid Charges:
1. Use only t2.micro instance
2. Don't exceed 30GB storage
3. Stop instance when not in use:
   ```bash
   # From AWS Console
   EC2 → Instances → Select instance → Instance State → Stop
   ```
4. Set up billing alerts:
   - AWS Console → Billing → Billing Preferences
   - Enable "Receive Billing Alerts"
   - Set alert at $1

---

## 🎓 For VIVA Presentation

### What to Say:
"Maine apna project AWS EC2 pe deploy kiya hai using Docker containerization. Maine teen containers banaye hain - ek PostgreSQL database ke liye, ek Django backend ke liye, aur ek React frontend ke liye. Sab containers docker-compose se orchestrated hain. EC2 instance Ubuntu 22.04 pe run kar raha hai with t2.micro instance type jo AWS free tier me aata hai. Public IP ke through koi bhi access kar sakta hai for testing."

### Key Technical Points:
- ✅ AWS EC2 (Cloud deployment)
- ✅ Docker containerization (3 containers)
- ✅ Docker Compose (orchestration)
- ✅ PostgreSQL (production database)
- ✅ Nginx/Gunicorn (production server)
- ✅ Security groups (firewall rules)
- ✅ Public IP access (testing ready)

### Architecture Diagram:
```
Internet
   ↓
AWS EC2 Instance (Ubuntu 22.04)
   ↓
Docker Compose
   ├── Frontend Container (React:80 → 3001)
   ├── Backend Container (Django:8000)
   └── Database Container (PostgreSQL:5432)
```

---

## 📞 Support Resources

### AWS Documentation:
- EC2 Guide: https://docs.aws.amazon.com/ec2/
- Free Tier: https://aws.amazon.com/free/

### Docker Documentation:
- Docker Docs: https://docs.docker.com/
- Docker Compose: https://docs.docker.com/compose/

### Troubleshooting:
- AWS Forums: https://forums.aws.amazon.com/
- Stack Overflow: https://stackoverflow.com/questions/tagged/aws-ec2

---

## ✅ Deployment Checklist

### Pre-Deployment:
- [ ] AWS account created
- [ ] EC2 instance launched (t2.micro)
- [ ] Security group configured (ports 22, 80, 443, 3001, 8000)
- [ ] Key pair downloaded and saved
- [ ] Connected to EC2 via SSH

### Installation:
- [ ] Docker installed
- [ ] Docker Compose installed
- [ ] Project cloned/uploaded
- [ ] Environment variables configured

### Deployment:
- [ ] Docker images built
- [ ] Containers started
- [ ] Database migrations run
- [ ] Superuser created
- [ ] Static files collected

### Testing:
- [ ] Frontend accessible via public IP
- [ ] Backend API working
- [ ] Database connected
- [ ] All features tested
- [ ] Public link shared

---

**Your project is now live on AWS EC2! 🚀**

Share the public URL with your college for testing and evaluation.
