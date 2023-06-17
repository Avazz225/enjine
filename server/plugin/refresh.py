from database import db_connector
from plugin import pluginManager
from functionality import function_connector
import json
import os
import helpers

def refreshController():
    """Coordinates refresh"""

    #partially built using chatGPT
    existing = pluginManager.rPlugin(0, 1)['pData']
    pluginNames = readFileNames()
    pluginDict = {key: None for key in pluginNames}
    decriptionDict = {key: None for key in pluginNames}

    for plugin in pluginDict.keys():
        decriptionDict = function_connector.get_plugin_params(plugin, 0)
        pluginDict[plugin] = {'descs':decriptionDict, 'params':{key: None for key in decriptionDict}}

        # check if plugin is already in database
        if any(plugin in d.values() for d in existing):
            configDict = pluginDict[plugin]['params']
            referenceDict = helpers.getDict(existing, 'name', plugin)['params']
            configDict.update(referenceDict)
            
            # Remove keys from configDict and decriptionDict not present in pluginDict
            configDict = helpers.remKeys(configDict, decriptionDict)
            decriptionDict = helpers.remKeys(decriptionDict, decriptionDict)

            db_connector.update('plugin', {'params': json.dumps(configDict, ensure_ascii=False), 'params_description': json.dumps(decriptionDict, ensure_ascii=False)}, {'name': plugin})
        else:
            db_connector.create('plugin', {'name': plugin, 'params': json.dumps(pluginDict[plugin]['params'], ensure_ascii=False), 'params_description': json.dumps(pluginDict[plugin]['descs'], ensure_ascii=False)})

        existing = helpers.rmDictFromList(existing, 'name', plugin)
    
    for plugin in existing:
        db_connector.delete('plugin', {'name': plugin['name']})
        
def readFileNames() -> list:
    """Reads all files in the plugin folder with extension '.py'."""
    absolute_path = os.path.dirname(__file__)
    folder_path = '..\\functionality\\function_plugin'  
    full_path = os.path.join(absolute_path, folder_path)

    file_list = os.listdir(full_path)

    # Filter files with ".py" extension
    file_list = [file for file in file_list if file.endswith('.py')]

    return [os.path.splitext(file)[0] for file in file_list]
