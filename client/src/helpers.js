function getCookie(cname) {
    let name = cname + "=";
    let ca = document.cookie.split(';');
    for(let i = 0; i < ca.length; i++) {
      let c = ca[i];
      while (c.charAt(0) === ' ') {
        c = c.substring(1);
      }
      if (c.indexOf(name) === 0) {
        return c.substring(name.length, c.length);
      }
    }
    return "";
}

function getLocal(key){
    return JSON.parse(localStorage.getItem(key));
}

function loginDataRemoval(){
    //expires cookie by setting expiration date in past
    let date = new Date(Date.UTC(2000, 1, 1, 1, 1, 1))
    document.cookie = "token=1; expires="+date.toUTCString();

    localStorage.removeItem("userRights")
    localStorage.removeItem("remainingPWTime")
}

function logout(){
    loginDataRemoval();
    window.location.reload();
}

function secondsToHMS(secs){
    let hours = Math.floor(secs / 3600);
    secs %= 3600;
    let minutes = Math.floor(secs / 60);
    let seconds = secs % 60;
    return {'h': hours, 'm': minutes, 's': seconds}
}

function setCookie(token, date){
    document.cookie = "token="+token+"; expires="+date.toUTCString();
}

function setLocal(key, perms){
    localStorage.setItem(key,  JSON.stringify(perms))
}

function filterJsonArray(array, searchString) {
    let lowercaseSearchString = searchString.toLowerCase();
    return array.filter(obj => obj['name'].toLowerCase().includes(lowercaseSearchString));
}

function timeout(delay) {
    return new Promise( res => setTimeout(res, delay) );
}

function transformPluginMappings(data) {
    const transformedData = data.relations.map(relation => {
        const plugin = data.plugins.find(p => p.id === relation.pid);
        const programAndRight = data.programsAndRights.find(p => p.id === relation.prid);
    
        return {
            id: relation.id,
            pluginName: plugin ? plugin.name : '',
            programAndRight: programAndRight ? programAndRight.name : '',
            description: relation.description
        };
    });
    
    return transformedData;
}

function getObjectById(list, filterId) {  
    for (let i = 0; i < list.length; i++) {
        if (Number(list[i].id) === filterId) {
            return list[i];
        }
    }
    
    return {x:0, y:0}; // Wenn keine Übereinstimmung gefunden wurde
}

function getListDelta(list1, list2, filter){
    //list1 = base
    //list2 = list substracted from list 1
    if (!Array.isArray(list1) || !Array.isArray(list2)) {
        return list1
      }
    
      let difference = list1.filter(item1 => !list2.some(item2 => item1[filter] === item2[filter]));
    
      return difference;
}

function filterListByGlobalId(list1, list2) {

    if (!Array.isArray(list1) || !Array.isArray(list2)) {
      return []
    }
  
    let idsList2 = list2.map(item => item.id);
    let filteredList = list1.filter(item => idsList2.includes(item.global_id));

    return filteredList;
}

function sortByKey(list, key) {
    if (!Array.isArray(list)) {
      return list
    }
  
    list.sort((a, b) => {
      if (a[key] < b[key]) {
        return -1;
      } else if (a[key] > b[key]) {
        return 1;
      } else {
        return 0;
      }
    });
  
    return list;
}

function removeElementById(list, arg, filter) {
    if (!Array.isArray(list)) {
      return list
    }

    return list.filter(item => item[arg] !== filter);
}

export {getCookie, getLocal, logout, secondsToHMS, setCookie, setLocal, filterJsonArray, timeout, transformPluginMappings, getObjectById, getListDelta, filterListByGlobalId, sortByKey, removeElementById}