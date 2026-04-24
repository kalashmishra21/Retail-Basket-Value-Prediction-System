# 🛒 Retail Basket Value Prediction System (RBVPS)

A production-ready, full-stack machine learning web application that predicts retail basket values using **XGBoost Regressor**. Built with React, Django, and PostgreSQL.

[![Python](https://img.shields.io/badge/Python-3.10+-blue.svg)](https://www.python.org/)
[![Django](https://img.shields.io/badge/Django-4.2-green.svg)](https://www.djangoproject.com/)
[![React](https://img.shields.io/badge/React-18.2-61DAFB.svg)](https://reactjs.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-336791.svg)](https://www.postgresql.org/)
[![Docker](https://img.shields.io/badge/Docker-Ready-2496ED.svg)](https://www.docker.com/)
[![Live Demo](https://img.shields.io/badge/Live-Demo-success.svg)](https://retail-basket-value-prediction-syst.vercel.app)

## 🌐 Live Deployment

**Frontend**: [https://retail-basket-value-prediction-syst.vercel.app](https://retail-basket-value-prediction-syst.vercel.app)  
**Backend API**: [https://51.20.70.80](https://51.20.70.80)  
**Health Check**: [https://51.20.70.80/api/health/](https://51.20.70.80/api/health/)

> Frontend deployed on Vercel, Backend on AWS EC2 with Docker + PostgreSQL  

---

## 📋 Table of Contents

- [🎯 Overview](#-overview)
- [✨ Features](#-features)
- [🛠️ Tech Stack](#️-tech-stack)
- [📂 Project Structure](#-project-structure)
- [🚀 Setup Instructions](#-setup-instructions)
- [🔄 How It Works](#-how-it-works)
- [📊 Dataset Format](#-dataset-format)
- [📡 API Documentation](#-api-documentation)
- [📸 Screenshots](#-screenshots)
- [🧪 Testing](#-testing)
- [🤝 Contributing](#-contributing)
- [📄 License](#-license)

---

## 🎯 Overview

**RBVPS** helps retail businesses predict the total basket value of customer transactions using machine learning. Upload transaction data, get instant predictions, and analyze model performance through interactive dashboards.

### Real-World Use Case
A retail chain wants to predict how much a customer will spend based on:
- Time of purchase (morning/evening)
- Customer loyalty score
- Active promotions
- Previous purchase history
- Store location

This system provides those predictions with **95%+ confidence** and explains which factors influenced each prediction.

---

## ✨ Features

### 🤖 Machine Learning
- **XGBoost Regressor** for accurate basket value predictions
- Real-time inference with confidence scores
- Feature importance analysis (SHAP-style explanations)

### 📊 Analytics & Visualization
- **Dashboard**: Real-time RMSE, MAE, R² metrics
- **7-Day Trend Chart**: Actual vs Predicted values
- **Scatter Plots**: Model accuracy visualization
- **Error Distribution**: Histogram analysis
- **Category Analysis**: Performance by store/region

### 🔐 Security & Authentication
- JWT-style token authentication
- Secure password hashing
- Auto-logout on session expiry
- API key generation for programmatic access

### 📁 Data Management
- Drag-and-drop CSV upload
- Schema validation & duplicate detection
- Paginated prediction history
- Per-record CSV download
- Bulk delete operations

### 🎨 User Experience
- Dark/Light mode toggle
- Responsive design (mobile-friendly)
- Real-time updates
- Interactive charts
- Clean, modern UI
- Forgot password with email reset
- Password strength validation
- Session management

---

## 🛠️ Tech Stack

### Frontend
| Technology | Purpose |
|------------|---------|
| **React 18** | UI framework for building interactive interfaces |
| **Vite** | Fast build tool and dev server |
| **Tailwind CSS** | Utility-first CSS framework |
| **React Router v6** | Client-side routing |
| **Axios** | HTTP client for API calls |

### Backend
| Technology | Purpose |
|------------|---------|
| **Django 4.2** | Python web framework |
| **Django REST Framework** | RESTful API development |
| **PostgreSQL 15** | Production database |
| **NumPy** | Numerical computations (RMSE, MAE, R²) |
| **Gunicorn** | WSGI HTTP server |
| **Brevo (Sendinblue)** | Email service for password reset |
| **dj-database-url** | Database URL parsing |

### Machine Learning
| Technology | Purpose |
|------------|---------|
| **XGBoost** | Gradient boosting algorithm for regression |
| **Feature Engineering** | Data preprocessing pipeline |

### DevOps
| Technology | Purpose |
|------------|---------|
| **Docker** | Containerization |
| **Docker Compose** | Multi-container orchestration |
| **WhiteNoise** | Static file serving |
| **AWS EC2** | Cloud hosting |
| **Nginx** | Reverse proxy and static file serving |

---

## 📂 Project Structure

```
Retail-Basket-Value-Prediction-System/
│
├── backend/                      # Django backend
│   ├── api/
│   │   ├── models.py            # Database models (User, Prediction, PredictionFeatures, APIRequestLog)
│   │   ├── views.py             # API endpoints (auth, predictions, metrics, visualization)
│   │   ├── serializers.py       # Data validation
│   │   ├── urls.py              # URL routing
│   │   ├── middleware.py        # Request logging & monitoring
│   │   ├── authentication.py    # Custom token authentication
│   │   └── management/
│   │       └── commands/
│   │           └── reset_data.py # Database reset utility
│   ├── config/
│   │   └── settings.py          # Django configuration
│   ├── requirements.txt         # Python dependencies
│   └── .env.example             # Environment variables template
│
├── src/                         # React frontend
│   ├── pages/
│   │   ├── Dashboard.jsx        # Main overview
│   │   ├── UploadData.jsx       # File upload
│   │   ├── Predictions.jsx      # Prediction feed
│   │   ├── History.jsx          # Historical records
│   │   ├── Explainability.jsx   # Feature importance
│   │   ├── Metrics.jsx          # Performance metrics
│   │   ├── Visualization.jsx    # Charts & graphs
│   │   ├── Settings.jsx         # User settings
│   │   ├── Login.jsx            # Login with forgot password
│   │   ├── Signup.jsx           # User registration
│   │   ├── ResetPassword.jsx    # Password reset page
│   │   └── PredictionResult.jsx # Individual prediction details
│   ├── services/
│   │   └── api.js               # API client
│   ├── context/
│   │   └── ThemeContext.jsx     # Dark mode state
│   └── App.jsx                  # Main app component
│
├── Data/
│   └── Online Retail.csv        # Sample dataset
│
├── docker-compose.yml           # Docker orchestration (PostgreSQL + Django + React)
├── Dockerfile                   # Frontend container (Nginx + React build)
├── backend/Dockerfile           # Backend container (Gunicorn + Django)
├── nginx.conf                   # Nginx configuration
├── .env.development             # Development environment variables
├── .env.production              # Production environment variables
├── package.json                 # Node dependencies
├── tailwind.config.js           # Tailwind configuration
├── vite.config.js               # Vite configuration
└── README.md                    # This file
```

---

## 🚀 Setup Instructions

### Option 1: Quick Start with Docker (Recommended)

#### Prerequisites
- **Docker** and **Docker Compose** installed
- **Git**

#### Steps
```bash
# Clone repository
git clone https://github.com/kalashmishra21/Retail-Basket-Value-Prediction-System.git
cd Retail-Basket-Value-Prediction-System

# Configure environment variables
cp backend/.env.example backend/.env
# Edit backend/.env with your settings

# Start all services (PostgreSQL + Django + React)
docker compose up -d

# Check status
docker compose ps

# View logs
docker compose logs -f
```

✅ **Application running at:**
- Frontend: `http://localhost:3001`
- Backend: `http://localhost:8000`
- Database: `localhost:5432`

#### Stop Services
```bash
docker compose down
```

---

### Option 2: Local Development Setup

#### Prerequisites
- **Python 3.10+**
- **Node.js 18+**
- **PostgreSQL 15+**
- **Git**

### 1️⃣ Clone Repository
```bash
git clone https://github.com/kalashmishra21/Retail-Basket-Value-Prediction-System.git
cd Retail-Basket-Value-Prediction-System
```

### 2️⃣ Backend Setup
```bash
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# Windows:
venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Configure environment variables
cp .env.example .env
# Edit .env with your PostgreSQL credentials

# Run database migrations
python manage.py migrate

# Create superuser for admin panel
python manage.py createsuperuser

# Start Django server
python manage.py runserver
```
✅ Backend running at: `http://localhost:8000`

### 3️⃣ Frontend Setup
```bash
# Open new terminal, navigate to project root
cd Retail-Basket-Value-Prediction-System

# Install dependencies
npm install

# Configure environment
cp .env.example .env.development
# Edit .env.development if needed

# Start development server
npm run dev
```
✅ Frontend running at: `http://localhost:3001`

### 4️⃣ Access Application
Open browser and navigate to: `http://localhost:3001`

---



## 🔄 How It Works

```
┌─────────────────────────────────────────────────────────────┐
│  1. User Authentication                                      │
│     → Signup/Login with email & password                    │
│     → JWT token generated and stored                        │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│  2. Data Upload                                              │
│     → User uploads CSV file (drag & drop)                   │
│     → Frontend validates: size, format, schema              │
│     → File parsed: row count, columns, null ratio           │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│  3. Backend Processing                                       │
│     → Dataset saved to PostgreSQL                           │
│     → Data cleaning & feature engineering                   │
│     → XGBoost model inference                               │
│     → Prediction + confidence score calculated              │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│  4. Results Storage                                          │
│     → Prediction saved with unique ID (PRED-XXXX)           │
│     → Feature importance computed & stored                  │
│     → Metrics updated (RMSE, MAE, R²)                       │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│  5. Visualization                                            │
│     → Dashboard shows real-time metrics                     │
│     → Charts display trends & accuracy                      │
│     → Explainability page shows feature importance          │
│     → History page allows download/delete                   │
└─────────────────────────────────────────────────────────────┘
```

---

## 📊 Dataset Format

Your CSV must contain these columns:

| Column | Type | Description | Example |
|--------|------|-------------|---------|
| `transaction_id` | String | Unique transaction ID | "TXN-001" |
| `item_id` | String | Product identifier | "PROD-123" |
| `item_list` | String | Comma-separated items | "Apple,Banana,Milk" |
| `promotion_level` | Float | Discount applied (0-1) | 0.15 |
| `customer_loyalty` | Float | Loyalty score (0-1) | 0.85 |
| `time_of_day` | Integer | Hour (0-23) | 14 |
| `day_of_week` | Integer | Day (0=Mon, 6=Sun) | 3 |
| `store_location` | String | Store identifier | "Store-NYC-01" |
| `previous_spend` | Float | Past purchase amount | 250.50 |
| `inventory_depth` | Float | Stock availability (0-1) | 0.90 |

**Supported Formats**: `.csv`, `.json`, `.xlsx`  
**Max File Size**: 50 MB

---

## 📡 API Documentation

### Authentication
```http
POST /api/auth/register/
Content-Type: application/json

{
  "username": "john_doe",
  "email": "john@example.com",
  "password": "SecurePass123"
}
```

```http
POST /api/auth/login/
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "SecurePass123"
}

Response:
{
  "message": "Login successful",
  "token": "abc123...",
  "user": {
    "id": 1,
    "username": "john_doe",
    "email": "john@example.com",
    "full_name": "John Doe",
    "api_key": "ro_live_..."
  }
}
```

```http
POST /api/auth/forgot-password/
Content-Type: application/json

{
  "email": "john@example.com"
}

Response:
{
  "message": "Password reset email sent successfully"
}
```

```http
POST /api/auth/reset-password/
Content-Type: application/json

{
  "token": "reset_token_here",
  "new_password": "NewSecurePass123"
}

Response:
{
  "message": "Password reset successful"
}
```

### Health Check
```http
GET /api/health/

Response:
{
  "status": "ok",
  "service": "Retail Basket Value Prediction API",
  "database": "healthy",
  "version": "1.0.0"
}
```

### Predictions
```http
GET /api/predictions/
Authorization: Token abc123...

Response:
[
  {
    "id": 1,
    "prediction_id": "PRED-6900",
    "predicted_value": "125.50",
    "confidence": "95.20",
    "status": "completed",
    "created_at": "2024-01-15T10:30:00Z"
  }
]
```

```http
POST /api/predictions/
Authorization: Token abc123...
Content-Type: application/json

{
  "dataset_id": 5,
  "features": {
    "promotion_level": 0.15,
    "customer_loyalty": 0.85,
    ...
  }
}
```

### Metrics
```http
GET /api/metrics/latest/
Authorization: Token abc123...

Response:
{
  "rmse": 12.45,
  "mae": 8.32,
  "r2": 0.92,
  "total_predictions": 150
}
```

### Visualization
```http
GET /api/visualization/summary/
Authorization: Token abc123...

Response:
{
  "has_data": true,
  "r2": "0.92",
  "bias": "2.15",
  "outlier_score": "4.5"
}
```

```http
GET /api/visualization/scatter/
Authorization: Token abc123...

Response:
{
  "has_data": true,
  "actual": [100, 150, 200],
  "predicted": [105, 145, 195]
}
```

```http
GET /api/visualization/error-distribution/
Authorization: Token abc123...

Response:
{
  "has_data": true,
  "errors": [-5, 5, 10],
  "mean_error": "3.33",
  "std_error": "6.24"
}
```

---

## 🧪 Testing

### Backend Tests
```bash
cd backend
python manage.py test
```

### Frontend Tests
```bash
npm test
```

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 👨‍💻 Author

**Kalash Mishra**
- Email: kalashji21@gmail.com
- GitHub: [@kalashmishra21](https://github.com/kalashmishra21)
- LinkedIn: [Kalash Mishra](https://www.linkedin.com/in/kalashmishra21/)

---

## 🙏 Acknowledgments

- XGBoost team for the amazing ML library
- Django & React communities
- All contributors and testers

---

## 📞 Support

For issues and questions:
- Open an [Issue](https://github.com/kalashmishra21/Retail-Basket-Value-Prediction-System/issues)
- Email: kalashji21@gmail.com

---

## 🔧 Troubleshooting

### Common Issues

**1. CORS Errors**
- Ensure `ALLOWED_HOSTS` in `backend/.env` includes your domain
- Check `CORS_ALLOWED_ORIGINS` in `backend/config/settings.py`

**2. Database Connection Failed**
- Verify PostgreSQL is running: `docker compose ps`
- Check database credentials in `backend/.env`
- Ensure `DATABASE_URL` format is correct

**3. Frontend Can't Connect to Backend**
- Verify `VITE_API_URL` in `.env.development` or `.env.production`
- Check backend is running: `curl http://localhost:8000/api/health/`
- Ensure ports 3001 and 8000 are not blocked

**4. Email Not Sending (Forgot Password)**
- Verify `BREVO_API_KEY` in `backend/.env`
- Check Brevo account is active
- Ensure `EMAIL_FROM` is verified in Brevo

**5. Docker Build Fails**
- Clear Docker cache: `docker system prune -a`
- Rebuild without cache: `docker compose build --no-cache`
- Check Docker disk space: `docker system df`

---

**⭐ Star this repo if you find it helpful!**

© 2024 Retail Basket Value Prediction System. All Rights Reserved.
