import React from "react";
import { filterListByGlobalId, getCookie, getListDelta, getObjectById, removeElementById, setLocal, sortByKey } from "../helpers";
import { BtnClass1, BtnClass2 } from "../components/Btn";
import { useSearchParams } from "react-router-dom";

function UserGroup(){
    const [searchParams] = useSearchParams();
    
    return(
        <UserGroupMgmt targetID={searchParams.get("u")}/>
    )
}

class UserGroupMgmt extends React.Component{
    constructor(props) {
        super(props);
        this.state = {
            targetID: props.targetID,
            availableGroups: {global: [], local: []},
            identifier: '',
            globalGroups: [],
            localGroups: [],
            edited: false,
            serverErrorMessage: '',
            saveErrorMessage: '',
        };

        this.getParentGroup = this.getParentGroup.bind(this)
        this.addGlobalGroup = this.addGlobalGroup.bind(this)
        this.rmGlobalGroup = this.rmGlobalGroup.bind(this)
        this.addLocalGroup = this.addLocalGroup.bind(this)
        this.rmLocalGroup = this.rmLocalGroup.bind(this)
        this.reloadUser = this.reloadUser.bind(this)
        this.saveChanges = this.saveChanges.bind(this)
    }

    async componentDidMount(){
        await fetch('http://127.0.0.1:5000/getGroups', {
            method: 'GET',
            headers: {
            'Content-Type': 'application/json',
            'Auth-Header': getCookie('token')
            },
        })
        .then((response) => {
            // Check the response status
            if (response.ok) {
                return response.json();
            } else {
                throw new Error(response.status, response.json());
            }
        })
        .then((data) => {
            // Handle the response
            this.setState({
                availableGroups: {global: data['global'], local: data['local']}
            })
        })
        .catch((error, data) => {
            if (error.message === '401') {
                // Unauthorized
                this.setState({serverErrorMessage: 'Unzureichende Rechte.'})
                setLocal('userRights', data['rights'])
            } else {
                // Internal server error
                this.setState({serverErrorMessage: 'Datenbankfehler, bitte kontaktiere den zuständigen Administrierenden!'})
            }
        });


        await fetch('http://127.0.0.1:5000/getUserGroups?user='+this.state.targetID, {
            method: 'GET',
            headers: {
            'Content-Type': 'application/json',
            'Auth-Header': getCookie('token')
            },
        })
        .then((response) => {
            // Check the response status
            if (response.ok) {
                return response.json();
            } else {
                throw new Error(response.status, response.json());
            }
        })
        .then((data) => {
            // Handle the response
            if (!data['global_groups']){data['global_groups'] = []}
            if (!data['local_groups']){data['local_groups'] = []}

            this.setState({
                identifier: data['identifier'],
                globalGroups: data['global_groups'],
                localGroups: data['local_groups'],
            })
        })
        .catch((error, data) => {
            if (error.message === '401') {
                // Unauthorized
                this.setState({serverErrorMessage: 'Unzureichende Rechte.'})
                setLocal('userRights', data['rights'])
            } else {
                // Internal server error
                this.setState({serverErrorMessage: 'Datenbankfehler, bitte kontaktiere den zuständigen Administrierenden!'})
            }
        });
    }

    getParentGroup(id){
        return ' ('+(getObjectById(this.state.availableGroups.global, getObjectById(this.state.availableGroups.local, id).global_id).name)+')'
    }

    reloadUser(){
        this.componentDidMount()
        this.setState({edited:false})
    }

    addGlobalGroup(tar){
        let id = tar.target.name
        let list = this.state.globalGroups
        let obj = getObjectById(this.state.availableGroups.global,parseInt(id))
        if (!Array.isArray(list)){
            list = [{id: obj.id, name: obj.name}]
        } else {
            list.push({id: obj.id, name: obj.name})
        }

        this.setState({
            globalGroups: sortByKey(list, 'name'),
            edited: true,
        })
    }

    rmGlobalGroup(tar){
        let id = tar.target.name     
        this.setState({
            globalGroups: removeElementById(this.state.globalGroups, 'id', parseInt(id)),
            localGroups: removeElementById(this.state.localGroups, 'global_id', parseInt(id)),
            edited: true,
        })
    }

    addLocalGroup(id){
        let list = this.state.localGroups
        let obj = getObjectById(this.state.availableGroups.local,parseInt(id))
        if (!Array.isArray(list)){
            list = [{id: obj.id, name: obj.name, global_id: obj.global_id}]
        } else {
            list.push({id: obj.id, name: obj.name, global_id: obj.global_id})
        }

        this.setState({
            localGroups: sortByKey(list, 'name'),
            edited: true,
        })

    }

