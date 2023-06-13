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
        };

    }

    componentDidMount(){
        let data = {"processNames": ["Onboarding", "Offboarding"], "message": "Successful"}
        // Handle the response
        this.setState({
            availableProcesses: data['processNames'],
        })
    }

    selectProcess = (e) => {
        if (String(e.target.innerText) === 'Onboarding'){
            let data = {"processVars": {"process_objects": [{"id": 0, "name": "Start", "type": "start", "relatedPlugins": [], "inboundConn": 0, "outboundConn": 1}, {"id": 1, "name": "End", "type": "end", "relatedPlugins": [], "inboundConn": 1, "outboundConn": 0}, {"id": 2, "name": "Maxim sehr viel Arbeit \\u00fcberbehelfen", "type": "task", "relatedPlugins": [{"id": 0, "pluginID": 3, "referenceID": 2}, {"id": 1, "pluginID": 3, "referenceID": 4}, {"id": 2, "pluginID": 6, "referenceID": 14}, {"id": 3, "pluginID": 6, "referenceID": 14}], "inboundConn": 1, "outboundConn": 1}, {"id": 3, "name": "Task", "type": "parallel", "relatedPlugins": [], "inboundConn": 1, "outboundConn": 2}, {"id": 4, "name": "Unn\\u00f6tig strenge \\u00dcberwachung", "type": "task", "relatedPlugins": [], "inboundConn": 1, "outboundConn": 1}, {"id": 5, "name": "\\u00dcberstunden anordnen", "type": "task", "relatedPlugins": [{"id": 0, "pluginID": 6, "referenceID": 14}], "inboundConn": 1, "outboundConn": 1}, {"id": 6, "name": "Task", "type": "parallel", "relatedPlugins": [], "inboundConn": 2, "outboundConn": 1}, {"id": 7, "name": "Task", "type": "interrupt", "relatedPlugins": [], "inboundConn": 1, "outboundConn": 1}], "object_positions": [{"id": "0", "x": 0, "y": 0}, {"id": "1", "x": 385, "y": 690}, {"id": "2", "x": 265, "y": 100}, {"id": "3", "x": 395, "y": 215}, {"id": "4", "x": 30, "y": 335}, {"id": "5", "x": 510, "y": 335}, {"id": "6", "x": 385, "y": 450}, {"id": "7", "x": 385, "y": 565}], "object_connections": [{"id": 0, "previous": "0", "next": "2"}, {"id": 1, "previous": "2", "next": "3"}, {"id": 2, "previous": "3", "next": "5"}, {"id": 3, "previous": "3", "next": "4"}, {"id": 4, "previous": "4", "next": "6"}, {"id": 5, "previous": "5", "next": "6"}, {"id": 6, "previous": "6", "next": "7"}, {"id": 7, "previous": "7", "next": "1"}]}, "message": "Successful"}
            this.setState({
                dragObjects: data['processVars']['process_objects'],
                objectPositions: data['processVars']['object_positions'],
                connections: data['processVars']['object_connections'],
                selectedProcess: e.target.innerText,
            })
        } else {
            this.setState({
                selectedProcess: e.target.innerText,
            })
        }
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