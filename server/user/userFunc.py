from database import db_connector
import helpers
import json
from rightManagement import rightMgmt

def getUsers(data, token):
    """Handles reading of user accounts."""
    #check if the user has rights to execute the opration
    r = rightMgmt.approveUserGet(token)

    #if not: create warning in logs, return error message and rights
    if type(r['result']) != bool:
        db_connector.create('event_log', {
                                        'type':'warning',
                                        'description':'Illegal access detected. User with id %s tried to get list of users' % (r['id'])
                                        })
        response = json.dumps({'message':'Insufficient rights.','rights':r['rights']})
        return response, 401
    else:
        return rUsers(data, r['perms'])

def rUsers(data, perms):
    return {'res': db_connector.read('user', ['id', 'active_account', 'identifier'],{},count={'limit': data['rowCount'], 'offset': data['start']}), 
            'total': db_connector.read('user', ['COUNT(id)'],{},'one')['COUNT(id)']}, 200