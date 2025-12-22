from flask import Flask, render_template, jsonify, request
from models import Order, db, CustomerOrder
from datetime import date, timedelta
import json, os

app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///dashboard.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db.init_app(app)

CONFIG_FILE = "config.json"

@app.route("/")
def index():
    return render_template("index.html")

# ---- Date Filter Logic ----
def filter_orders(filter_type):
    today = date.today()

    if filter_type == "Today":
        return CustomerOrder.query.filter(CustomerOrder.order_date == today).all()
    elif filter_type == "Last 7 Days":
        return CustomerOrder.query.filter(CustomerOrder.order_date >= today - timedelta(days=7)).all()
    elif filter_type == "Last 30 Days":
        return CustomerOrder.query.filter(CustomerOrder.order_date >= today - timedelta(days=30)).all()
    elif filter_type == "Last 90 Days":
        return CustomerOrder.query.filter(CustomerOrder.order_date >= today - timedelta(days=90)).all()
    else:
        return CustomerOrder.query.all()

@app.route("/api/orders")
def orders_api():
    filter_type = request.args.get("filter", "All Time")
    orders = filter_orders(filter_type)

    total_amount = sum(o.amount for o in orders)

    return jsonify({
        "count": len(orders),
        "total": total_amount,
        "orders": [
            {"date": o.order_date.isoformat(), "amount": o.amount}
            for o in orders
        ]
    })

# ---- Dashboard Save / Load ----
@app.route("/api/dashboard", methods=["GET", "POST"])
def dashboard_config():
    if request.method == "POST":
        with open(CONFIG_FILE, "w") as f:
            json.dump(request.json, f)
        return {"status": "saved"}

    if not os.path.exists(CONFIG_FILE):
        return jsonify([])
    return jsonify(json.load(open(CONFIG_FILE)))
DASHBOARD_FILE = "dashboard_layout.json"

@app.route("/api/dashboard", methods=["POST"])
def save_dashboard():
    layout = request.json

    with open(DASHBOARD_FILE, "w") as f:
        json.dump(layout, f)

    return jsonify({"status": "saved"}), 200




@app.route("/api/dashboard", methods=["GET"])
def load_dashboard():
    if not os.path.exists(DASHBOARD_FILE):
        return jsonify([])

    with open(DASHBOARD_FILE, "r") as f:
        layout = json.load(f)

    return jsonify(layout)

@app.route("/api/orders", methods=["POST"])
def create_order():
    data = request.json

    order = Order(
        first_name=data["first_name"],
        last_name=data["last_name"],
        email=data["email"],
        phone=data["phone"],
        address=data["address"],
        product=data["product"],
        quantity=data["quantity"],
        unit_price=data["unit_price"],
        total_amount=data["total_amount"],
        status=data["status"],
        created_by=data["created_by"]
    )

    db.session.add(order)
    db.session.commit()

    return jsonify({"message": "Order created"}), 201
@app.route("/api/orders", methods=["GET"])
def get_orders():
    orders = Order.query.all()
    return jsonify([
        {
            "first_name": o.first_name,
            "last_name": o.last_name,
            "product": o.product,
            "quantity": o.quantity,
            "total_amount": o.total_amount,
            "status": o.status
        } for o in orders
    ])


if __name__ == "__main__":
    with app.app_context():
        db.create_all()
    app.run(debug=True)
