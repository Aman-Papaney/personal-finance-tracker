from flask import Flask, request, jsonify
from flask_cors import CORS
import pandas as pd
from datetime import datetime

app = Flask(__name__)
CORS(app)

@app.route('/suggestions', methods=['POST'])
def suggestions():
    data = request.get_json()
    if not data or 'expenses' not in data:
        return jsonify({'error': 'No expense data provided.'}), 400

    expenses = data['expenses']
    if not expenses:
        return jsonify({'suggestions': ['No expenses to analyze.']}), 200

    # Convert to DataFrame
    df = pd.DataFrame(expenses)
    if 'amount' not in df or 'category' not in df or 'date' not in df:
        return jsonify({'error': 'Missing required fields in expense data.'}), 400

    # Parse dates
    df['date'] = pd.to_datetime(df['date'])
    df['month'] = df['date'].dt.to_period('M')

    # Get current and previous month
    now = datetime.now()
    current_month = pd.Period(now.strftime('%Y-%m'))
    prev_month = current_month - 1

    suggestions = []

    # Spend per category this and last month
    cat_month = df.groupby(['category', 'month'])['amount'].sum().unstack(fill_value=0)
    for cat in cat_month.index:
        curr = cat_month.at[cat, current_month] if current_month in cat_month.columns else 0
        prev = cat_month.at[cat, prev_month] if prev_month in cat_month.columns else 0
        if prev > 0:
            change = (curr - prev) / prev * 100
            if change > 20:
                suggestions.append(f"{cat.capitalize()} expenses increased {change:.0f}% this month.")
            elif change < -15:
                suggestions.append(f"Good job! {cat.capitalize()} expenses decreased {abs(change):.0f}% this month.")
        elif curr > 0:
            suggestions.append(f"You spent {curr:.2f} on {cat} this month.")
        # Suggest reduction if category is high
        if curr > 0 and curr > 0.2 * df['amount'].sum():
            suggestions.append(f"Consider reducing {cat} expenses by 15%.")

    if not suggestions:
        suggestions.append("Spending is stable. Keep it up!")

    return jsonify({'suggestions': suggestions})

if __name__ == '__main__':
    app.run(debug=True, port=5000)
