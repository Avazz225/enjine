from database import db_connector
import helpers
import random
import string
import json

def loginHandler(data: json):
    """Handles authentication process."""
    res = checkCreds(data['identifier'], data['password'])
    try:
        id = res['id']
        remTime = res['remainingPwTime']
    except:
        id = res
    if not isinstance(id, int):
        return id
    
    # generate auth token and store to database
    token = getToken(id)

    # read assigned rights of the user from database
    rights = helpers.getRights(id)

    return {'token': token, 'permissions': rights, 'remainingPwTime': remTime}, 200

def checkCreds(identifier: str, pw: str):
    """Checks whether provided password is valid"""
    row = db_connector.read('user', ['id','password', 'pw_valid_until'], {'identifier': identifier, 'active_account': 1}, 'one')
    if row != None:
        #if record was found check password and if True: return ID
        untilDate = row['pw_valid_until']
        if helpers.dateComparisionTdy(untilDate): 
            response = json.dumps({'message':'Password expired'})
            return response, 403
        if helpers.comparePW(pw, row['password'].encode('utf8')): return {'id': row['id'], 'remainingPwTime': helpers.dateDifferenceTdy(untilDate)}
        else: 
            response = json.dumps({'message':'Invalid password'})
            return response, 401
    else: 
        response = json.dumps({'message':'Invalid username'})
        return response, 404

def getToken(id: int) -> str:
    """Generates auth token and stores it to db"""
    # usage of id in the token ensures that every token is unique
    token = str(id) + ''.join(random.choice(string.ascii_letters + string.digits) for i in range(30-len(str(id))))
    tokenexpires = helpers.getDate(db_connector.read('client_config1',['token_duration'], returnType='one')['token_duration'])
    db_connector.update('user', {'token': token, 'token_valid_until': tokenexpires}, {'id': id})

    return {'str': token, 'valid_until': tokenexpires}