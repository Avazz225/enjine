from rightManagement import rightMgmt
from database import db_connector
from helpers import getDict
import json

def updateProcess(data, token):
    """Handles update of process definition."""
    #check if the user has rights to execute the opration
    r = rightMgmt.approveProcessDefUpdate(token)

    #if not: create warning in logs, return error message and rights
    if type(r['result']) != bool:
        db_connector.create('event_log', {
                                        'type':'warning',
                                        'description':'Illegal access detected. User with id %s tried to alter the process configuration of process: %s.' % (r['id'], data['processName'])
                                        })
        response = json.dumps({'message':'Insufficient rights.','rights':r['rights']})
        return response, 401
    
    else: 
        technical_process = replace_ids(process_data(build_list(data)))

        db_connector.update('process_template',{'process_objects': data['processObjects'], 
                                                'object_positions':data['objectPositions'], 
                                                'object_connections': data['objectConnections'],
                                                'plugin_config': data['pluginConfig'],
                                                'technical_process': technical_process,
                                                },{"process_name": data['processName']})
        
        return json.dumps({'message': 'Successful'}), 200
    

def build_list(data, interruptOnParallel:bool = False) -> list:
    """Builds a basic technical process object."""

    #partially built using chatGPT
    process_objects = {str(obj['id']): obj for obj in data['processObjects']}
    connections = {conn['previous']: conn['next'] for conn in data['objectConnections']}
    plugin_objects = {str(obj['id']): obj['configs'] for obj in data['pluginConfig']}

    def build_sublist(start_id, stop_id=None, interruptOnParallel = False):
        result = []
        current_id = start_id
        while current_id != '1' and current_id in connections and current_id != stop_id:
            obj = process_objects[current_id]
            plugins = [{'pluginID': plugin['pluginID'], 'pluginConfig': getDict(plugin_objects[str(current_id)], 'pluginId', str(plugin['pluginID']))['config']} for plugin in obj['relatedPlugins']]
            sublist = {'id': len(result), 'type': obj['type'], 'plugins': plugins, 'name': obj['name']}
            if obj['type'] in ['parallel', 'exclusive'] and 'subPaths' in obj:
                sublist['subPaths'] = []
                for key, substart_id in obj['subPaths'].items():
                    sublist['subPaths'].append(build_sublist(substart_id, stop_id=current_id, interruptOnParallel=interruptOnParallel))
            result.append(sublist)
            current_id = connections[current_id]
        if current_id == '1':
            result.append({'id': len(result), 'type': process_objects[current_id]['type'], 'plugins': [],
                           'name': process_objects[current_id]['name']})
        return result

    start_ids = [conn['previous'] for conn in data['objectConnections'] if conn['previous'] not in connections.values()]
    result = []
    for start_id in start_ids:
        sublist = build_sublist(start_id, interruptOnParallel)
        result.extend(sublist)

    return result

def find_elements(data:list, element_types:list) -> list:
    """Returns all list indices matching a give type"""
    return [i for i, obj in enumerate(data) if obj.get('type') in element_types]

def process_data(data:list, offset:int = 0):
    """Generates the process object for the technical process."""
    exclusive_positions = find_elements(data, ['exclusive', 'parallel'])
    end_positions = find_elements(data, ['end'])

    if len(exclusive_positions) < 2+offset or len(end_positions) < 1:
        return data

    sublist_start = exclusive_positions[0+offset] + 1
    sublist_end = end_positions[0]

    sublist1 = data[sublist_start:exclusive_positions[1+offset]]

    del data[sublist_start:sublist_end + 1]
    

    exclusive_positions = find_elements(data, ['exclusive', 'parallel'])
    end_positions = find_elements(data, ['end'])

    sublist2 = data[exclusive_positions[0+offset] + 1:exclusive_positions[1]]

    del data[exclusive_positions[0+offset] + 1:exclusive_positions[1]+1]

    pathList = {'path_1': sublist1, 'path_2': sublist2}
    
    data.insert(exclusive_positions[0+offset] +1, {'id': 0, 'subpaths': pathList})


    if len(end_positions) > 1:
        process_data(data, offset=offset+2)

    return data

def replace_ids(data:list) -> list:
    """Replaces object ids for the technical process execution."""
    counter = 0
    for obj in data:
        obj['id'] = counter
        counter += 1
        if 'subpaths' in obj:
            for key, subpath in obj['subpaths'].items():
                subpath_counter = 0
                for subobj in subpath:
                    subobj['id'] = subpath_counter
                    subpath_counter += 1
    return data

def getProcess(filter: str,  token:str):
    """Handles read of processes."""
    #check if the user has rights to execute the opration
    r = rightMgmt.approveProcessGet(token)

    #if not: create warning in logs, return error message and rights
    if type(r['result']) != bool:
        db_connector.create('event_log', {
                                        'type':'warning',
                                        'description':'Illegal access detected. User with id %s tried to read processes.' % (r['id'])
                                        })
        response = json.dumps({'message':'Insufficient rights.','rights':r['rights']})
        return response, 401
    
    else: 
        if filter == '':
            return json.dumps({'processNames': readProcessNames(r['perms']),'message': 'Successful'}), 200
        else: 
            return json.dumps({'processVars': readProcessConfig(r['perms'], filter),'message': 'Successful'}), 200
    
def readProcessNames(perms) -> list:
    """Handles read of process names.
        Perms are currently not used and just a preparation for future features."""
    process_raw = db_connector.read('process_template', ['process_name'])
    name_list = []

    for element in process_raw:
        name_list.append(element['process_name'])

    return name_list

def readProcessConfig(perms, filter:str) -> list:
    """Handles read of process config.
        Perms are currently not used and just a preparation for future features."""
    return db_connector.read('process_template', ['process_objects', 'object_positions', 'object_connections', 'plugin_config'], {'process_name': filter}, returnType='one')
