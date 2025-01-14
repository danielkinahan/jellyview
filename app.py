import requests
import os
import datetime
from flask import Flask, jsonify, request, render_template
from dotenv import load_dotenv

app = Flask(__name__)
load_dotenv()

JF_URL = os.getenv('JF_URL')
API_KEY = os.getenv('API_KEY')
HEADERS = {"Content-Type": "application/json", "Authorization": f'MediaBrowser Token="{API_KEY}"'}

@app.route("/")
def index():
    return render_template('index.html')

@app.route("/breakdown")
def breakdown():

    days = request.args.get("days")
    end_date = request.args.get("end_date")
    timezone_offset = request.args.get("timezoneOffset")

    def fetch_data(endpoint):
        url = f"{JF_URL}/{endpoint}?days=365&end_date=2025-01-13&stamp=1736794049590&timezoneOffset=-5"
        response = requests.get(url, headers=HEADERS)
        return response.json() if response.status_code == 200 else []

    user_activity = fetch_data("user_usage_stats/user_activity")
    user_activity.sort(key=lambda x: datetime.datetime.fromisoformat(x["latest_date"]))
    print(user_activity)

    data = {
        "User": fetch_data("user_usage_stats/UserId/BreakdownReport"),
        "UserActivity": user_activity[:5],
        "ItemType": fetch_data("user_usage_stats/ItemType/BreakdownReport"),
        "PlayMethod": fetch_data("user_usage_stats/PlaybackMethod/BreakdownReport"),
        "ClientName": fetch_data("user_usage_stats/ClientName/BreakdownReport"),
        "DeviceName": fetch_data("user_usage_stats/DeviceName/BreakdownReport"),
        "TvShows": fetch_data("user_usage_stats/GetTvShowsReport"),
        "Movies": fetch_data("user_usage_stats/MoviesReport"),
    }
    return jsonify(data)

if __name__ == '__main__':
    app.run(debug=True)
