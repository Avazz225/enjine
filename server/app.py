from flask import Flask, request
from flask_cors import CORS
from loginHandler import loginFunc
from account import account
from pwdhandler import pwHandler
from user import userFunc
from plugin import pluginManager
from groups import groupManager

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

@app.route('/getUsers', methods = ['POST'])
def getU():
    return userFunc.getUsers(request.json, request.headers.get('Auth-Header'))

@app.route('/getPlugIns', methods = ['GET'])
def getPs():
    return pluginManager.getPlugIns(request.headers.get('Auth-Header'))

@app.route('/setPluginConfig', methods = ['UPDATE'])
def setPs():
    return pluginManager.setPluginConfig(request.json, request.headers.get('Auth-Header'))

@app.route('/refreshPlugIns', methods = ['UPDATE'])
def refPs():
    return pluginManager.refreshPlugIns(request.headers.get('Auth-Header'))

@app.route('/getGroups', methods = ['GET'])
def getGr():
    return groupManager.getGroups(request.headers.get('Auth-Header'))

@app.route('/addGroups', methods = ['POST'])
def addGr():
    return groupManager.addGroups(request.json, request.headers.get('Auth-Header'))


@app.after_request
def after_request(response):
  response.headers.add('Access-Control-Allow-Origin', '*')
  response.headers.add('Access-Control-Allow-Headers', 'Content-Type,Auth-Header')
  response.headers.add('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS,UPDATE')
  response.headers.add('Access-Control-Allow-Credentials', 'true')
  return response

app.run()