import helpers
import json
from database import db_connector
from rightManagement import rightMgmt

def changePwd(data: json, token:str, admReset:bool = False):
    if admReset:
        priv = rightMgmt.approveUserManagement(token)
        if type(priv) == bool:
            res = changeAdm(data['id'])
            db_connector.create('event_log', {
                                    'processID': 0,
                                    'type':'information',
                                    'description':'User with id %s reset password for user with id %s.' % (helpers.getID(token), data['id'])
                                    })
            return res
        else:
            db_connector.create('event_log', {
                                        'processID': 0,
                                        'type':'warning',
                                        'description':'Illegal access detected. User with id %s tried to reset password for user with id %s' % (priv, data['id'])
                                        })
            response = json.dumps({'message':'Insufficient rights.'})
            return response, 401
    else:
        return changeSelf(data, token)
    
def changeAdm(id:int):
    row = db_connector.read('user', ['pw_history'], {'id': id, 'active_account': 1}, 'one')
    row2 = db_connector.read('client_config',['initial_pw_duration', 'old_pw_count'],{'id': 1}, 'one')

    try: history = row['pw_history'][1:(len(row['pw_history'])-1)].split(',')
    except: history = []

    duration = row2['initial_pw_duration']
    count = row2['old_pw_count']
    history = addToHistory(row['password'].encode('utf-8'), history, count)

    newPwd = helpers.getRandomPassword(16)
    db_connector.update('user', {'password': helpers.encryptPassword(newPwd), 'pw_valid_until': helpers.getDate(duration), 'pw_history': history}, {'id': row['id']})
    
    response = json.dumps({'message':'Password changed successfully', 'password': newPwd})
    return response, 200

def changeSelf(data: json, token:str):
    oldPw = data['oldpw']
    newPw = data['newpw']

    row = db_connector.read('user', ['id','password', 'token_valid_until', 'pw_history'], {'token': token, 'active_account': 1}, 'one')

    if not row or helpers.dateComparisionTdy(row['token_valid_until'][1:(len(row['token_valid_until'])-1)].split(',')):
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

    row2 = db_connector.read('client_config',['pw_duration', 'old_pw_count'],{'id': 1}, 'one')
    duration = row2['pw_duration']

    count = row2['old_pw_count']

    history = addToHistory(row['password'].encode('utf-8'), history, count)

    db_connector.update('user', {'password': helpers.encryptPassword(newPw), 'pw_valid_until': helpers.getDate(duration), 'pw_history': history}, {'id': row['id']})

    response = json.dumps({'message':'Password changed successfully'})
    return response, 200


def addToHistory(pwd:str, history:list, oldPwCount:int) -> str:
    if len(history) == oldPwCount:
        del history[0]

    return str(history.append(pwd.decode('utf-8'))).replace("'",'')
