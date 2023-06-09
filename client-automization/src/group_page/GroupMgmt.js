import React from "react";
import { BtnClass1, BtnClass2, BtnClass3 } from "../components/Btn";
import { getCookie, setLocal } from "../helpers";

function GlobalGroup(props){
    return(
        <div>
            <h2>Globale Gruppen</h2>
            <div className="flexWrapper">
                <GlobalMapper data={props.data} handleGroupSelect={props.handleGroupSelect} />
            </div>
            {(props.onlyLocal)?<></>:(!props.addGlobalGroup)?<BtnClass2 text='Neue Globale Gruppe' action={props.toggleAddGlobalGroup} />:
            <GlobalGroupAdd handleChange={props.handleChange} globGroupName={props.globGroupName} toggleAddGlobalGroup={props.toggleAddGlobalGroup} createGlobalGroup={props.createGlobalGroup} />}
        </div>
    )
}

function GlobalGroupAdd(props){
    return(
        <div className="flexWrapper">
            <div className="glassyCard">
                <label htmlFor="globGroupName">Gruppenname:</label><br/>
                <input
                    type="text"
                    id="globGroupName"
                    name="globGroupName"
                    value={props.globGroupName}
                    onChange={props.handleChange}
                /><br/><br/>
                <center>
                    <BtnClass2 text="Gruppe erstellen" action={props.createGlobalGroup} disabled={props.globGroupName === ''} /><br/>
                    <BtnClass3 text="Nicht erstellen" action={props.toggleAddGlobalGroup} />
                </center>
            </div>
        </div>
    )
}

const GlobalMapper = ({data, handleGroupSelect}) =>( 
    <>
    {data.map((data) =>(
        <BtnClass1 text={data['name']} name={data['id']} key={data['id']} action={handleGroupSelect} />
    ))}
    </>
)

function LocalGroup(props){
    return(
        <div>
            <h3>Lokale Gruppen der Gruppe {props.globalGroup}</h3>
            <div className="flexWrapper">
            <LocalMapper data={props.data} />
            </div>
            {(props.selectedID === 0)?<>Wähle eine globale Gruppe aus, um lokale Gruppen zu sehen.</>:(!props.addLocalGroup)?<BtnClass2 text='Neue Lokale Gruppe' action={props.toggleAddLocalGroup} />:
            <LocalGroupAdd handleChange={props.handleChange} locGroupName={props.locGroupName} toggleAddLocalGroup={props.toggleAddLocalGroup} createLocalGroup={props.createLocalGroup} />}
        </div>
    )
}

function LocalGroupAdd(props){
    return(
        <div className="flexWrapper">
            <div className="glassyCard">
                <label htmlFor="locGroupName">Gruppenname:</label><br/>
                <input
                    type="text"
                    id="locGroupName"
                    name="locGroupName"
                    value={props.locGroupName}
                    onChange={props.handleChange}
                /><br/><br/>
                <center>
                    <BtnClass2 text="Gruppe erstellen" action={props.createLocalGroup} disabled={props.locGroupName === ''}/><br/>
                    <BtnClass3 text="Nicht erstellen" action={props.toggleAddLocalGroup} />
                </center>
            </div>
        </div>
    )
}

const LocalMapper = ({data}) =>( 
    <>
    {data.map((data) =>(
        <div key={data['id']} className="closedBubble">{data['name']}</div>
    ))}
    </>
)


class GroupManager extends React.Component{
    constructor(props) {
        super(props);
        this.state = {
            serverErrorMessage: '',
            globalGroupData: [{name:'TEST', id:0}],
            localGroupData: [{name:'TEST', id:0, global_id:0},{name:'TEST', id:1, global_id:1}],
            localGroupDataFiltered: [],
            selectedGlobalGroup: '...',
            selectedID: 0,
            onlyLocal: true,
            globGroupName: '',
            locGroupName: '',
            addGlobalGroup: false,
            addLocalGroup: false,
        };

        this.handleGroupSelect = this.handleGroupSelect.bind(this)
        this.toggleAddGlobalGroup = this.toggleAddGlobalGroup.bind(this)
        this.toggleAddLocalGroup = this.toggleAddLocalGroup.bind(this)
        this.handleChange = this.handleChange.bind(this)
        this.createGlobalGroup = this.createGlobalGroup.bind(this)
        this.createLocalGroup = this.createLocalGroup.bind(this)

    }

