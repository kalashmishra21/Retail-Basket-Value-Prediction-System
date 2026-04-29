# 🛒 Retail Basket Value Prediction System

A production-ready machine learning web application that predicts retail basket values using **XGBoost**. Built with React, Django REST Framework, and PostgreSQL.

[![Python](https://img.shields.io/badge/Python-3.10+-blue.svg)](https://www.python.org/)
[![Django](https://img.shields.io/badge/Django-4.2-green.svg)](https://www.djangoproject.com/)
[![React](https://img.shields.io/badge/React-18.2-61DAFB.svg)](https://reactjs.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-336791.svg)](https://www.postgresql.org/)

---

## 🎯 Overview

**RBVPS** helps retail businesses predict customer basket values using machine learning. Upload transaction data, get instant predictions with 90%+ accuracy, and analyze model performance through interactive dashboards.

### Key Capabilities
- Real-time basket value predictions with confidence scores
- Feature importance analysis for explainability
- Performance metrics tracking (RMSE, MAE, R²)
- Interactive data visualization
- Historical prediction management

---

## ✨ Features

### 🤖 Machine Learning
- **XGBoost Regressor** with 90%+ R² score
- Confidence intervals and outlier detection
- Feature importance analysis

### 📊 Analytics Dashboard
- Real-time RMSE, MAE, R² metrics
- 7-day trend visualization
- Scatter plots and error distribution
- Category-wise performance analysis

### 🔐 Security
- Token-based authentication
- Password reset via email
- Secure session management
- User data isolation

### 📁 Data Management
- CSV file upload with validation
- Paginated prediction history
- Individual record download
- Bulk operations support

### 🎨 User Interface
- Dark/Light mode
- Responsive design
- Real-time updates
- Clean, modern UI

---

## 🛠️ Tech Stack

**Frontend:** React 18, Vite, Tailwind CSS, Axios  
**Backend:** Django 4.2, Django REST Framework, PostgreSQL  
**ML:** XGBoost, NumPy, Pandas, Scikit-learn  
**DevOps:** Docker, Docker Compose, Nginx, Gunicorn

---

## 📂 Project Structure

```
├── backend/                 # Django REST API
│   ├── api/                # Models, views, serializers
│   ├── ml/                 # ML models and training
│   └── config/             # Django settings
├── src/                    # React frontend
│   ├── pages/              # Page components
│   ├── components/         # Reusable components
│   └── services/           # API client
├── Data/                   # Training dataset
├── docker-compose.yml      # Docker orchestration
└── README.md              # Documentation
```

---

## 🚀 Quick Start

### Prerequisites
- Docker & Docker Compose
- Git

### Installation

```bash
# Clone repository
git clone https://github.com/kalashmishra21/Retail-Basket-Value-Prediction-System.git
cd Retail-Basket-Value-Prediction-System

# Configure environment
cp backend/.env.example backend/.env
# Edit backend/.env with your database credentials

# Start services
docker compose up -d

# Check status
docker compose ps
```

**Access Application:**
- Frontend: `http://localhost:3001`
- Backend API: `http://localhost:8000`
- Health Check: `http://localhost:8000/api/health/`

### Stop Services
```bash
docker compose down
```

---

## 💻 Local Development

### Backend Setup
```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
```

### Frontend Setup
```bash
npm install
npm run dev
```

### Train ML Model
```bash
cd backend
python ml/train_model.py
```

---

## 📊 Dataset Format

Required CSV columns:

| Column | Type | Description |
|--------|------|-------------|
| InvoiceNo | String | Transaction ID |
| Quantity | Integer | Item quantity |
| UnitPrice | Float | Item price |
| InvoiceDate | DateTime | Transaction timestamp |
| CustomerID | String | Customer identifier |

**Supported formats:** CSV, XLSX  
**Max file size:** 50 MB

---

## 📡 API Endpoints

### Authentication
```http
POST /api/auth/register/
POST /api/auth/login/
POST /api/auth/logout/
POST /api/auth/forgot-password/
POST /api/auth/reset-password/
```

### Predictions
```http
GET    /api/predictions/
POST   /api/predictions/
GET    /api/predictions/{id}/
DELETE /api/predictions/{id}/
GET    /api/predictions/{id}/download/
```

### Metrics
```http
GET /api/metrics/latest/
GET /api/metrics/trends/
GET /api/metrics/summary/
GET /api/metrics/timeseries/
```

### Visualization
```http
GET /api/visualization/summary/
GET /api/visualization/scatter/
GET /api/visualization/error-distribution/
GET /api/visualization/category-analysis/
```

### Explainability
```http
GET /api/explainability/{prediction_id}/
```

---

## 🔄 How It Works

1. **Upload Data** → User uploads CSV file
2. **Validation** → System validates schema and data quality
3. **Feature Engineering** → Extract features from transactions
4. **ML Inference** → XGBoost model predicts basket value
5. **Results** → Display prediction with confidence score
6. **Analytics** → Track performance metrics over time

---

## 🧪 Testing

```bash
# Backend tests
cd backend
python manage.py test

# Frontend tests
npm test
```

---

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/NewFeature`)
3. Commit changes (`git commit -m 'Add NewFeature'`)
4. Push to branch (`git push origin feature/NewFeature`)
5. Open Pull Request

---

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details.

---

## 👨‍💻 Author

**Kalash Mishra**  
📧 kalashji21@gmail.com  
🔗 [GitHub](https://github.com/kalashmishra21) | [LinkedIn](https://www.linkedin.com/in/kalashmishra21/)

---

## 🔧 Troubleshooting

**Database Connection Issues:**
- Verify PostgreSQL is running: `docker compose ps`
- Check credentials in `backend/.env`

**CORS Errors:**
- Update `ALLOWED_HOSTS` in backend settings
- Verify `VITE_API_URL` in frontend `.env`

**Email Not Sending:**
- Check `BREVO_API_KEY` in `backend/.env`
- Verify email service configuration

**Docker Build Fails:**
- Clear cache: `docker system prune -a`
- Rebuild: `docker compose build --no-cache`

---

**⭐ Star this repo if you find it helpful!**

© 2024 Retail Basket Value Prediction System
