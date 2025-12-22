# 📊 Dashboard Configuration POC

A responsive **Dashboard Configuration System** built using **Flask, GridStack.js, and Chart.js**.  
Users can **drag & drop widgets**, configure them, and view analytics in a clean dashboard layout.

---

## 🚀 Features

- Drag & Drop dashboard widgets
- Configure dashboard layout
- KPI, Chart, and Table widgets
- Supports Bar, Line, Pie, Area & Scatter charts
- Responsive layout (Desktop / Tablet / Mobile)
- Dashboard state saved and restored
- Separate **Configure Mode** and **View Mode**

---

## 🛠️ Tech Stack

- **Frontend**: HTML, CSS, JavaScript  
- **Grid System**: GridStack.js  
- **Charts**: Chart.js  
- **Backend**: Python (Flask)  
- **Database**: SQLite (for dashboard config & orders)

---

## 🖥️ Dashboard Views

### 🔹 Desktop View (12 Columns)
![Desktop View](DashBoardScreenshort/1.png)

### 🔹 Tablet View (8 Columns)
![Tablet View](screenshots/dashboard_tablet.png)

### 🔹 Mobile View (4 Columns)
![Mobile View](screenshots/dashboard_mobile.png)

---

## ⚙️ Configure Dashboard Mode

- Drag widgets from left panel
- Resize and reposition widgets
- Configure widget settings
- Save dashboard layout

![Configure Dashboard](screenshots/configure_dashboard.png)

---

## 📦 Available Widgets

### 📊 Charts
- Bar Chart
- Line Chart
- Pie Chart
- Area Chart
- Scatter Plot

### 📋 Tables
- Customer Orders Table

### 🔢 KPIs
- Total Orders
- Total Revenue
- Total Customers
- Total Quantity

---

## 🔄 Dashboard Workflow

1. User clicks **Configure Dashboard**
2. Selects widgets from library
3. Drags widgets into grid
4. Configures widget settings
5. Clicks **Save**
6. Dashboard loads in View Mode

---

## 📱 Responsive Behavior

| Screen Size | Grid Columns |
|------------|-------------|
| Desktop    | 12 Columns  |
| Tablet     | 8 Columns   |
| Mobile     | 4 Columns   |

Widgets automatically rearrange based on screen size.

---

## ▶️ How to Run the Project

```bash
# Install dependencies
pip install flask

# Run the app
python app.py
