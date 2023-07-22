from database import db_connector
import helpers
import json
from rightManagement import rightMgmt

def newAccount(data, token):
    """Handles creation of a new user account. Covers cases for creating an active user (can log into the program) and passive users (only logical objects). 
    User objects are used in on- and offboarding."""

    #check if the user has rights to execute the opration
    r = rightMgmt.approveUserCre(token)

    #if not: create warning in logs, return error message and rights
    if type(r['result']) != bool:
        db_connector.create('event_log', {
                                        'processID': 0,
                                        'type':'warning',
                                        'description':'Illegal access detected. User with id %s tried to create new user' % (r['id'])
                                        })
        response = json.dumps({'message':'Insufficient rights.','rights':r['rights']})
        return response, 401
    else:
        return accCreation(data)
    
def accCreation(data):
    #read program configuration 
    duration = db_connector.read('client_config1',['initial_pw_duration'],{'id': 1}, 'one')['initial_pw_duration']

    try:
        #if passive: create passive user (only identifier and configured properties)
        if not data['passive']:
            id = db_connector.create('user', {'identifier': data['identifier'], 
                                                'active_account': 0,
                                                'specific_properties' : json.dumps(data['specific_properties'])})
            response = json.dumps({'message':'Successful', 'userID': id})
            return response, 200
        else:
            #create active user with random initial password, valid until and last set properties returns information and initial password
            pwd = helpers.getRandomPassword(16)
            id = db_connector.create('user', {'password': helpers.encryptPassword(pwd), 
                                                'identifier': data['identifier'], 
                                                'pw_last_set': helpers.getDate(), 
                                                'pw_valid_until': helpers.getDate(duration),
                                                'specific_properties' : json.dumps(data['specific_properties'])})
            
            db_connector.create('permission',{'id':id})
            response = json.dumps({'message':'Successful', 'password': pwd, 'userID': id})
            return response, 200
        
    #catch error (duplicate identifier)
    except Exception as err:
        print(err)
        response = json.dumps({'message':'Identifier already existing'})
        return  response, 500

def getGenericProperties(token):
    """Returns generic properties of users, read from database. Used for user creation and configuration of user properties in general."""
    #check if the user has rights to execute the opration
    r = rightMgmt.approvePropertyManagement(token)

    #if not: create warning in logs, return error message and rights
    if type(r) != bool:
        db_connector.create('event_log', {
                                        'processID': 0,
                                        'type':'warning',
                                        'description':'Illegal access detected. User with id %s tried to read properties' % (r['id'])
                                        })
        response = json.dumps({'message':'Insufficient rights.','rights':r['rights']})
        return response, 401
    
    #read program configuration 
    props = db_connector.read('client_config1',['configurable_specific_properties'],{'id': 1}, 'one')['configurable_specific_properties']

    return {'default_properties':props}, 200
