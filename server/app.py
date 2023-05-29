from flask import Flask, request
from flask_cors import CORS
from loginHandler import loginFunc
from account import account
from pwdhandler import pwHandler

app = Flask(__name__)
CORS(app)

@app.route('/changepw', methods = ['UPDATE'])
def change():
    return pwHandler.changePwd(request.json, request.headers.get('Auth-Header'))

@app.route('/login', methods = ['POST'])
def login():
    return loginFunc.loginHandler(request.json)

@app.route('/newAccount', methods = ['PUT'])
def createAcc():
    return account.newAccount(request.json, request.headers.get('Auth-Header'))

@app.route('/accountProperties', methods = ['GET'])
def accProps():
    return account.getGenericProperties(request.headers.get('Auth-Header'))



@app.after_request
def after_request(response):
  response.headers.add('Access-Control-Allow-Origin', '*')
  response.headers.add('Access-Control-Allow-Headers', 'Content-Type,Auth-Header')
  response.headers.add('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS,UPDATE')
  response.headers.add('Access-Control-Allow-Credentials', 'true')
  return response

app.run()