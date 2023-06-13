import React from "react";
import { getCookie, setLocal, transformPluginMappings } from "../helpers";
import { BtnClass2, BtnClass3 } from "../components/Btn";
import AutocompleteInput from "../components/AutoCompleteInput";

function AppTable(props){
    return(
        <div className="accordeonElem visible">
            <h2>Zuordnung von Plugins</h2>
            <table>
                <thead>
                    <tr>
                        <th>Programm-/ Rechtename</th>
                        <th>Zugeordnetes Plugin</th>
                        <th>Beschreibung</th>
                    </tr>
                </thead>
                <tbody>
                    {(props.newRelation)?<NewRelation 
                                            toggleNewRelation={props.toggleNewRelation} 
                                            pluginAssignment={props.pluginAssignment} 
                                            handleSelectRight={props.handleSelectRight}
                                            handleSelectPlugin={props.handleSelectPlugin}
                                            handleInput={props.handleInput}
                                            description={props.description}
                                            createNewRelation={props.createNewRelation}
                                            selectedPlugin={props.selectedPlugin}
                                            selectedRight={props.selectedRight}
                    />:
                    <tr>
                        <td colSpan="3">
                            <BtnClass2 text="Neue Zuordnung erstellen" action={props.toggleNewRelation} />
                        </td>
                    </tr>}
                    <TableElement data={props.data} />
                </tbody>
            </table>
        </div>
    )
}

function ApplicationList(props){
    return(
        <div className="accordeonElem visible">
            <h2>Verfügbare Programme/Rechte</h2>
            <div className="flexWrapper">
                <AppElement data={props.data}/>
            </div>
            {(props.newPR)?<CreateNewPR toggleNewPR={props.toggleNewPR} newPRName={props.newPRName} handleInput={props.handleInput} createNewPR={props.createNewPR} />:<BtnClass2 text="Neues Programm / Recht anlegen" action={props.toggleNewPR} />}
        </div>
    )
}

const AppElement = ({data}) =>( 
    <>
    {data.map(data =>(
        <div className="closedBubble" key={data['id']}>
            <span className="oneLine">{data['name']}</span>
        </div>
    ))}
    </>
)

function ConfigDisplay(props){
    return(
        <div className="accordeonElem visible">
            <h2>Anwendungskonfiguration</h2>
            <b>Eigenschaften für Nutzendenobjekte</b><br/>
            {(props.appConfig.configurable_specific_properties)?<div className="flexWrapper"><PropElement data={props.appConfig.configurable_specific_properties}/></div>: <></>}
            {(props.newUserProp)?<CreateNewUserProp createNewUserProp={props.createNewUserProp} toggleNewProp={props.toggleNewProp} handleInput={props.handleInput} newUserPropName={props.newUserPropName} />: <BtnClass2 text='Neue Eigenschaft für Nutzende' action={props.toggleNewProp} />}<br/><br/> 
            <b>Gültigkeit von Authentifizierungstokens</b><br/> 
            <input className="number" value={props.appConfig.token_duration} onChange={props.handleChange} type="number" name="token_duration"/> Stunden<br/><br/>
            <b>Gültigkeit von Initialpasswörtern</b><br/> 
            <input className="number" value={props.appConfig.initial_pw_duration} onChange={props.handleChange} type="number" name="initial_pw_duration"/> Stunden<br/><br/>
            <b>Gültigkeit von Passwörtern</b><br/> 
            <input className="number" value={props.appConfig.pw_duration/24} onChange={props.handleChange} type="number" name="pw_duration"/> Tage<br/><br/>
            <b>Größe der Passworthistorie</b><br/> 
            <input className="number" value={props.appConfig.old_pw_count} onChange={props.handleChange} type="number" name="old_pw_count"/> Passwörter<br/><br/>

            {(props.changed)?<BtnClass2 text='Konfiguration speichern' action={props.updateAppConfig} />: <></>}
        </div>
    )
}

