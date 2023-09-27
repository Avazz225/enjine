import json
import threading
from database import db_connector
from engine import delta_object
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
    """Handles updates of a specific user account."""
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
    
def getGroups(target, token):
    """Handles reading of available groups assigned to a user."""
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
        return rUserGR(target)
    
def rUserGR(targetID=0):
    return db_connector.read('user', ['identifier', 'specific_properties', 'global_groups','local_groups'],{'id': targetID}, 'one'), 200

def updGroups(data, token):
    """Handles updates of groups assigned to a user."""
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
        #starts processes according to groups if editMode is disabled
        if not data['editMode']:
            oldGroups = db_connector.read('user', ['global_groups', 'local_groups'], {'id':data['id']})
            thread = threading.Thread(target=delta_object.createDeltaFromGroups(oldGroups[0], {'global_groups': data['global'], 'local_groups':data['local']}, r['id'], data['id']))
            thread.start()
        
        db_connector.update('user',{'global_groups':json.dumps(data['global']), 'local_groups':json.dumps(data['local'])}, {'id':data['id']})

        response = json.dumps({'message':'Successful'})
        return response, 200