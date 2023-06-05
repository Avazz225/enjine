import json
from rightManagement import rightMgmt
from database import db_connector
from plugin import refresh

def getPlugIns(token: str, pluginId:int = 0):
    """Handles reading of plugin data."""
    #check if the user has rights to execute the opration
    r = rightMgmt.approvePluginGet(token)

    #if not: create warning in logs, return error message and rights
    if type(r) != bool:
        db_connector.create('event_log', {
                                        'type':'warning',
                                        'description':'Illegal access detected. User with id %s tried to get list of plugins.' % (r['id'])
                                        })
        response = json.dumps({'message':'Insufficient rights.','rights':r['rights']})
        return response, 401
    
    return rPlugin(pluginId), 200

def rPlugin(pluginId:int, inside: int = 0) -> dict:
    """Reads plugin data from DB."""
    try:
        if pluginId == 0: 
            filter = {}
            rettype = 'all'
            pullParams = ['id', 'name', 'params', 'params_description']
        else: 
            filter = {'id':pluginId}
            rettype = 'one'
            pullParams = ['params']

        pData = db_connector.read('plugin', pullParams, filter, rettype)
    
    except: 
        pData = 'f'

    if not pData and inside == 0:
        pData = [{'id':0, 'name': 'None', 'params':{'None': 'None'}, 'params_description': {'None': 'Nicht definierter Parameter. Platzhalter'}},]
    return {'pData': pData}

def setPluginConfig(data, token):
    """Handles updates of plugin configuration."""
    #check if the user has rights to execute the opration
    r = rightMgmt.approvePluginConfig(token)

    #if not: create warning in logs, return error message and rights
    if type(r) != bool:
        db_connector.create('event_log', {
                                        'type':'warning',
                                        'description':'Illegal access detected. User with id %s tried to update plugin configuration.' % (r['id'])
                                        })
        response = json.dumps({'message':'Insufficient rights.','rights':r['rights']})
        return response, 401
    
    db_connector.update('plugin',{'params': json.dumps(data['newConfig'])},{'id':data['id']})
    response = json.dumps({'message':'Successful.'})
    return response, 200

def refreshPlugIns(token):
    """Checks for new plugins and config params."""
    #check if the user has rights to execute the opration
    r = rightMgmt.approvePluginConfig(token)

    #if not: create warning in logs, return error message and rights
    if type(r) != bool:
        db_connector.create('event_log', {
                                        'type':'warning',
                                        'description':'Illegal access detected. User with id %s tried to update plugin library.' % (r['id'])
                                        })
        response = json.dumps({'message':'Insufficient rights.','rights':r['rights']})
        return response, 401
    
    refresh.refreshController()

    response = json.dumps({'message':'Successful.'})
    return response, 200