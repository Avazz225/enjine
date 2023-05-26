import mysql.connector
from mysql.connector import Error
import os
import helpers

# connect to database
def getConnection():
    """Establishes the connection to a SQL server using environment variables."""
    try:
        connection = mysql.connector.connect(host=os.environ.get('DB_HOST'),
                                         database=os.environ.get('DB_NAME'),
                                         user=os.environ.get('DB_USER'),
                                         password=os.environ.get('DB_PW') )
        return connection

    except Error as error:
        print("Error while connecting to MYSQL", error)
        return

#---------------------------------------------
# translators
#   use the given inputs to build the database commands
def translateDelete(targetTable: str, filter: dict) -> str:
    """Handles translation of generic input to a SQL-DELETE statement."""
    filters = ""

    for item in filter.items():
        filters += "%s = '%s' AND " % (helpers.toStr(item[0]), helpers.toStr(item[1]))

    query = "DELETE FROM %s WHERE %s;" % (helpers.toStr(targetTable), filters[:len(filters)-4])
    return query

def translateInsert(targetTable: str, newVals: dict) -> str:
    """Handles translation of generic input to a SQL-INSERT statement."""
    insCols = ""
    newVal = ""

    for item in newVals.items():
        insCols += "%s , " % (helpers.toStr(item[0]))
        newVal += "'%s', " % (helpers.toStr(item[1]))

    query = "INSERT INTO %s (%s) VALUES (%s);" % (helpers.toStr(targetTable), insCols[:len(insCols)-2],  newVal[:len(newVal)-2])
    return query

def translateSelect(targetTable: str, pullParams: list, filter: dict) -> str:
    """Handles translation of generic input to a SQL-SELECT statement."""
    filters = ""
    params = ""

    if filter != {}:
        for item in filter.items():
            filters += "%s = '%s' AND " % (helpers.toStr(item[0]), helpers.toStr(item[1]))
    else:
        filters = "0 = 0 AND "

    for par in pullParams:
        params += "%s, " % (helpers.toStr(par))

    query = "SELECT %s FROM %s WHERE %s;" % (params[:len(params)-2], helpers.toStr(targetTable), filters[:len(filters)-4])
    return query

def translateUpdate(targetTable: str, newVals: dict, filter: dict) -> str:
    """Handles translation of generic input to a SQL-UPDATE statement."""
    filters = ""
    newVal = ""

    for item in filter.items():
        filters += "%s = '%s' AND " % (helpers.toStr(item[0]), helpers.toStr(item[1]))

    for item in newVals.items():
        newVal += "%s = '%s', " % (helpers.toStr(item[0]), helpers.toStr(item[1]))

    query = "UPDATE %s SET %s WHERE %s;" % (helpers.toStr(targetTable), newVal[:len(newVal)-2], filters[:len(filters)-4])
    return query

#---------------------------------------------
# executors
#   use the command translators above, either return a id or a result set
def executeGeneric(operation: str, targetTable: str, filter: dict="", newVals: dict="") -> int:
    """Starts the translation of generic input to SQL statements and executes the operation. Can handle delete, insert and update distigished by the "operation" parameter.
    
    Availiable operations:
    - delete
    - insert
    - update
    """
    if operation=='insert': query = translateInsert(targetTable, newVals)
    elif operation=='update': query = translateUpdate(targetTable, newVals, filter)
    elif operation=='delete': query = translateDelete(targetTable, filter)
    else: 
        print('The requested database operation was not found!') 
        return

    connection = getConnection()
    cursor = connection.cursor()
    cursor.execute(query)

    try:
        lastId = cursor.lastrowid
    except:
        lastId = -1

    connection.commit()

    end(connection)

    return lastId

def executeSelect(targetTable: str, pullParams: list, filter: dict="", returnType: str="all") -> list:  
    """Starts the translation of generic input to a SQL-SELECT statement and executes the operation."""

    query = translateSelect(targetTable, pullParams, filter)

    connection = getConnection()
    cursor = connection.cursor()
    cursor.execute(query)

    if returnType == "one": res = cursor.fetchone()
    else: res = cursor.fetchall()
    cursor.close()

    end(connection)
    
    return res

#---------------------------------------------
# end connection to database
def end (connection) -> None:
    """Terminates connection to a SQL server."""
    if connection: connection.close()