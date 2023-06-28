import sys
import subprocess

# implement pip as a subprocess:
"""subprocess.check_call([sys.executable, '-m', 'pip', 'install', 
'bcrypt==4.0.0'])

subprocess.check_call([sys.executable, '-m', 'pip', 'install', 
'Flask==2.2.2'])

subprocess.check_call([sys.executable, '-m', 'pip', 'install', 
'Flask_Cors==3.0.10'])

subprocess.check_call([sys.executable, '-m', 'pip', 'install', 
'python-dotenv==1.0.0'])

subprocess.check_call([sys.executable, '-m', 'pip', 'install', 
'mysql==0.0.3'])

subprocess.check_call([sys.executable, '-m', 'pip', 'install', 
'mysql-client==0.0.1'])

subprocess.check_call([sys.executable, '-m', 'pip', 'install', 
'mysql-connector==2.2.9'])

subprocess.check_call([sys.executable, '-m', 'pip', 'install', 
'mysql-connector-python==8.0.29'])

subprocess.check_call([sys.executable, '-m', 'pip', 'install', 
'mysqlclient==2.1.1'])"""

from account import account
from database import db_connector
import inspect, os.path, json

print('Bibliotheksinstallation abgeschlossen. Lege Nutzende an.')

filename = inspect.getframeinfo(inspect.currentframe()).filename
basepath = str(os.path.dirname(os.path.abspath(filename)))

f = open(basepath+'/username_password.txt','a')
f.write("Nutzername\t:\tPasswort\n\n")

uname = 'demoAdmin'
pw = account.accCreation({'identifier': uname, 'pw': 'demoAdminPasswort', 'passive':'False', 'specific_properties': {}})
id = db_connector.read('user', ['id'], {'identifier':uname}, 'one')
db_connector.update('permission', {'sysAdmin':1}, {'id':id['id']})
f.write(uname+"\t:\t"+json.loads(pw[0])['password']+"\n")

uname = 'demoProzess'
pw = account.accCreation({'identifier': uname, 'pw': 'demoAdminPasswort', 'passive':'False', 'specific_properties': {}})
id = db_connector.read('user', ['id'], {'identifier':uname}, 'one')
db_connector.update('permission', {'processAdmin':1}, {'id':id['id']})
f.write(uname+"\t:\t"+json.loads(pw[0])['password']+"\n")

uname = 'demoUser'
pw = account.accCreation({'identifier': uname, 'pw': 'demoAdminPasswort', 'passive':'False', 'specific_properties': {}})
id = db_connector.read('user', ['id'], {'identifier':uname}, 'one')
db_connector.update('permission', {'userAdmin':1}, {'id':id['id']})
f.write(uname+"\t:\t"+json.loads(pw[0])['password']+"\n")

uname = 'demoRight'
pw = account.accCreation({'identifier': uname, 'pw': 'demoAdminPasswort', 'passive':'False', 'specific_properties': {}})
id = db_connector.read('user', ['id'], {'identifier':uname}, 'one')
db_connector.update('permission', {'rightAdmin':1}, {'id':id['id']})
f.write(uname+"\t:\t"+json.loads(pw[0])['password']+"\n")

uname = 'demoGroup'
pw = account.accCreation({'identifier': uname, 'pw': 'demoAdminPasswort', 'passive':'False', 'specific_properties': {}})
id = db_connector.read('user', ['id'], {'identifier':uname}, 'one')
db_connector.update('permission', {'groupAdmin':1}, {'id':id['id']})
f.write(uname+"\t:\t"+json.loads(pw[0])['password']+"\n")

uname = 'demoPlugin'
pw = account.accCreation({'identifier': uname, 'pw': 'demoAdminPasswort', 'passive':'False', 'specific_properties': {}})
id = db_connector.read('user', ['id'], {'identifier':uname}, 'one')
db_connector.update('permission', {'pluginAdmin':1}, {'id':id['id']})
f.write(uname+"\t:\t"+json.loads(pw[0])['password']+"\n")

f.close()

print('Nutzende angelegt. Lege Prozessspaces an.')

db_connector.create('process_template', {'process_name':'Onboarding'})
db_connector.create('process_template', {'process_name':'Offboarding'})

print('Alle Tasks sind abgeschlossen.')
