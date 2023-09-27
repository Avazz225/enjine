from database import db_connector
from helpers import subtractLists, filterDicts, mergeDictLists
from engine.process_executor import executeProcess

def createDeltaFromGroups(oldGroups, newGroups, executor_id, target):
    old = getRights(oldGroups)
    new = getRights(newGroups)

    delta = {'positive': subtractLists(new, old), 'negative': subtractLists(old, new)}

    if delta == {'positive': [], 'negative': []}:
        return

    if delta['positive'] != []:
        executeProcess(rights=delta['positive'], processName='Onboarding', executor=int(executor_id), affected_user=int(target))
    if delta['negative'] != []:
        executeProcess(rights=delta['negative'], processName='Offboarding', executor=int(executor_id), affected_user=int(target))


def createDeltaFromRights(oldRights, newRights, executor_id, group, group_type):
    delta = {'positive': subtractLists(newRights, oldRights[0]['rights']), 'negative': subtractLists(oldRights[0]['rights'], newRights)}

    if delta == {'positive': [], 'negative': []}:
        return
    
    users_groups = db_connector.read('user', [f'{group_type}_groups', 'id'])
    target_users = []

    for users_group in users_groups:
        if type(users_group[f'{group_type}_groups']) == list:
            for user_group in users_group[f'{group_type}_groups']:
                if group == user_group['id']:
                    target_users.append(users_group['id'])
    
    print(target_users)

    for user in target_users:
        if delta['positive'] != []:
            executeProcess(rights=delta['positive'], processName='Onboarding', executor=int(executor_id), affected_user=int(user))
        if delta['negative'] != []:
            executeProcess(rights=delta['negative'], processName='Offboarding', executor=int(executor_id), affected_user=int(user))


def getRights(data):
    globals = filterDicts(db_connector.read('global_group', ['id','rights']), data['global_groups'], 'id')
    locals = filterDicts(db_connector.read('local_group', ['id','rights']), data['local_groups'], 'id')
    totalRights = []

    for g in globals:
        totalRights = mergeDictLists(totalRights, g['rights'])
    for l in locals:
        totalRights = mergeDictLists(totalRights, l['rights'])

    return totalRights