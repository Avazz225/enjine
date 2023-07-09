import helpers
import json
from database import db_connector
from rightManagement import rightMgmt

def changePwd(data: json, token:str):
    """Controls password change. """
    if data['admReset'] == 'true':
        priv = rightMgmt.approveUserManagement(token)
        if type(priv) == bool:
            res = changeAdm(data['id'])
            db_connector.create('event_log', {
                                    'type':'information',
                                    'description':'User with id %s reset password for user with id %s.' % (helpers.getID(token), data['id'])
                                    })
            return res
        else:
            db_connector.create('event_log', {
                                        'type':'warning',
                                        'description':'Illegal access detected. User with id %s tried to reset password for user with id %s' % (priv, data['id'])
                                        })
            response = json.dumps({'message':'Insufficient rights.'})
            return response, 401
    else:
        return changeSelf(data, token)
    
def changeAdm(id:int):
    """Handles change of passwords if it is initiated by an admin."""
    row = db_connector.read('user', ['id','pw_history', 'password'], {'id': id, 'active_account': 1}, 'one')
    row2 = db_connector.read('client_config',['initial_pw_duration', 'old_pw_count'],{'id': 1}, 'one')

    try: history = row['pw_history'][1:(len(row['pw_history'])-1)].split(',')
    except: history = []

    duration = row2['initial_pw_duration']
    count = row2['old_pw_count']
    history = addToHistory(row['password'], history, count)

    newPwd = helpers.getRandomPassword(16)
    db_connector.update('user', {'password': helpers.encryptPassword(newPwd), 'pw_valid_until': helpers.getDate(duration), 'pw_history': history}, {'id': row['id']})
    
    response = json.dumps({'message':'Password changed successfully', 'password': newPwd})
    return response, 200

def changeSelf(data: json, token:str):
    """Handles change of passwords if it is initiated by the user."""
    oldPw = data['oldpw']
    newPw = data['newpw']

    row = db_connector.read('user', ['id','password', 'token_valid_until', 'pw_history'], {'token': token, 'active_account': 1}, 'one')

    print(row['token_valid_until'])

    if not row or helpers.dateComparisionTdy(row['token_valid_until']):
        response = json.dumps({'message':'Token expired'})
        return response, 403

    if not helpers.comparePW(oldPw, row['password'].encode('utf8')):
        response = json.dumps({'message':'Invalid old password'})
        return response, 401
    
    if helpers.comparePW(newPw, row['password'].encode('utf8')):
        response = json.dumps({'message':'Old and new password similar.'})
        return response, 409
    
    try: history = row['pw_history'][1:(len(row['pw_history'])-1)].split(',')
    except: history = []

    for hpw in history:
        if helpers.comparePW(newPw, hpw.replace(' ','').encode('utf8')):
            response = json.dumps({'message':'Historic and new password similar.'})
            return response, 409

    row2 = db_connector.read('client_config1',['pw_duration', 'old_pw_count'],{'id': 1}, 'one')
    duration = row2['pw_duration']

    count = row2['old_pw_count']

    history = addToHistory(row['password'], history, count)

    db_connector.update('user', {'password': helpers.encryptPassword(newPw), 'pw_valid_until': helpers.getDate(duration), 'pw_history': history}, {'id': row['id']})

    response = json.dumps({'message':'Password changed successfully'})
    return response, 200


def addToHistory(pwd:str, history:list, oldPwCount:int) -> str:
    """Adds a password to the password history. Removes the oldest one if oldPwCount would be exceeded."""
    if len(history) == oldPwCount:
        del history[0]
    history.append(str(pwd))
    return str(history).replace("'",'')