function CreateNewPR(props){
    return(
        <div>
            <input name="newPRName" onInput={props.handleInput} value={props.newPRName} /><br/>
            <div>
                <BtnClass2 text='Neuen Eintrag erstellen' disabled={(props.newPRName==='')} action={props.createNewPR} />
                <BtnClass3 text='Abbrechen' action={props.toggleNewPR} />
            </div>
        </div>
    )
}

function CreateNewUserProp(props){
    return(
        <div>
            <input name="newUserPropName" onInput={props.handleInput} value={props.newUserPropName} /><br/>
            <div>
                <BtnClass2 text='Neuen Eintrag erstellen' disabled={(props.newUserPropName==='')} action={props.createNewUserProp} />
                <BtnClass3 text='Abbrechen' action={props.toggleNewProp} />
            </div>
        </div>
    )
}

function NewRelation(props){
    return(
        <tr>
            <td><AutocompleteInput dataList={props.pluginAssignment.programsAndRights} onSelect={props.handleSelectRight}/></td>
            <td><AutocompleteInput dataList={props.pluginAssignment.plugins} onSelect={props.handleSelectPlugin}/></td>
            <td><input type="text" name="description" onInput={props.handleInput} value={props.description}/></td>
            <td> <center><BtnClass2 text="Zuordnung erstellen" action={props.createNewRelation} disabled={(props.selectedPlugin === 0 | props.selectedRight === 0)} /><br/><BtnClass3 text="Abbrechen" action={props.toggleNewRelation}/></center> </td>
        </tr>
    )
}

function PluginList(props){
    return(
        <div>
            <h2>Verfügbare Plugins</h2>
            <div className="flexWrapper">
                <AppElement data={props.data}/>
            </div>
        </div>
    )
}

const PropElement = ({data}) =>( 
    <>
    {data.map(data =>(
        <div className="closedBubble">
            {data}
        </div>
    ))}
    </>
)

const TableElement = ({data}) =>( 
    <>
    {data.map(data =>(
        <tr key={data['id']}>
            <td>{data['programAndRight']}</td>
            <td>{data['pluginName']}</td>
            <td>{data['description']}</td>
        </tr>
    ))}
    </>
)

class AppManagement extends React.Component{
    constructor(props) {
        super(props);
        this.state = {
            serverErrorMessage: '',
            pluginAssignment: {programsAndRights:[], plugins:[]},
            mappedPluginAssignment: [{}],
            appConfig: null,
            appConfigChanged: false,
            newRelation: false,
            selectedPlugin: 0,
            selectedRight: 0,
            description: '',
            newPR: false,
            newPRName: '',
            newUserProp: false,
            newUserPropName: '',
        };

        this.handleConfigChange = this.handleConfigChange.bind(this)

    }

    componentDidMount(){
        let data = {"program_plugin": {"plugins": [{"id": 6, "name": "gmail", "params": {"recipient": null, "CC-recipient": null, "topic": null, "text": null, "replacementValues": null}}], "programsAndRights": [{"id": 1, "name": "BSP1"}, {"id": 2, "name": "BSP2"}, {"id": 5, "name": "E-Mailsender"}], "relations": [{"id": 1, "pid": 3, "prid": 1, "description": "Testvalue"}, {"id": 2, "pid": 3, "prid": 1, "description": "Testrelation 2"}, {"id": 3, "pid": 3, "prid": 1, "description": "\\tTestrelation 3"}, {"id": 4, "pid": 3, "prid": 1, "description": "Testrelation 4"}, {"id": 5, "pid": 3, "prid": 1, "description": "\\tTestrelation 5"}, {"id": 6, "pid": 3, "prid": 1, "description": "\\tTestrelation 6"}, {"id": 7, "pid": 3, "prid": 1, "description": "\\tTestrelation 7"}, {"id": 8, "pid": 3, "prid": 1, "description": "Testrelation 8"}, {"id": 9, "pid": 3, "prid": 1, "description": "\\tTestrelation 9"}, {"id": 10, "pid": 3, "prid": 1, "description": "Testrelation 10"}, {"id": 11, "pid": 3, "prid": 2, "description": "Testbeschreibung 1"}, {"id": 12, "pid": 3, "prid": 1, "description": "Testrelation 2"}, {"id": 13, "pid": 3, "prid": 1, "description": "Testrelation 2"}, {"id": 14, "pid": 6, "prid": 5, "description": "Sendet eine Email an den Empf\\u00e4nger"}]}, "appConf": {"initial_pw_duration": 24, "token_duration": 72, "pw_duration": 2160, "old_pw_count": 5, "configurable_specific_properties": ["sad", "testProperty"]}}
        // Handle the response
        this.setState({
            pluginAssignment: data['program_plugin'],
            appConfig: data['appConf'],
            mappedPluginAssignment: transformPluginMappings(data['program_plugin']),
        })
       
    }

