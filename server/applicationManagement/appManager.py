from rightManagement import rightMgmt
from database import db_connector
import json

def getProgs(token):
    """Handles read of available programs and rights"""
    #check if the user has rights to execute the opration
    r = rightMgmt.approveProgGet(token)

    #if not: create warning in logs, return error message and rights
    if type(r['result']) != bool:
        db_connector.create('event_log', {
                                        'type':'warning',
                                        'description':'Illegal access detected. User with id %s tried to get list of plugins.' % (r['id'])
                                        })
        response = json.dumps({'message':'Insufficient rights.','rights':r['rights']})
        return response, 401
    
    else: 
        return json.dumps({"program_plugin":readProgs(), "appConf": readAppConf(r['perms'])}), 200
    
def readProgs():
    """Reads available programs and assigned plugins."""
    plugins = db_connector.read('plugin',['id','name', 'params'], returnType='all')
    programs = db_connector.read('program_right',['id','name'], returnType='all')
    relations = db_connector.read('program_right_plugin',['id','pid','prid','description'], returnType='all')

    return {'plugins':plugins, 'programsAndRights': programs, 'relations': relations}

def readAppConf(perms):
    """Read application configuration from database."""
    if not bool(perms['sysAdmin']) and not bool(perms['applicationAdmin']): return None

    return db_connector.read('client_config1', ['initial_pw_duration','token_duration','pw_duration', 'old_pw_count', 'configurable_specific_properties'], returnType='one')

def createPRPR(data, token):
    """Handles creation of a new program/right and plugin relation"""
    #check if the user has rights to execute the opration
    r = rightMgmt.approveProgRelCreate(token)

    #if not: create warning in logs, return error message and rights
    if type(r['result']) != bool:
        db_connector.create('event_log', {
                                        'type':'warning',
                                        'description':'Illegal access detected. User with id %s tried to create a new program/right - plugin relation.' % (r['id'])
                                        })
        response = json.dumps({'message':'Insufficient rights.','rights':r['rights']})
        return response, 401
    
    else: 
        return json.dumps({"id":db_connector.create('program_right_plugin',{'pid':data['pid'], 'prid':data['prid'], 'description': data['description']})}), 200
    
def createPR(data,token):
    """Handles creation of a new program/right"""
    #check if the user has rights to execute the opration
    r = rightMgmt.approveProgCreate(token)

    #if not: create warning in logs, return error message and rights
    if type(r['result']) != bool:
        db_connector.create('event_log', {
                                        'type':'warning',
                                        'description':'Illegal access detected. User with id %s tried to create a new program/right.' % (r['id'])
                                        })
        response = json.dumps({'message':'Insufficient rights.','rights':r['rights']})
        return response, 401
    
    else: 
        return json.dumps({"id":db_connector.create('program_right',{'name':data['name']})}), 200
    
def updateAppConf(data, token):
    """Handles update of app config."""
    #check if the user has rights to execute the opration
    r = rightMgmt.approveAppConfigUpdate(token)

    #if not: create warning in logs, return error message and rights
    if type(r['result']) != bool:
        db_connector.create('event_log', {
                                        'type':'warning',
                                        'description':'Illegal access detected. User with id %s tried to alter the application configuration.' % (r['id'])
                                        })
        response = json.dumps({'message':'Insufficient rights.','rights':r['rights']})
        return response, 401
    
    else: 
        handleUpdate(data)
        return json.dumps({'message': 'Successful'}), 200
    
def handleUpdate(data):
    """Handles update of data."""
    db_connector.update('client_config1', data['appConfig'], {'id':1})