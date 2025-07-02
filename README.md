# Personal Finance Tracker

A **full-stack personal finance management web application** that allows users to track their daily expenses, set monthly budgets, and view insightful reports. It also includes a **Python smart suggestions service** for personalized budgeting advice.

---

## 🚀 **Project Features**

✅ User authentication (signup & login)
✅ Add, edit, delete, filter, and search expenses
✅ Set monthly budgets with alerts at 80% and 100% usage
✅ Dashboard with:
- Total spend this month
- Most spent category
- Top 3 payment methods
- Pie chart for category-wise spend
- Line chart for spending trends

✅ Smart suggestions using Python Flask + Pandas:
- Analyzes expenses of the last 30 days
- Suggests actionable tips to reduce overspending

✅ Responsive UI built with **React TypeScript + Material UI**
✅ Backend APIs built with **Node.js + Express + MongoDB**
✅ Python microservice using **Flask + Pandas**

---

## 🗂️ **Monorepo Structure**

personal-finance-tracker/
├── backend/ # Node.js + Express backend
├── frontend/ # React.js + TypeScript + Material UI frontend
└── python-service/ # Flask API for suggestions


---

## 🔧 **Setup Instructions**

### ✅ **1. Clone the repository**


    git clone <repository-url>
    cd personal-finance-tracker


### ✅ **2. Frontend**

    Navigate to the frontend folder:

    cd frontend

    npm install

Create a .env file based on .env.example:

VITE_BACKEND_URL=http://localhost:3000

Run the development server:

    npm run dev

The app will be live at http://localhost:5173.
### ✅ 3. Backend

Navigate to the backend folder:

    cd ../backend

Install dependencies:

    npm install

Create a .env file based on .env.example:

    MONGODB_URI=<your-mongodb-uri>
    JWT_SECRET=<your-jwt-secret>
    PORT=5000

Run the server:

    npm run dev

The backend runs on http://localhost:5000.
### ✅ **4. Python Service**

Navigate to the python-service folder:

    cd ../python-service

Create a virtual environment and activate it:

    python -m venv venv
# Windows
    venv\Scripts\activate
# macOS/Linux
    source venv/bin/activate

Install dependencies:

    pip install -r requirements.txt

Run the Flask app:

    python app.py

The service runs on http://localhost:5000.

🔐 Test Credentials

Email : aman@example.com
Password : amanaman
