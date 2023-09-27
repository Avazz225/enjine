import helpers
from functionality import function_connector
from database import db_connector


def executeProcess(rights: list, processName:str, executor:int, affected_user:int, processID:int=0, processParams:dict={}) -> None:
    """Handles process execution."""
    '''[
        {"id": 0, "type": "start", "plugins": [], "name": "Start"}, 

        {"id": 1, "type": "task", "plugins": [
            {"pluginID": 7, "pluginConfig": {"bcc_recipient": null, "cc_recipient": "avazz.geilo@gmail.com", "recipient": "jeschinski.jan@gmail.com", "text": "Dies ist eine Testmail.", "topic": "Testmail aus ENJine"}}
        ], "name": "Task"}, 

        {"id": 2, "type": "end", "plugins": [], "name": "End"}
    ]'''

    #process details
    steps:list[dict] = db_connector.read('process_template',['technical_process'],{'process_name': processName}, 'one')['technical_process']

    if processID==0:
        processID = newProcess(processName, executor, processParams)
        currentStep = 0
    else:
        currentStep = resumeProcess(processName, executor, processID)

    if steps != []:
        for step in steps:
            currentStep+=1
            if step['type']=='task':
                for plugin in step['plugins']:
                    if not function_connector.use_plugin(processID=processID, plugin_id=plugin['pluginID'], override_params=plugin['pluginConfig']):    
                        #check if step is marked as mandatory
                        db_connector.create('event_log', {
                                                    'process_id': processID,
                                                    'type':'error',
                                                    'description':'Process execution stopped due to mandatory plugin failure. Process: %s' % (processName)
                                                    })
                        
                        db_connector.update('active_process', { 
                                                    'status': 'stopped',
                                                    'progress':currentStep,
                                                    }, {'process_id': processID})
                        break
            
            elif step['type']=='parallel':
                print('Parallel Step')

    finishProcess(processID, processName, currentStep)

    return

def newProcess(processName:str, executor: int, processParams: dict) -> int:
    """Creates a new process execution object in the database."""
    #create new process in database
    processID = db_connector.create('active_process', {
                                    'name':processName,
                                    'executor':executor, 
                                    'status': 'running',
                                    'progress':0,
                                    })
    
    #create process configuration with parameters assigned at process start
    db_connector.create('process_config', {
                                    'process_id': processID,
                                    'params': processParams
                                    })
    
    #write to log
    db_connector.create('event_log', {
                                    'process_id': processID,
                                    'type':'information',
                                    'description':'Process execution started. Process: %s Responsible userID: %s ' % (processName, executor)
                                    })
    
    return processID

def resumeProcess(processName:str, executor: int, processID: int) -> int:
    """Resumes a previously started process."""
    ##load last progressstate to resume execution
    current_step = db_connector.read('active_process',['progress'],{'process_id':processID}, 'one')['progress']

    #write to log
    db_connector.create('event_log', {
                                    'process_id': processID,
                                    'type':'information',
                                    'description':'Process execution resumed. Process: %s Responsible userID: %s ' % (processName, executor)
                                    })
    
    return current_step

def finishProcess(processID: int, processName: str, currentStep:int) -> None:
    """Finishes a process execution object in the database."""
    #write log for finished process    
    db_connector.create('event_log', {
                                        'process_id': processID,
                                        'type':'information',
                                        'description':'Process execution finished. Process: %s ' % (processName)
                                        })

    #finish process in database (active process)
    db_connector.update('active_process', { 
                                        'status': 'finished',
                                        'progress':currentStep,
                                        }, {'process_id': processID})

