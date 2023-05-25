from database import db_connector
import helpers
import bcrypt
import random
import string
import json

def loginHandler(data: json):
    """Handles authentication process."""
    id = checkCreds(data['identifier'], data['password'])
    if not isinstance(id, int):
        return id
    
    # generate auth token and store to database
    token = getToken(id)

    # read assigned rights of the user from database
    rights = getRights(id)

    return {'token': token, 'permissions': json.dumps(rights)}, 200

def checkCreds(identifier: str, pw: str):
    """Checks whether provided password is valid"""
    row = db_connector.read('user', ['id','password', 'pw_valid_until'], {'identifier': identifier, 'active_account': 1}, 'one')
    if row != None:
        #if record was found check password and if True: return ID
        if not helpers.dateComparisionTdy(row[2]): 
            response = json.dumps({'message':'Password expired'})
            return response, 403
        if compare(pw, row[1].encode('utf8')): return row[0]
        else: 
            response = json.dumps({'message':'Invalid password'})
            return response, 401
    else: 
        response = json.dumps({'message':'Invalid username'})
        return response, 404

def compare(pw, hashedpw) -> bool:
    """Handles password validation"""
    return bcrypt.checkpw(pw.encode('utf8'), hashedpw)

def getRights(id) -> dict:
    """Reads assigned rights for user"""
    return db_connector.read('permission', 
                               ['sysAdmin', 
                                'rightAdmin', 'rightGlobal', 'rightLocal',
                                'plunginAdmin', 'pluginGlobal',
                                'processAdmin', 'processGlobal',
                                'userAdmin', 'userGlobal',
                                'logAdmin', 'logGlobal',
                                'groupAdmin', 'groupGlobal',
                                'applicationAdmin', 'applicationGlobal'], 
                               {'id': id}, 
                               'one')

def getToken(id) -> str:
    """Generates auth token and stores it to db"""
    # usage of id in the token ensures that every token is unique
    token = str(id) + ''.join(random.choice(string.ascii_letters + string.digits) for i in range(30-len(str(id))))
    db_connector.update('user', {'token': token}, {'id': id})

    return token