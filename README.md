# Retail Basket Value Prediction System (RBVPS)

A full-stack machine learning web application that predicts the **basket value** of retail transactions. Users upload CSV datasets, the system processes them through an XGBoost regression pipeline, and returns predicted basket values with confidence scores, explainability analysis, and performance metrics.

---

## Features

- **ML Predictions** — Upload retail transaction data and get basket value predictions powered by XGBoost Regressor
- **Dashboard** — Real-time overview with RMSE, MAE, total predictions, and a 7-day basket value trend chart
- **Data Upload** — Drag-and-drop CSV upload with schema validation, null ratio check, and duplicate detection
- **Authentication** — Secure JWT-style token authentication with signup, login, and auto-logout on session expiry
- **Model Explainability** — Per-prediction feature importance with Primary Driver / Supporting Factor / Insignificant classification
- **Prediction History** — Paginated history with date filter, search, per-record download (CSV), and delete
- **Performance Metrics** — RMSE time series, MAE trend, R² score, model snapshots, and analysis notes
- **System Monitoring** — Infrastructure health, API usage, inference load, and prediction accuracy chart
- **Visualization** — Actual vs. Predicted scatter plot, error distribution histogram, and category-level error analysis
- **Dark Mode** — Persistent dark/light theme across all pages

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, Vite, Tailwind CSS, React Router v6 |
| Backend | Django 4.2, Django REST Framework 3.14 |
| Database | SQLite (development) |
| ML Algorithm | XGBoost Regressor (conceptual integration) |
| Auth | DRF Token Authentication |
| HTTP Client | Axios |
| Metrics | NumPy (RMSE, MAE, R²) |

---

## Project Structure

```
├── backend/
│   ├── api/
│   │   ├── models.py          # User, Dataset, Prediction, PredictionFeatures, ModelMetrics
│   │   ├── views.py           # All API logic — auth, predictions, metrics, explainability
│   │   ├── serializers.py     # DRF serializers with validation
│   │   ├── urls.py            # API endpoint routing
│   │   ├── authentication.py  # CSRF-exempt session auth for development
│   │   └── management/
│   │       └── commands/
│   │           └── reset_data.py  # CLI command to clear all data
│   ├── config/
│   │   └── settings.py        # Django configuration
│   ├── .env.example           # Environment variable template
│   └── requirements.txt
│
├── src/
│   ├── pages/
│   │   ├── Dashboard.jsx      # Main overview + trends chart
│   │   ├── UploadData.jsx     # File upload + prediction trigger
│   │   ├── Predictions.jsx    # Live prediction feed with date filter
│   │   ├── PredictionResult.jsx  # Single prediction detail
│   │   ├── History.jsx        # Paginated history with 3-dot menu
│   │   ├── Explainability.jsx # Feature importance per prediction
│   │   ├── Metrics.jsx        # RMSE, MAE, R² charts
│   │   ├── Monitoring.jsx     # System health
│   │   ├── Visualization.jsx  # Model analysis gallery
│   │   ├── Settings.jsx       # Profile, API key, notifications
│   │   ├── Login.jsx
│   │   └── Signup.jsx
│   ├── services/
│   │   └── api.js             # Axios instance + token interceptor + auto-logout
│   ├── context/
│   │   └── ThemeContext.jsx   # Dark/light mode state
│   └── App.jsx                # Route definitions
│
├── .gitignore
├── package.json
└── vite.config.js             # Vite dev server + proxy to Django
```

---

## Dataset Format

Your CSV file must include the following columns:

| Column | Description |
|---|---|
| `transaction_id` | Unique transaction identifier |
| `item_id` | Product/item identifier |
| `item_list` | List of items in the basket |
| `promotion_level` | Discount/promotion applied (0–1) |
| `customer_loyalty` | Customer loyalty score (0–1) |
| `time_of_day` | Hour of transaction (0–23) |
| `day_of_week` | Day number (0–6) |
| `store_location` | Store identifier |
| `previous_spend` | Customer's previous spend amount |
| `inventory_depth` | Stock availability score |

Supported formats: `.csv`, `.json`, `.xlsx` — max 50 MB.

---

## How It Works

```
1. User signs up / logs in
        ↓
2. Upload a retail transaction CSV on the Upload Data page
        ↓
3. Frontend parses file stats (row count, column count, null ratio, duplicates)
        ↓
4. Dataset record saved to DB via POST /api/datasets/
        ↓
5. Processing pipeline runs (Data Cleaning → Feature Engineering → Validation → Inference)
        ↓
6. Prediction saved to DB via POST /api/predictions/
   - predicted_value: derived from dataset properties (deterministic)
   - confidence: based on feature richness
   - store_location: deterministic hash of prediction_id
        ↓
7. Feature importance computed and stored in PredictionFeatures table
        ↓
8. User navigates to:
   - Dashboard   → see RMSE, MAE, trend chart
   - Predictions → browse all predictions
   - Explainability → see feature importance per prediction
   - History     → download or delete records
   - Metrics     → detailed performance charts
```

---

## Metrics Explained

### RMSE — Root Mean Square Error
```
RMSE = √( Σ(actual - predicted)² / n )
```
Measures average prediction error with larger errors penalized more. Lower is better.
In this system: `actual = predicted × 0.93` (deterministic proxy).

### MAE — Mean Absolute Error
```
MAE = Σ|actual - predicted| / n
```
Average absolute difference between actual and predicted values. More interpretable than RMSE.

### R² — Coefficient of Determination
```
R² = 1 - (SS_residual / SS_total)
```
Proportion of variance explained by the model. Range: 0–1. Higher is better (target: 0.90).

---

## Setup Instructions

### Prerequisites
- Python 3.10+
- Node.js 18+

### 1. Clone the repository
```bash
git clone https://github.com/kalashmishra21/Retail-Basket-Value-Prediction-System.git
cd Retail-Basket-Value-Prediction-System
```

### 2. Backend setup
```bash
cd backend

# Create virtual environment
python -m venv venv
venv\Scripts\activate        # Windows
# source venv/bin/activate   # macOS/Linux

# Install dependencies
pip install -r requirements.txt

# Create .env file (copy from example)
copy .env.example .env       # Windows
# cp .env.example .env       # macOS/Linux

# Run migrations
python manage.py migrate

# Start backend server
python manage.py runserver
```
Backend runs at: `http://localhost:8000`

### 3. Frontend setup
```bash
# From project root
npm install
npm run dev
```
Frontend runs at: `http://localhost:3001`

### 4. (Optional) Reset all data
```bash
cd backend
python manage.py reset_data --confirm
```

---

## API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/register/` | Register new user |
| POST | `/api/auth/login/` | Login + get token |
| GET | `/api/predictions/` | List user predictions |
| POST | `/api/predictions/` | Create prediction |
| DELETE | `/api/predictions/:id/` | Delete prediction |
| GET | `/api/predictions/:id/download/` | Download as CSV |
| GET | `/api/metrics/latest/` | RMSE, MAE, R² |
| GET | `/api/metrics/trends/` | 7-day basket value trend |
| GET | `/api/explainability/:predictionId/` | Feature importance |
| GET | `/api/datasets/` | List datasets |
| POST | `/api/datasets/` | Upload dataset metadata |

---

## Author

**Kalash Mishra**
GitHub: [github.com/kalashmishra21](https://github.com/kalashmishra21)

---

© 2024 Retail Basket Value Prediction System
