from app import app, db
from models import CustomerOrder
from datetime import date, timedelta
import random

with app.app_context():
    db.drop_all()
    db.create_all()

    for i in range(30):
        db.session.add(
            CustomerOrder(
                order_date=date.today() - timedelta(days=i),
                amount=random.randint(500, 3000)
            )
        )
    db.session.commit()
