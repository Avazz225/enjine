import React from "react"
import { getCookie, getListDelta, removeElementById, setLocal, sortByKey } from "../helpers";
import { BtnClass1, BtnClass2 } from "../components/Btn";
import { getObjectById } from "../helpers";

class RightManager extends React.Component{
    constructor(props) {
        super(props);
        this.state = {
            availableGroups: {global: [], local: []},
            programsAndRights: [],
            serverErrorMessage: '',

            selectedGroup: {type: '', id: 0},
            popUpVisible: false,
            edited: false,
            editedMetadata: {},
        };
        this.getParentGroup = this.getParentGroup.bind(this)
        this.groupMod = this.groupMod.bind(this)
        this.addRight = this.addRight.bind(this)
        this.rmRight = this.rmRight.bind(this)
        this.saveChanges = this.saveChanges.bind(this)
        this.reload = this.reload.bind(this)
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

        await fetch('http://127.0.0.1:5000/getPrograms?smallResp=true', {
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
                programsAndRights: data['program_plugin']
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

    groupMod(id){ 
        if (this.state.edited){return}
        
        if (typeof id === 'number'){
            id = parseInt(id)
            var type = 'local'
        } else {
            id = parseInt(id.target.name)
            var type = 'global'
        }
        
        this.setState({
            selectedGroup: {type: type, id: parseInt(id)},
            popUpVisible: true,
        })

    }

    addRight(tar){
        let id = tar.target.name
        let temp = this.state.availableGroups
        let position = temp[this.state.selectedGroup.type].findIndex((element) => element.id === this.state.selectedGroup.id);
        let obj = getObjectById(this.state.programsAndRights,parseInt(id))

        if (!Array.isArray(temp[this.state.selectedGroup.type][position]['rights'])){
            temp[this.state.selectedGroup.type][position]['rights'] = [{id: obj.id, name: obj.name}]
        } else {
            temp[this.state.selectedGroup.type][position]['rights'].push({id: obj.id, name: obj.name})
        }

        temp[this.state.selectedGroup.type][position]['rights'] = sortByKey(temp[this.state.selectedGroup.type][position]['rights'], 'name')

        this.setState({
            availableGroups: temp,
            edited: true,
            editedMetadata: temp[this.state.selectedGroup.type][position],
        })
    }

    rmRight(tar){
        let id = tar.target.name
        let temp = this.state.availableGroups
        let position = temp[this.state.selectedGroup.type].findIndex((element) => element.id === this.state.selectedGroup.id);
        let obj = getObjectById(this.state.programsAndRights,parseInt(id))
        
        temp[this.state.selectedGroup.type][position]['rights'] = removeElementById(temp[this.state.selectedGroup.type][position]['rights'], 'id', obj.id)
        
        this.setState({
            availableGroups: temp,
            edited: true,
            editedMetadata: temp[this.state.selectedGroup.type][position],
        })

    }

    saveChanges(){
        fetch('http://127.0.0.1:5000/updGroupRights', {
            method: 'UPDATE',
            headers: {
            'Content-Type': 'application/json',
            'Auth-Header': getCookie('token')
            },
            body: JSON.stringify({metadata: this.state.editedMetadata, type: this.state.selectedGroup.type})
        })

        .then((response) => {
            // Check the response status
            if (response.ok) {
                this.setState({edited: false, saveErrorMessage: '',})
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

    reload(){
        this.componentDidMount()
        this.setState({
            edited: false,
        })
    }

    render(){
        return(
            <div className="content">
                <h1 className="blue noTopSpace">Rechteverwaltung</h1>
                <span className="error">{this.state.serverErrorMessage}</span>
                <div className="flexWrapper">
                    <GlobalGroups   available={this.state.availableGroups.global} 
                                    groupMod={this.groupMod} 
                                    edited={this.state.edited} 
                    />
                    <div className="spacer"/>
                    <LocalGroups    available={this.state.availableGroups.local} 
                                    getParentGroup={this.getParentGroup} 
                                    groupMod={this.groupMod} 
                    />
                </div>
                {(this.state.popUpVisible)?<GroupModifier   selectedGroupName={getObjectById(this.state.availableGroups[this.state.selectedGroup.type], this.state.selectedGroup.id).name} 
                                                            addRight={this.addRight} 
                                                            rmRight={this.rmRight} 
                                                            programsAndRights={this.state.programsAndRights} selectedGroup={this.state.selectedGroup} 
                                                            assigned = {getObjectById(this.state.availableGroups[this.state.selectedGroup.type], this.state.selectedGroup.id)} 
                />
                :<></>}
                {(this.state.edited)?<Buttons   reload={this.reload} 
                                                save={this.saveChanges}
                />
                :<></>}
            </div>
        )
    }
}

function Buttons(props){
    return(
        <div className="centered">
            <BtnClass1 text='Änderungen speichern' action={() => props.save()}/>
            <BtnClass2 text='Änderungen verwerfen' action={() => props.reload()} />
        </div>
    )
}

function GroupModifier(props){
    return(
        <div>
            <h3>Zugewiesene Rechte ({props.selectedGroupName})</h3>
            <RightMapper data={props.assigned.rights} type={'subst'} modRight={props.rmRight} />

            <h3>Verfügbare Rechte</h3>
            <RightMapper data={getListDelta(props.programsAndRights, props.assigned.rights, 'id')} type={'add'} modRight={props.addRight} />
        </div>
    )
}

function RightMapper(props){
    return(
        <>
        <div className="flexWrapper">
            {(props.data)?props.data.map((data) =>(
                <>
                <BtnClass2 text={(props.type === 'add')? data['name']+' +': data['name']+' -'} name={data['id']} key={data['id']} action={props.modRight} />
                <div className="spacer"/>
                </>
            )):''}
        </div>
        </>
    )
}

function GlobalGroups(props){
    return(
        <div>
            <h3 className="green">Globale Gruppen</h3>
            {(props.available)?<GlobalGroupMap groups={props.available} groupMod={props.groupMod} edited={props.edited} />:<>Es sind keine globalen Gruppen vorhanden.<br/></>}
        </div>
    )
}

function LocalGroups(props){
    return(
        <div>
            <h3 className="green">Lokale Gruppen</h3>
            {(props.available)?<LocalGroupMap groups={props.available} getParentGroup={props.getParentGroup} groupMod={props.groupMod}/>:<>Es sind keine lokalen Gruppen angelegt.<br/></>}<br/>
        </div>
    )
}

function GlobalGroupMap(props){
    return(
        <>
        <div className="flexWrapper">
            {(props.groups)?props.groups.map((data) =>(
                <>
                <BtnClass1 text={data['name']} name={data['id']} key={data['id']} action={props.groupMod} disabled={props.edited} />
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
        <div className="flexWrapper">
            {(props.groups)?props.groups.map((data) =>(
                <>
                <div className="closedBubble oneLine preventSelect" name={data['id']} key={data['id']} onClick={(e) => props.groupMod(data['id'])}>{data['name'] + props.getParentGroup(data['id'])}</div>
                <div className="spacer"/>
                </>
            )):''}
        </div>
        </>
    )
}

export default RightManager