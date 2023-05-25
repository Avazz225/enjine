from flask import Flask, request
from flask_cors import CORS
from loginHandler import loginFunc

app = Flask(__name__)
CORS(app)

@app.route('/login', methods = ['POST'])
def login():
    return loginFunc.loginHandler(request.json)

app.run()