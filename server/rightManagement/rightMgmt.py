from database import db_connector
import helpers

def approveUserManagement(token:str): 
    id = helpers.getID(token)
    if type(id) != int: return id

    row = db_connector.read('permission', ['sysAdmin', 'userAdmin'], {'id': id}, 'one')
    if bool(row['sysAdmin']) or bool(row['userAdmin']): return True
    else: return id
