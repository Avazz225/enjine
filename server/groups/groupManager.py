from rightManagement import rightMgmt
from database import db_connector
import json
import helpers

def getGroups(token:str):
    """Handles reading of group data."""
    #check if the user has rights to execute the opration
    r = rightMgmt.approveGroupGet(token)

    #if not: create warning in logs, return error message and rights
    if type(r['result']) != bool:
        db_connector.create('event_log', {
                                        'type':'warning',
                                        'description':'Illegal access detected. User with id %s tried to get list of plugins.' % (r['id'])
                                        })
        response = json.dumps({'message':'Insufficient rights.','rights':r['rights']})
        return response, 401
    
    return rGroups(r['perms'], token), 200

def rGroups(rights:dict, token:str):
    """Reads groups from database"""
    if not bool(rights['sysAdmin']) and not bool(rights['groupAdmin']) and not bool(rights['userAdmin']): filtered = True
    else: filtered = False

    groupData = readGroupData(token)
    if filtered:
        return {'global': helpers.rmDictsNotInList(groupData['global'], 'id', groupData['filter']), 'local': helpers.rmDictsNotInList(groupData['local'], 'global_id', groupData['filter']), 'onlyLocal': filtered}

    return {'global': groupData['global'], 'local': groupData['local'], 'onlyLocal': filtered}

def readGroupData(token: str) -> dict:
    """Executes reads on database"""
    glo = db_connector.read('global_group', ['id','name','rights'], {}, 'all')
    loc = db_connector.read('local_group', ['id','global_id','name','rights'], {}, 'all')
    try:
        fil = db_connector.read('user', ['global_groups'], {'token': token}, 'all')[0]['global_groups'].replace('[','').replace(']','').split(',')
    except:
        fil = []
    return {'global': glo, 'local': loc, 'filter': fil}

def addGroups(data, token):
    """Handles creation of new groups."""
    #check if the user has rights to execute the opration
    r = rightMgmt.approveGroupAdd(token)

    #if not: create warning in logs, return error message and rights
    if type(r['result']) != bool:
        db_connector.create('event_log', {
                                        'type':'warning',
                                        'description':'Illegal access detected. User with id %s tried to get list of plugins.' % (r['id'])
                                        })
        response = json.dumps({'message':'Insufficient rights.','rights':r['rights']})
        return response, 401
    
    if data['type'] == 'global': return addGlobal(data), 200
    else: return addLocal(data), 200

def addGlobal(data):
    """Adds a global group to the database."""
    id = db_connector.create('global_group', {'name': data['name']})
    return {'message': 'Successful','id': id}

def addLocal(data):
    """Adds a local group to the database."""
    id = db_connector.create('local_group', {'name': data['name'], 'global_id': data['masterID']})
    return {'message': 'Successful','id': id}