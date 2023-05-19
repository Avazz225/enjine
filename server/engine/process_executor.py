from database import db_connector
from functionality import function_connector
import helpers

def executeProcess(processName:str, executor:int, processID:int=0, processParams:dict={}) -> None:
    """Handles process execution."""
    if processID!=0:
       processID = newProcess(processName, executor, processParams)
    else:
        currentStep = resumeProcess(processName, executor, processID)
        
    #process details
    steps:dict = db_connector.read('process',['steps'],{'processName': processName}, 'one')['steps']
    failedSteps:list = []

    for step in steps.items():
        currentStep+=1
        
        if not function_connector.use_plugin(pluginName=step[0], processID=processID):    
            #check if step is marked as mandatory
            if step[1]=='mandatory':
                #errorhandling for stopped process
                db_connector.create('event_log', {
                                            'processID': processID,
                                            'type':'error',
                                            'description':'Process execution stopped due to mandatory plugin failure. Process: %s' % (processName)
                                            })
                
                db_connector.update('activeProcess', { 
                                            'status': 'stopped',
                                            'progress':currentStep,
                                            }, {'processID': processID})
                break
            else:
                failedSteps.append(step[0])

        #check if step is marked as asynchronous and requires user action
        if step[1]=='async':
            db_connector.create('event_log', {
                                        'processID': processID,
                                        'type':'information',
                                        'description':'Process waiting for external action. Process: %s ' % (processName)
                                        })
            
            db_connector.update('activeProcess', { 
                                        'status': 'waiting',
                                        'progress':currentStep,
                                        }, {'processID': processID})
            break

    finishProcess(processID, processName, failedSteps, currentStep)

    return

def newProcess(processName:str, executor: int, processParams: dict) -> int:
    """Creates a new process execution object in the database."""
    #create new process in database
    processID = db_connector.create('acticeProcess', {
                                    'name':processName,
                                    'executor':executor, 
                                    'status': 'running',
                                    'progress':0,
                                    })
    
    #create process configuration with parameters assigned at process start
    db_connector.create('processConfig', {
                                    'processID': processID,
                                    'params': processParams
                                    })
    
    #write to log
    db_connector.create('event_log', {
                                    'processID': processID,
                                    'type':'information',
                                    'description':'Process execution started. Process: %s Responsible userID: %s ' % (processName, executor)
                                    })
    
    return processID

def resumeProcess(processName:str, executor: int, processID: int) -> int:
    """Resumes a previously started process."""
    ##load last progressstate to resume execution
    current_step = db_connector.read('acticeProcess',['progress'],{'processID':processID}, 'one')['progress']

    #write to log
    db_connector.create('event_log', {
                                    'processID': processID,
                                    'type':'information',
                                    'description':'Process execution resumed. Process: %s Responsible userID: %s ' % (processName, executor)
                                    })
    
    return current_step

def finishProcess(processID: int, processName: str, failedSteps:list, currentStep:int) -> None:
    """Finishes a process execution object in the database."""
    #write log for finished process    
    db_connector.create('event_log', {
                                        'processID': processID,
                                        'type':'information',
                                        'description':'Process execution finished. Process: %s Failed non-mandatory steps: %s ' % (processName, helpers.toStr(failedSteps))
                                        })

    #finish process in database (active process)
    if len(failedSteps) == 0:
        db_connector.update('activeProcess', { 
                                            'status': 'finished',
                                            'progress':currentStep,
                                            }, {'processID': processID})

    else: 
        db_connector.update('activeProcess', { 
                                            'status': 'finished with failures',
                                            'progress':currentStep,
                                            }, {'processID': processID})
