import os
import importlib
import sys
from database import db_connector

#---------------------------------------------
# interface class to handle multiple plugins using a single connector

def use_plugin(processID:int, plugin_id: int, override_params:dict ={}):
    """Load plugin module and execute it. Writes logfiles."""
    pluginName = db_connector.read('plugin', ['name'], {'id': plugin_id}, 'one')['name']
    #load plugin
    try: fnc_plugin = importlib.import_module("functionality.function_plugin.%s" % (pluginName))
    except: 
        print('Plugin not found: "%s".\n\nPlugin folder: functionality.function_plugin'%os.environ['DBMS'])
        db_connector.create('event_log', {
                                        'type':'error',
                                        'description':'Plugin not found. Plugin: "'+pluginName+'"',
                                        'processID': processID
                                        })
        sys.exit(404)

    #load parameters
    config = db_connector.read('plugin',['params'], {'id':plugin_id}, 'one')
    processParams = db_connector.read('process_config',['params'], {'process_id':processID}, 'one')

    #write to log
    db_connector.create('event_log', {
                                    'type':'information',
                                    'description':'Plugin execution started. Plugin: "'+pluginName+'"',
                                    'process_id': processID
                                    })
    
    #start plugin execution
    print(config)
    print(processParams)
    if type(processParams) == None:
        processParams = {}
    result = fnc_plugin.app(config['params'], processParams['params'])

    #write to log
    if type(result) != bool or result!= True:
        db_connector.create('event_log', {
                                        'type':'error',
                                        'description':'Plugin execution failed. Plugin: "'+pluginName+'". Plugin returned: "'+ str(result)+'".',
                                        'process_id': processID
                                        })
        return False
    else:
        db_connector.create('event_log', {
                                        'type':'information',
                                        'description':'Plugin execution finished. Plugin: "'+pluginName+'"',
                                        'process_id': processID
                                        })
        return True
    
def get_plugin_params(pluginName:str, processID:int):
    """Load plugin module and execute it. Writes logfiles."""
    #load plugin
    try: 
        fnc_plugin = ''
        fnc_plugin = importlib.import_module("functionality.function_plugin.%s" % (pluginName))
    except: 
        print('Plugin not found: "%s".\n\nPlugin folder: functionality.function_plugin'%os.environ['DBMS'])
        db_connector.create('event_log', {
                                        'type':'error',
                                        'description':'Plugin not found. Plugin: "'+pluginName+'"',
                                        'process_id': processID
                                        })

    #read plugin config parameters
    return fnc_plugin.getParams()