    createNewRelation = () =>{
        
    }

    createNewPR = () =>{
        
    }

    createNewUserProp = () => {
        let temp = this.state.appConfig
        try {
            temp['configurable_specific_properties'].push(this.state.newUserPropName)
        } catch (error) {
            temp['configurable_specific_properties'] = [this.state.newUserPropName]
        }
        

        this.setState({
            appConf: temp,
            newUserPropName: '',
            newUserProp: false,
            appConfigChanged: true,
        })
        
    }

    handleConfigChange = (e) => {
        let temp = this.state.appConfig
        let val = e.target.value
        if (e.target.name === 'pw_duration') {val = e.target.value*24}
        temp[e.target.name] = val

        this.setState({ 
            appConfig: temp, 
            appConfigChanged: true,
        });
    };

    handleInput = (e) => {
        this.setState({
            [e.target.name]: e.target.value,
        })
    }

    handleSelectPlugin = (value) =>{
        this.setState({
            selectedPlugin: value
        })
    }

    handleSelectRight = (value) =>{
        this.setState({
            selectedRight: value
        })
    }

    toggleNewPR = () =>{
        this.setState({
            newPR: !this.state.newPR,
        })
    }

    toggleNewRelation = () =>{
        this.setState({
            newRelation: !this.state.newRelation,
            selectedRight: 0,
            selectedPlugin: 0,
            description: '',
        })
    }

    toggleNewProp = () => {
        this.setState({
            newUserProp: !this.state.newUserProp
        })
    }

    updateAppConfig = () =>{
        
    }

    render(){
        return(
            <div className="content">
                <h1 className="blue noTopSpace">Programmverwaltung</h1>
                <div className="flexWrapper">
                    <ApplicationList 
                        data={this.state.pluginAssignment['programsAndRights']} 
                        createNewPR={this.createNewPR} 
                        newPR={this.state.newPR} 
                        toggleNewPR={this.toggleNewPR} 
                        newPRName={this.state.newPRName} 
                        handleInput={this.handleInput} 
                    />
                    <PluginList data={this.state.pluginAssignment['plugins']}/>
                </div>
                <div className="flexWrapper spaceAround">
                <AppTable   data={this.state.mappedPluginAssignment} 
                            newRelation={this.state.newRelation} 
                            toggleNewRelation={this.toggleNewRelation} 
                            pluginAssignment={this.state.pluginAssignment} 
                            handleSelectRight={this.handleSelectRight}
                            handleSelectPlugin={this.handleSelectPlugin}
                            handleInput={this.handleInput}
                            description={this.state.description}
                            createNewRelation={this.createNewRelation}
                            selectedPlugin={this.state.selectedPlugin}
                            selectedRight={this.state.selectedRight}
                />
                {(this.state.appConfig)?<ConfigDisplay 
                                            appConfig={this.state.appConfig} 
                                            changed={this.state.appConfigChanged} 
                                            handleChange={this.handleConfigChange} 
                                            newUserProp={this.state.newUserProp}
                                            toggleNewProp={this.toggleNewProp}
                                            newUserPropName={this.state.newUserPropName}
                                            handleInput={this.handleInput}
                                            createNewUserProp = {this.createNewUserProp}
                                            updateAppConfig = {this.updateAppConfig}
                                        />        
                :<></>}
                </div>
            </div>
        )
    }
}

export default AppManagement