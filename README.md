# Equipment Inventory - Backend

Backend API and AI Service for equipment inventory management system.

## 📁 Project Structure

```
equipment-inventory-backend/
├── BACKEND/          # Node.js Express API
│   ├── src/
│   ├── database/
│   └── package.json
│
└── AI-SERVICE/       # Python FastAPI Service
    ├── src/
    ├── requirements.txt
    └── main.py
```

## 🚀 Tech Stack

### Backend
- **Node.js** + **Express**
- **TypeScript**
- **Supabase PostgreSQL**

### AI Service
- **Python** + **FastAPI**
- **scikit-learn**
- **pandas**

---

## 🔧 Backend Setup

### 1. Install Dependencies

```bash
cd BACKEND
npm install
```

### 2. Environment Variables

Create `BACKEND/.env`:

```env
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
SUPABASE_ANON_KEY=your_anon_key
PORT=3001
FRONTEND_URL=https://your-frontend-url.vercel.app
```

### 3. Database Setup

Run `BACKEND/database/complete_schema.sql` in Supabase SQL Editor.

### 4. Run Development Server

```bash
npm run dev
```

Runs on http://localhost:3001

---

## 🤖 AI Service Setup

### 1. Install Dependencies

```bash
cd AI-SERVICE
python -m venv venv
venv\Scripts\activate  # Windows
# source venv/bin/activate  # Linux/Mac
pip install -r requirements.txt
```

### 2. Environment Variables

Create `AI-SERVICE/.env`:

```env
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
API_URL=http://localhost:3001/api
```

### 3. Run Development Server

```bash
uvicorn main:app --reload
```

Runs on http://localhost:8000

---

## 🚀 Deployment

### Railway Deployment

#### Option 1: Deploy Backend Only

1. Connect GitHub repo to Railway
2. Set Root Directory: `BACKEND`
3. Build Command: `npm install && npm run build`
4. Start Command: `npm start`
5. Add Environment Variables

#### Option 2: Deploy Both Services

1. **Backend Service:**
   - Root Directory: `BACKEND`
   - Build: `npm install && npm run build`
   - Start: `npm start`

2. **AI Service:**
   - Add New Service
   - Root Directory: `AI-SERVICE`
   - Build: `pip install -r requirements.txt`
   - Start: `uvicorn main:app --host 0.0.0.0 --port $PORT`

---

## 📡 API Endpoints

### Backend (Port 3001)

- `GET /api/equipments` - List all equipments
- `POST /api/equipments` - Create equipment
- `GET /api/orders` - List all orders
- `POST /api/orders` - Create order
- `GET /api/orders/:id/attachments` - Get order attachments
- `POST /api/orders/:id/attachments` - Upload receipt file

### AI Service (Port 8000)

- `GET /api/health` - Health check
- `POST /api/predict` - Generate consumption predictions

---

## 📝 License

MIT

