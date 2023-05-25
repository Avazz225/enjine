import re
from datetime import datetime, timezone, timedelta
from database import db_connector

def dateComparision(aDate: list, otherDate: list) -> bool:
    """Compares datetimes. Takes lists in format: [yyyy, mm, dd, hh, mm, ss] Returns true if aDate is after or equal to other_date"""
    d1 = datetime(aDate[0], aDate[1], aDate[2], aDate[3], aDate[4], aDate[5])
    d2 = datetime(otherDate[0], otherDate[1], otherDate[2], otherDate[3], otherDate[4], otherDate[5])
    return (d1 >= d2)

def dateComparisionTdy (otherDate: list) -> bool:
    """Compares datetimes. Takes list in format: yyyy, mm, dd Returns true if todays date is after or equal to other_date"""
    return dateComparision(getDate(), otherDate)

def getDate(deltaInHours: int = 0) -> list:
    """Returns current datetime as a list. Can take timedelta (in hours) to calculate into future or in past."""
    d1 = datetime.now(timezone.utc)
    if deltaInHours!= 0: d1 = d1 + timedelta(hours=deltaInHours)
    return [d1.year, d1.month, d1.day, d1.hour, d1.minute, d1.second]

def toDictList(rowSet : list, pullParams: list) -> list[dict]:
    """Uses resultSet and pullParameters to generate a list of dicts containing the requested data from the database."""
    obj = []
    if rowSet == None: return None
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
        safeString = re.sub(regex, subst, str(unsafeString), 0)
        db_values = {
                    'type':'warning',
                    'description':'Illegal characters in user input for database detected. Removed illegal chars. Result: %s' %(safeString)
                    }
        db_connector.create('event_log', db_values)
    else:
        safeString = unsafeString
    
    return safeString