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


## ⚙️ Configure Dashboard Mode

- Drag widgets from left panel
- Resize and reposition widgets
- Configure widget settings
- Save dashboard layout

![Configure Dashboard](1.png)

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


## 1. Homepage

<p align="center">
  <img src="screenshots/1.png" width="1000" height="563"><br>
  
</p>

## 
<p align="center">
  <img src="screenshots/2.png" width="1000" height="563"><br>
</p>

##

<p align="center">
  <img src="screenshots/3.png" width="1000" height="563"><br>
</p>

<p align="center">
  <img src="4.png" width="1000" height="563"><br>
  <b>Image 4</b>
</p>


<p align="center">
  <img src="5.png" width="1000" height="563"><br>
  <b>Image 5</b>
</p>

<p align="center">
  <img src="6.png" width="1000" height="563"><br>
</p>

<p align="center">
  <img src="screenshots/7.png" width="1000" height="563"><br>
</p>


<p align="center">
  <img src="8.png" width="1000" height="563"><br>
  <b>Image 8</b>
</p>

<p align="center">
  <img src="9.png" width="1000" height="563"><br>
  <b>Image 9</b>
</p>


<p align="center">
  <img src="10.png" width="1000" height="563"><br>
</p>

## 
<p align="center">
  <img src="11.png" width="1000" height="563"><br>
</p>




```bash
# Install dependencies
pip install flask

# Run the app
python app.py
