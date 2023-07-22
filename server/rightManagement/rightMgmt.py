from database import db_connector
import helpers

def approveUserManagement(token:str): 
    """Checks whether a user is allowed to manage users. 
    
    Allowed groups:
    - sysAdmin
    - userAdmin"""

    return rightChecker(token, ['sysAdmin', 'userAdmin'])

def approveUserGet(token:str): 
    """Checks whether a user is allowed to see users. 
    
    Allowed groups:
    - sysAdmin
    - userAdmin
    - userGlobal
    - groupAdmin
    - groupGlobal
    """

    return rightChecker(token, ['sysAdmin', 'userAdmin', 'userGlobal', 'groupAdmin', 'groupGlobal'], False)

def approveUserUpd(token:str): 
    """Checks whether a user is allowed to update users. 
    
    Allowed groups:
    - sysAdmin
    - userAdmin
    - userGlobal
    """

    return rightChecker(token, ['sysAdmin', 'userAdmin', 'userGlobal'], False)

def approveUserCre(token:str): 
    """Checks whether a user is allowed to create a new user. 
    
    Allowed groups:
    - sysAdmin
    - userAdmin
    - userGlobal
    """

    return rightChecker(token, ['sysAdmin', 'userAdmin', 'userGlobal'], False)

def approvePropertyManagement(token:str): 
    """Checks whether a user is allowed to see properties. 
    
    Allowed groups:
    - sysAdmin
    - userAdmin"""

    return rightChecker(token, ['sysAdmin', 'userAdmin'])

def approvePluginGet(token:str):
    """Checks whether a user is allowed to see plugins. 
    
    Allowed groups:
    - sysAdmin
    - pluginAdmin"""

    return rightChecker(token, ['sysAdmin', 'pluginAdmin'])

def approvePluginConfig(token:str):
    """Checks whether a user is allowed to update plugin configurations. 
    
    Allowed groups:
    - sysAdmin
    - pluginAdmin"""

    return rightChecker(token, ['sysAdmin', 'pluginAdmin'])

def approveGroupGet(token:str):
    """Checks whether a user is allowed to see groups. 
    
    Allowed groups:
    - sysAdmin
    - groupAdmin
    - groupGlobal"""

    return rightChecker(token, ['sysAdmin', 'groupAdmin', 'groupGlobal'], False)

def approveGroupAdd(token:str):
    """Checks whether a user is allowed to add groups. 
    
    Allowed groups:
    - sysAdmin
    - groupAdmin
    - groupGlobal"""

    return rightChecker(token, ['sysAdmin', 'groupAdmin', 'groupGlobal'], False)


def approveProgGet(token:str):
    """Checks whether a user is read application data.
    
    Allowed groups:
    - sysAdmin
    - applicationAdmin
    - applicationGlobal
    - processAdmin
    - processGlobal
    """

    return rightChecker(token, ['sysAdmin', 'applicationAdmin', 'applicationGlobal', 'processAdmin', 'processGlobal'], False)

def approveProgRelCreate(token:str):
    """Checks whether a user is allowed to create new relations between programs/rights and plugins. 
    
    Allowed groups:
    - sysAdmin
    - applicationAdmin
    - applicationGlobal"""

    return rightChecker(token, ['sysAdmin', 'applicationAdmin', 'applicationGlobal'], False)

def approveProgCreate(token:str):
    """Checks whether a user is allowed to create new programs/rights. 
    
    Allowed groups:
    - sysAdmin
    - applicationAdmin
    - applicationGlobal"""

    return rightChecker(token, ['sysAdmin', 'applicationAdmin', 'applicationGlobal'], False)

def approveAppConfigUpdate(token:str):
    """Checks whether a user is allowed to update the application configuration. 
    
    Allowed groups:
    - sysAdmin
    - applicationAdmin"""

    return rightChecker(token, ['sysAdmin', 'applicationAdmin'], False)

def approveProcessDefUpdate(token:str):
    """Checks whether a user is allowed to define processes. 
    
    Allowed groups:
    - sysAdmin
    - processAdmin
    - processGlobal"""

    return rightChecker(token, ['sysAdmin', 'processAdmin', 'processGlobal'], False)

def approveProcessGet(token: str):
    """Checks whether a user is allowed to read processes. 
    
    Allowed groups:
    - sysAdmin
    - processAdmin
    - processGlobal"""

    return rightChecker(token, ['sysAdmin', 'processAdmin', 'processGlobal'], False)

def rightChecker(token:str, perms:list, simpleResponse: bool = True):
    """Checks if user is privilegrd for accessing function."""
    id = helpers.getID(token)
    if type(id) != int: return {'id':'Invalid token'}

    row = db_connector.read('permission', perms, {'id': id}, 'one')

    #partially built using chatGPT
    if any(value for value in row.values()):
        if simpleResponse:
            return True
        else: 
            return {'result':True, 'perms': row}
    else: 
        return {'result': 'a','id':id, 'rights':helpers.getRights(id)}