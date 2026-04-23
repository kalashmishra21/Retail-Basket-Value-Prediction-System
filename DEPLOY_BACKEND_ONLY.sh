#!/bin/bash

# ============================================
# Deploy Backend + Database Only (No Frontend)
# Frontend moved to Vercel
# ============================================

echo "🚀 Starting Backend + Database Deployment..."

# Step 1: Stop all existing containers
echo "📦 Stopping existing containers..."
sudo docker compose down

# Step 2: Remove old frontend container and image (cleanup)
echo "🗑️  Removing old frontend container and image..."
sudo docker rm -f retail_basket_frontend 2>/dev/null || true
sudo docker rmi retail-basket-value-prediction-system-frontend 2>/dev/null || true

# Step 3: Rebuild backend (in case of code changes)
echo "🔨 Rebuilding backend..."
sudo docker compose build --no-cache backend

# Step 4: Start backend + database
echo "▶️  Starting backend and database..."
sudo docker compose up -d

# Step 5: Wait for services to be healthy
echo "⏳ Waiting for services to start..."
sleep 10

# Step 6: Check status
echo "✅ Checking service status..."
sudo docker compose ps

# Step 7: Check backend health
echo "🏥 Checking backend health..."
sleep 5
curl -f http://localhost:8000/api/health/ || echo "⚠️  Backend health check failed (might need more time)"

# Step 8: Show logs
echo "📋 Recent logs:"
sudo docker compose logs --tail=20

echo ""
echo "✅ Deployment Complete!"
echo ""
echo "📊 Services Running:"
echo "   - Backend API: http://$(curl -s ifconfig.me):8000"
echo "   - Database: localhost:5432"
echo ""
echo "🔍 Useful Commands:"
echo "   - View logs: sudo docker compose logs -f"
echo "   - Restart: sudo docker compose restart"
echo "   - Stop: sudo docker compose down"
echo ""
