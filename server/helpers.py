import re
from database import db_connector

def toDictList(rowSet : list, pullParams: list) -> list[dict]:
    """Uses resultSet and pullParameters to generate a list of dicts containing the requested data from the database."""
    obj = []
    for row in rowSet:
        temp = {}
        for i in range (len(pullParams)):
            temp[pullParams[i]] = row[i]
        obj.append(temp)
    return obj

def toStr(unsafeString: str) -> str:
    """Safely converts user inputs to strings and removes forbidden characters. Writes logs if forbidden chars are found."""
    regex = fr"[^\s._0-9a-zA-z,\+*!?:.äöüÄÖÜß/()\[\]]+"
    subst = " "
    
    if re.search(regex, str(unsafeString)):
        safeString = re.sub(regex, subst, unsafeString, 0)
        db_values = {
                    'type':'warning',
                    'description':'Illegal characters in user input for database detected. Removed illegal chars. Result: %s' %(safeString)
                    }
        db_connector.create('event_log', db_values)
    else:
        safeString = unsafeString
    
    return safeString
     