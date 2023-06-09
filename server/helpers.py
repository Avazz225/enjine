import re
import bcrypt
import json
import string
import secrets
from datetime import datetime, timezone, timedelta
from database import db_connector

#------------------------------------------------------------------------------
#password related functions
def comparePW(pw, hashedpw) -> bool:
    """Handles password validation"""
    return bcrypt.checkpw(pw.encode('utf8'), hashedpw)

def encryptPassword(pw: str) -> str:
    """Encrypts passwords for storing in db"""
    salt = bcrypt.gensalt()
    pwsalted= bcrypt.hashpw(pw.encode('utf8'), salt)
    return pwsalted.decode("utf-8")

#------------------------------------------------------------------------------
#date related functions
def dateComparision(aDate: list, otherDate: list) -> bool:
    """Compares datetimes. Takes lists in format: [yyyy, mm, dd, HH, MM, SS] Returns true if aDate is after or equal to other_date"""
    d1 = datetime(int(aDate[0]), int(aDate[1]), int(aDate[2]), int(aDate[3]), int(aDate[4]), int(aDate[5]))
    d2 = datetime(int(otherDate[0]), int(otherDate[1]), int(otherDate[2]), int(otherDate[3]), int(otherDate[4]), int(otherDate[5]))
    return (d1 >= d2)

def dateComparisionTdy (otherDate: list) -> bool:
    """Compares datetimes. Takes list in format: [yyyy, mm, dd, HH, MM, SS] Returns true if todays date is after or equal to other_date"""
    return dateComparision(getDate(), otherDate)

def dateDifference (aDate: list, otherDate: list) -> dict:
    """Compares datetimes. Takes list in format: [yyyy, mm, dd, HH, MM, SS]. Returns time from aDate to otherDate."""
    d1 = datetime(int(aDate[0]), int(aDate[1]), int(aDate[2]), int(aDate[3]), int(aDate[4]), int(aDate[5]))
    d2 = datetime(int(otherDate[0]), int(otherDate[1]), int(otherDate[2]), int(otherDate[3]), int(otherDate[4]), int(otherDate[5]))
    diff = d2 - d1
    return {'days': diff.days, 'seconds': diff.seconds}

def dateDifferenceTdy (otherDate: list) -> dict:
    """Compares datetimes. Takes list in format: [yyyy, mm, dd, HH, MM, SS]. Returns time from today to given date."""
    return dateDifference(getDate(), otherDate)

def getDate(deltaInHours: int = 0) -> list:
    """Returns current datetime as a list. Can take timedelta (in hours) to calculate into future or in past."""
    d1 = datetime.now(timezone.utc)
    if deltaInHours!= 0: d1 = d1 + timedelta(hours=deltaInHours)
    return [d1.year, d1.month, d1.day, d1.hour, d1.minute, d1.second]

#------------------------------------------------------------------------------
#database related functions
def toDictList(rowSet : list, pullParams: list, returnType: str) -> list[dict]:
    """Uses resultSet and pullParameters to generate a list of dicts containing the requested data from the database."""
    obj = []
    if rowSet == None: return None
    if returnType == 'one':
        temp = {}
        for i in range (len(pullParams)):
            try:
                temp[pullParams[i]] = json.loads(rowSet[i])
            except:
                temp[pullParams[i]] = rowSet[i]
        obj = temp
    else: 
        for row in rowSet:
            temp = {}
            for i in range (len(pullParams)):
                try:
                    temp[pullParams[i]] = json.loads(row[i])
                except:
                    temp[pullParams[i]] = row[i]
            obj.append(temp)
    return obj

def toStr(unsafeString: str) -> str:
    """Safely converts user inputs to strings and removes forbidden characters. Writes logs if forbidden chars are found."""
    regex = r"[^\s._0-9a-zA-z,\+*!?§$\"%&#-_;:.äöüÄÖÜß@€/\[\]]+\{\}"
    subst = " "

    if type(unsafeString) == list:
        unsafeString = json.dumps(unsafeString)

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

#------------------------------------------------------------------------------
def getID(token: str):
    """Gets userID from token."""
    row = db_connector.read('user', ['id', 'token_valid_until'], {'token': token, 'active_account': 1}, 'one')

    if not row or dateComparisionTdy(row['token_valid_until']):
        response = json.dumps({'message':'Token expired'})
        return response, 403
    
    else: return row['id']

def getRandomPassword(length:int) -> str:
    """Generates a secure random password with given length."""
    return ''.join((secrets.choice(string.ascii_letters + string.digits) for i in range(length)))

def getRights(id) -> dict:
    """Reads assigned rights for user"""
    return db_connector.read('permission', 
                               ['sysAdmin', 
                                'rightAdmin', 'rightGlobal', 'rightLocal',
                                'pluginAdmin', 'pluginGlobal',
                                'processAdmin', 'processGlobal',
                                'userAdmin', 'userGlobal',
                                'logAdmin', 'logGlobal',
                                'groupAdmin', 'groupGlobal',
                                'applicationAdmin', 'applicationGlobal'], 
                               {'id': id}, 
                               'one')

#------------------------------------------------------------------------------
#list management
def remKeys(target: dict, comparision: dict) -> dict:
    """Removes all keys from target not present in comparision"""
    return {key: value for key, value in target.items() if key in comparision}

def rmDictFromList(dictList: list, key:str, value: str) -> list:
    """Removes all dicts from a list where the given key matches a given value"""
    return [d for d in dictList if d.get(key) != value]

def getDict(myList: list, key_to_match : str, value_to_match: str) -> dict:
    """Returns all dicts in a list where given key matches a specific value."""
    return next((d for d in myList if d.get(key_to_match) == value_to_match), None)

def rmDictsNotInList(dictList:list, key:str, value_list:list):
    """Removes all dicts from a list where the given key doesn't match any value in given list"""
    return [d for d in dictList if d.get(key) in value_list]