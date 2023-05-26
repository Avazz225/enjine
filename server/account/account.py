from database import db_connector
import helpers
import json
from rightManagement import rightMgmt

def newAccount(data, token):
    r = rightMgmt.approveUserManagement(token)

    if type(r) != bool:
        db_connector.create('event_log', {
                                        'processID': 0,
                                        'type':'warning',
                                        'description':'Illegal access detected. User with id %s tried to create new user' % (r)
                                        })
        response = json.dumps({'message':'Insufficient rights.'})
        return response, 401

    duration = db_connector.read('client_config1',['initial_pw_duration'],{'id': 1}, 'one')['initial_pw_duration']
    pwd = helpers.getRandomPassword(16)

    try:
        db_connector.create('user', {'password': helpers.encryptPassword(pwd), 
                                     'identifier': data['identifier'], 
                                     'pw_last_set': helpers.getDate(), 
                                     'pw_valid_until': helpers.getDate(duration)})
        
        response = json.dumps({'message':'Successful', 'password': pwd})
        return response, 200
    except:
        response = json.dumps({'message':'Internal server error'})
        return  response, 500