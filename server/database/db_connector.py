import os
import importlib
import helpers as tra_res
import sys

# code for local testing
import dotenv
dotenv.load_dotenv()

# load correct database plugin according to environment variable
try: db_plugin = importlib.import_module("database.database_plugin.%s" % (str(os.environ['DBMS'])))
except: 
    print('Database plugin not found: "%s".\nEnsure that the environment variable "DBMS" corresponds to the plugin file name (excluding ".py"). \nPlugin folder: database.database_plugin'%os.environ['DBMS'])
    sys.exit(404)

#---------------------------------------------
# interface classes to handle multiple DBMS using a single connector
# providing CRUD operations

def create(targetTable: str, newVals: dict) -> int:
    """Insert data into the database."""
    return db_plugin.executeGeneric(operation = 'insert',targetTable = targetTable, newVals = newVals)

def read(targetTable: str, pullParams: list, filter: dict = {}, returnType: str = '') -> list[dict]:
    """
    Retrieve data from the database.

    Uses a special module and translates the response to match the initially given dict format
    """
    return tra_res.toDictList(rowSet = db_plugin.executeSelect(targetTable = targetTable, pullParams = pullParams, filter = filter, returnType = returnType), pullParams = pullParams, returnType= returnType)

def update(targetTable: str, newVals: dict, filter: dict) -> None:
    """Update data in the database."""
    db_plugin.executeGeneric(operation = 'update',targetTable = targetTable, newVals = newVals, filter = filter)
    return 

def delete(targetTable: str, filter: dict) -> None:
    """Delete data from the database."""
    db_plugin.executeGeneric(operation = 'delete',targetTable = targetTable, filter = filter)
    return 
