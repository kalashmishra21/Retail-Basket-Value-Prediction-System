# 🛒 Retail Basket Value Prediction System (RBVPS)

A production-ready, full-stack machine learning web application that predicts retail basket values using **XGBoost Regressor**. Built with React, Django, and PostgreSQL.

[![Python](https://img.shields.io/badge/Python-3.10+-blue.svg)](https://www.python.org/)
[![Django](https://img.shields.io/badge/Django-4.2-green.svg)](https://www.djangoproject.com/)
[![React](https://img.shields.io/badge/React-18.2-61DAFB.svg)](https://reactjs.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-336791.svg)](https://www.postgresql.org/)

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

---

## 📂 Project Structure

```
Retail-Basket-Value-Prediction-System/
│
├── backend/                      # Django backend
│   ├── api/
│   │   ├── models.py            # Database models
│   │   ├── views.py             # API endpoints
│   │   ├── serializers.py       # Data validation
│   │   ├── urls.py              # URL routing
│   │   ├── middleware.py        # Request logging
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
│   │   └── Settings.jsx         # User settings
│   ├── services/
│   │   └── api.js               # API client
│   ├── context/
│   │   └── ThemeContext.jsx     # Dark mode state
│   └── App.jsx                  # Main app component
│
├── Data/
│   └── Online Retail.csv        # Sample dataset
│
├── docker-compose.yml           # Docker orchestration
├── Dockerfile                   # Frontend container
├── package.json                 # Node dependencies
├── tailwind.config.js           # Tailwind configuration
├── vite.config.js               # Vite configuration
└── README.md                    # This file
```

---

## 🚀 Setup Instructions

### Prerequisites
- **Python 3.10+**
- **Node.js 18+**
- **PostgreSQL 15+**
- **Git**

### 1️⃣ Clone Repository
```bash
git clone https://github.com/kalashmishra21/Retail-Basket-Value-Prediction-System.git
cd Retail-Basket-Value-Prediction-System
```

### 2️⃣ Setup PostgreSQL Database
Follow the instructions in `SETUP_POSTGRESQL.txt` to:
- Install PostgreSQL
- Create database: `retail_basket_db`
- Create user with password

### 3️⃣ Backend Setup
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
# Edit backend/.env with your PostgreSQL credentials

# Run database migrations
python manage.py migrate

# Create superuser (optional)
python manage.py createsuperuser

# Start Django server
python manage.py runserver
```
✅ Backend running at: `http://localhost:8000`

### 4️⃣ Frontend Setup
```bash
# Open new terminal, navigate to project root
cd Retail-Basket-Value-Prediction-System

# Install dependencies
npm install

# Start development server
npm run dev
```
✅ Frontend running at: `http://localhost:3001`

### 5️⃣ Access Application
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
  "token": "abc123...",
  "user": { "id": 1, "name": "John Doe", "email": "john@example.com" }
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

---

## 🧪 Testing

### Run Backend Tests
```bash
cd backend
python manage.py test
```

### Run Frontend Tests
```bash
npm test
```

---

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
- Email: kalashji21@example.com

---

**⭐ Star this repo if you find it helpful!**

© 2024 Retail Basket Value Prediction System. All Rights Reserved.
