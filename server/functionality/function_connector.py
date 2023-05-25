import os
import importlib
import sys
from database import db_connector

#---------------------------------------------
# interface class to handle multiple plugins using a single connector

def use_plugin(pluginName:str, processID:int):
    """Load plugin module and execute it. Writes logfiles."""
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
    config = db_connector.read('pluginConfig',['params'], {'name':pluginName}, 'one')
    processParams = db_connector.read('processConfig',['params'], {'id':processID}, 'one')

    #write to log
    db_connector.create('event_log', {
                                    'type':'information',
                                    'description':'Plugin execution started. Plugin: "'+pluginName+'"',
                                    'processID': processID
                                    })
    
    #start plugin execution
    result = fnc_plugin.app(config['params'], processParams['params'])

    #write to log
    if type(result) != bool:
        db_connector.create('event_log', {
                                        'type':'error',
                                        'description':'Plugin execution failed. Plugin: "'+pluginName+'". Plugin returned: "'+result+'".',
                                        'processID': processID
                                        })
        return False
    else:
        db_connector.create('event_log', {
                                        'type':'information',
                                        'description':'Plugin execution finished. Plugin: "'+pluginName+'"',
                                        'processID': processID
                                        })
        return True