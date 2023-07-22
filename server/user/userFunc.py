from database import db_connector
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
    #perms is a preparation for a possible filter by groups
    return {'res': db_connector.read('user', ['id', 'active_account', 'identifier'],{},count={'limit': data['rowCount'], 'offset': data['start']}), 
            'total': db_connector.read('user', ['COUNT(id)'],{},'one')['COUNT(id)']}, 200

def getUser(target, token):
    """Handles reading of a specific user account."""
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
        return rUser(target)

def rUser(targetID = 0):
    return {'userConfig': db_connector.read('user', ['identifier', 'specific_properties', 'global_groups','local_groups'],{'id': targetID}, 'one'), 
            'customProps': db_connector.read('client_config1', ['configurable_specific_properties'],{},'one')['configurable_specific_properties']}, 200

def updUser(data, token):
    """Handles reading of a specific user account."""
    #check if the user has rights to execute the opration
    r = rightMgmt.approveUserUpd(token)

    #if not: create warning in logs, return error message and rights
    if type(r['result']) != bool:
        db_connector.create('event_log', {
                                        'type':'warning',
                                        'description':'Illegal access detected. User with id %s tried to get list of users' % (r['id'])
                                        })
        response = json.dumps({'message':'Insufficient rights.','rights':r['rights']})
        return response, 401
    else:
        db_connector.update('user',{'specific_properties':json.dumps(data['props']['specific_properties'])}, {'id':data['id']})
        response = json.dumps({'message':'Successful'})
        return response, 200