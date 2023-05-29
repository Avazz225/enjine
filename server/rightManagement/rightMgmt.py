from database import db_connector
import helpers

def approveUserManagement(token:str): 
    """Checks whether a user is allowed to manage users. 
    
    Allowed groups:
    - sysAdmin
    - userAdmin"""

    id = helpers.getID(token)
    if type(id) != int: return {'id':'Invalid token'}

    row = db_connector.read('permission', ['sysAdmin', 'userAdmin'], {'id': id}, 'one')
    if bool(row['sysAdmin']) or bool(row['userAdmin']): return True
    else: return {'id':id, 'rights':helpers.getRights(id)}