    componentDidMount(){
        fetch('http://127.0.0.1:5000/getGroups', {
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
            if (data['pData'] !== 'f'){
                this.setState({
                    globalGroupData: data['global'],
                    localGroupData: data['local'],
                    onlyLocal: data['onlyLocal'],
                    serverErrorMessage: ''
                })
            }
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

    createGlobalGroup(){

        let data={  type: 'global',
                name: this.state.globGroupName
            }

        fetch('http://127.0.0.1:5000/addGroups', {
            method: 'POST',
            headers: {
            'Content-Type': 'application/json',
            'Auth-Header': getCookie('token')
            },
            body: JSON.stringify(data)
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
            let temp = this.state.globalGroupData
            temp.push({name: this.state.globGroupName, id:data['id']})

            this.setState({
                globalGroupData: temp,
                addGlobalGroup: false,
                globGroupName: '',
                serverErrorMessage: ''
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

    createLocalGroup(){
        let data = {
                type: 'local',
                masterID: this.state.selectedID,
                name: this.state.locGroupName
                }

        fetch('http://127.0.0.1:5000/addGroups', {
            method: 'POST',
            headers: {
            'Content-Type': 'application/json',
            'Auth-Header': getCookie('token')
            },
            body: JSON.stringify(data)
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
            let temp = this.state.localGroupData
            temp.push({name: this.state.locGroupName, id:data['id'], global_id: this.state.selectedID})

            // Handle the response
            this.setState({
                addLocalGroup: false,
                localGroupData: temp,
                localGroupDataFiltered: temp.filter(obj => obj['global_id'] == this.state.selectedID),
                locGroupName: ''
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

    handleChange = (e) => {
        this.setState({ [e.target.name]: e.target.value });
    };

    handleGroupSelect(e){
        let id = e.target.name
        this.setState({selectedID:id,
            selectedGlobalGroup: this.state.globalGroupData.filter(obj => obj['id'] == id)[0]['name'],
            localGroupDataFiltered: this.state.localGroupData.filter(obj => obj['global_id'] == id),
        })
    }

    toggleAddGlobalGroup(){
        this.setState({
            addGlobalGroup: !this.state.addGlobalGroup
        })
    }

    toggleAddLocalGroup(){
        this.setState({
            addLocalGroup: !this.state.addLocalGroup
        })
    }

    render(){
        return(
            <div className="content">
                <h1 className="blue noTopSpace">Gruppenverwaltung</h1>
                <span className='error'>{this.state.serverErrorMessage}</span>
                <GlobalGroup 
                    data={this.state.globalGroupData} 
                    handleGroupSelect={this.handleGroupSelect} 
                    onlyLocal={this.state.onlyLocal} 
                    handleChange={this.handleChange} 
                    globGroupName={this.state.globGroupName} 
                    addGlobalGroup={this.state.addGlobalGroup}
                    toggleAddGlobalGroup={this.toggleAddGlobalGroup}
                    createGlobalGroup={this.createGlobalGroup}
                />
                <LocalGroup 
                    data={this.state.localGroupDataFiltered} 
                    globalGroup={this.state.selectedGlobalGroup} 
                    selectedID={this.state.selectedID}
                    handleChange={this.handleChange} 
                    locGroupName={this.state.locGroupName} 
                    addLocalGroup={this.state.addLocalGroup}
                    toggleAddLocalGroup={this.toggleAddLocalGroup}
                    createLocalGroup={this.createLocalGroup}
                />
            </div>
        )
    }
}

export default GroupManager