    rmLocalGroup(id){
        this.setState({
            localGroups: removeElementById(this.state.localGroups ,'id' ,parseInt(id)),
            edited: true,
        })

    }

    saveChanges(){
        fetch('http://127.0.0.1:5000/updateUserGroups', {
            method: 'UPDATE',
            headers: {
            'Content-Type': 'application/json',
            'Auth-Header': getCookie('token')
            },
            body: JSON.stringify({id: this.state.targetID, global: this.state.globalGroups, local: this.state.localGroups})
        })

        .then((response) => {
            // Check the response status
            if (response.ok) {
                this.setState({edited: false})
                return
            } else {
                throw new Error(response.status, response.json());
            }
        })
        .catch((error, data) => {
            if (error.message === '401') {
                // Unauthorized
                this.setState({saveErrorMessage: 'Unzureichende Rechte.'})
                setLocal('userRights', data['rights'])
            } else {
                // Internal server error
                this.setState({saveErrorMessage: 'Datenbankfehler, bitte kontaktiere den zuständigen Administrierenden!'})
            }
        });
    }

    render(){
        return(
            <div className='content'>
                <h1 className="blue noTopSpace">Nutzendenverwaltung</h1>
                {this.state.serverErrorMessage}
                <h2>Gruppenverwaltung für {this.state.identifier} (ID: {this.state.targetID})</h2>
                <GlobalGroups assigned={this.state.globalGroups} available={getListDelta(this.state.availableGroups.global, this.state.globalGroups, 'id')} addGroup={this.addGlobalGroup} rmGroup={this.rmGlobalGroup} />
                {
                    (this.state.globalGroups.length > 0)?
                    <LocalGroups assigned={this.state.localGroups} available={getListDelta(filterListByGlobalId(this.state.availableGroups.local, this.state.globalGroups), this.state.localGroups, 'id')} getParentGroup={this.getParentGroup} addGroup={this.addLocalGroup} rmGroup={this.rmLocalGroup} />:
                    <h4>Weise eine globale Gruppe zu, um Lokale hinzuzufügen.</h4>
                }
                {this.state.saveErrorMessage}<br/>
                {(this.state.edited)?<Buttons reloadUser={this.reloadUser} save={this.saveChanges} />:<></>}
            </div>
        )
    }
}

function Buttons(props){
    return(
        <div className="centered">
            <BtnClass1 text='Änderungen speichern' action={() => props.save()}/>
            <BtnClass2 text='Änderungen verwerfen' action={() => props.reloadUser()} />
        </div>
    )
}

function GlobalGroups(props){
    return(
        <div>
            <h3 className="green">Globale Gruppen</h3>
            {(props.assigned)?<GlobalGroupMap groups={props.assigned} groupMod={props.rmGroup}/>:<>Es sind bisher keine globalen Gruppen zugewiesen.<br/></>}<br/>
            <GlobalGroupMap groups={props.available} type={'add'} groupMod={props.addGroup} />
        </div>
    )
}

function LocalGroups(props){
    return(
        <div>
            <h3 className="green">Lokale Gruppen</h3>
            {(props.assigned)?<LocalGroupMap groups={props.assigned} getParentGroup={props.getParentGroup} groupMod={props.rmGroup}/>:<>Es sind bisher keine lokalen Gruppen zugewiesen.<br/></>}<br/>
            <LocalGroupMap groups={props.available} type={'add'} getParentGroup={props.getParentGroup} groupMod={props.addGroup} />
        </div>
    )
}

function GlobalGroupMap(props){
    return(
        <>
        <h4 className="noTopSpace">{(props.type === 'add')?'Verfügbare Gruppen':'Zugewiesene Gruppen'}</h4>
        <div className="flexWrapper">
            {(props.groups)?props.groups.map((data) =>(
                <>
                <BtnClass1 text={data['name'] + ((props.type === 'add')?' +':' -')} name={data['id']} key={data['id']} action={props.groupMod} />
                <div className="spacer"/>
                </>
            )):''}
        </div>
        </>
    )
}

function LocalGroupMap(props){
    return(
        <>
        <h4 className="noTopSpace">{(props.type === 'add')?'Verfügbare Gruppen':'Zugewiesene Gruppen'}</h4>
        <div className="flexWrapper">
            {(props.groups)?props.groups.map((data) =>(
                <>
                <div className="closedBubble oneLine preventSelect" name={data['id']} key={data['id']} onClick={(e) => props.groupMod(data['id'])}>{data['name'] + props.getParentGroup(data['id']) + ((props.type === 'add')?' +':' -')}</div>
                <div className="spacer"/>
                </>
            )):''}
        </div>
        </>
    )
}
export default UserGroup