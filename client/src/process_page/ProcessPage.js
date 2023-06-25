import React from "react"
import WorkflowBuilder from "./WorkflowBuild"
import { getCookie, setLocal } from "../helpers";
import { BtnClass1 } from "../components/Btn";

class ProcessPage extends React.Component{
    constructor(props) {
        super(props);
        this.state = {
            availableProcesses:[],
            selectedProcess: '',
            dragObjects: [{id:0, name:'Start', type:'start', relatedPlugins: [], inboundConn: 0, outboundConn: 0}, {id:1, name:'End', type:'end', relatedPlugins: [], inboundConn: 0, outboundConn: 0}], 
            objectPositions: [{id:0,x:0,y:0}, {id:1,x:0,y:60}],
            connections: [],
            pluginConfig: [],
        };

    }

    componentDidMount(){
        fetch('http://127.0.0.1:5000/getAllProcesses', {
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
                availableProcesses: data['processNames'],
            })
        })
        .catch((error, data) => {
            if (error.message === '401') {
                // Unauthorized
                this.setState({serverErrorMessage: 'Unzureichende Rechte.'})
                setLocal('userRights', data['rights'])
            } else {
                // Internal server error
                this.setState({serverErrorMessage: 'Der Server ist nicht erreichbar, bitte kontaktiere den zuständigen Administrierenden!'})
            }
        });
    }

    selectProcess = (e) => {
        fetch('http://127.0.0.1:5000/getProcess?target='+e.target.innerText, {
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
            if (data['processVars']['process_objects']){
                this.setState({
                    dragObjects: data['processVars']['process_objects'],
                    objectPositions: data['processVars']['object_positions'],
                    connections: data['processVars']['object_connections'],
                    pluginConfig: data['processVars']['plugin_config'],
                    selectedProcess: e.target.innerText,
                })
            } else {
                this.setState({
                    selectedProcess: e.target.innerText,
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
                this.setState({serverErrorMessage: 'Der Server ist nicht erreichbar, bitte kontaktiere den zuständigen Administrierenden!'})
            }
        });
    }

    render (){
        return(
            <>
            {(this.state.selectedProcess === '')? <Selector serverErrorMessage={this.state.serverErrorMessage} options={this.state.availableProcesses} handleSelect={this.selectProcess} />: 
                <WorkflowBuilder 
                    task={this.state.selectedProcess} 
                    dragObjects={this.state.dragObjects} 
                    objectPositions={this.state.objectPositions} 
                    connections={this.state.connections} 
                    pluginConfig={this.state.pluginConfig}
                />
            }
            </>
        )
    }
}

function Selector(props){
    return(
        <div className="content">
            <h1 className="blue noTopSpace">Prozessverwaltung</h1>
            {props.serverErrorMessage}
            {props.options.map((options) => (
                <BtnClass1 text={options} action={props.handleSelect} />        
            ))}
        </div>
    )
}

export default ProcessPage