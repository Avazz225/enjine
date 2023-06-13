import React from 'react';
import {DecisionComp, ParallelComp, DraggableComp, EndPoint, StartPoint, InterruptComp} from './DraggableComponents';
import { BtnClass1, BtnClass2 } from '../components/Btn';
import Xarrow from "react-xarrows";
import Sticker from './Sticker';
import { getObjectById, timeout } from '../helpers';
import { Icon } from '@iconify/react';
import closeThick from '@iconify/icons-mdi/close-thick';
import menuOpen from '@iconify/icons-mdi/menu-open';
import { getCookie, setLocal } from '../helpers';

function TempArrow(props){
    return(
        <div>
            <Sticker start={props.start} abortArrow={props.abortArrow} />
        </div>
    )
}

class WorkflowBuilder extends React.Component{
    constructor(props) {
        super(props);
        this.state = {
            dragObjects: this.props.dragObjects, 
            objectPositions: this.props.objectPositions,
            connections: this.props.connections,
            drag: false,
            previous: '',
            pluginAssignment:'',
            configVisible: false,
            usedPlugins: [],
            pluginVars: {},
        };

        this.abortArrow = this.abortArrow.bind(this);
    }

    componentDidMount(){
        let data = {"program_plugin": {"plugins": [{"id": 6, "name": "gmail", "params": {"recipient": null, "CC-recipient": null, "topic": null, "text": null, "replacementValues": null}}], "programsAndRights": [{"id": 1, "name": "BSP1"}, {"id": 2, "name": "BSP2"}, {"id": 5, "name": "E-Mailsender"}], "relations": [{"id": 1, "pid": 3, "prid": 1, "description": "Testvalue"}, {"id": 2, "pid": 3, "prid": 1, "description": "Testrelation 2"}, {"id": 3, "pid": 3, "prid": 1, "description": "\\tTestrelation 3"}, {"id": 4, "pid": 3, "prid": 1, "description": "Testrelation 4"}, {"id": 5, "pid": 3, "prid": 1, "description": "\\tTestrelation 5"}, {"id": 6, "pid": 3, "prid": 1, "description": "\\tTestrelation 6"}, {"id": 7, "pid": 3, "prid": 1, "description": "\\tTestrelation 7"}, {"id": 8, "pid": 3, "prid": 1, "description": "Testrelation 8"}, {"id": 9, "pid": 3, "prid": 1, "description": "\\tTestrelation 9"}, {"id": 10, "pid": 3, "prid": 1, "description": "Testrelation 10"}, {"id": 11, "pid": 3, "prid": 2, "description": "Testbeschreibung 1"}, {"id": 12, "pid": 3, "prid": 1, "description": "Testrelation 2"}, {"id": 13, "pid": 3, "prid": 1, "description": "Testrelation 2"}, {"id": 14, "pid": 6, "prid": 5, "description": "Sendet eine Email an den Empf\\u00e4nger"}]}, "appConf": {"initial_pw_duration": 24, "token_duration": 72, "pw_duration": 2160, "old_pw_count": 5, "configurable_specific_properties": ["sad", "testProperty"]}}
        
        // Handle the response
        this.setState({
            pluginAssignment: data['program_plugin'],
        })
    }

    async abortArrow() {
        this.setState({
            drag: false,
        })
        await timeout(500);
        this.setState({
            previous: '',
        })
    }

    deleteArrow(e){
        let id = -1
        try{
            id = e.target.attributes.name.value
        } catch {
            try{
                id = e.target.parentElement.attributes.name.value
            }catch{
                id = e.target.parentElement.parentElement.attributes.name.value
            }
           
        }

        let targetNodes= {}

        let temp = this.state.connections
        for (var i = 0; i < temp.length; i++) {
            if (Number(temp[i].id) === Number(id)) {
                targetNodes = temp[i]
                temp.splice(i, 1);
              break;
            }
        }

        let tempNodes = this.state.dragObjects

        for (var i = 0; i < tempNodes.length; i++) {
            if (Number(tempNodes[i]['id']) === Number(targetNodes['previous'])) {
                tempNodes[i]['outboundConn'] = Number(tempNodes[i]['outboundConn'])-1;
            } else if (Number(tempNodes[i]['id']) === Number(targetNodes['next'])){
                tempNodes[i]['inboundConn'] = Number(tempNodes[i]['inboundConn'])-1;
            }
        }

        this.setState({
            connections: temp,
            dragObjects: tempNodes,
        })

    }

    handleArrowDrag = (e) =>{
        this.setState({
          drag: true, 
          previous: e.target.attributes.name.value
        })
    }

    handleTextChange = (e) =>{
        let temp = this.state.dragObjects
        temp[Number(e.target.attributes.name.value)]['name'] = e.target.innerText
        this.setState({
            dragObjects: temp,
        })
    }
    
    handleArrowFinish = (e) =>{
    	if (this.state.previous !== ''){
            try{
                let next = e.target.attributes.name.value
                let temp = this.state.connections
                let id = 0
                if (temp.length !== 0){
                    id = Number(temp[temp.length-1].id) + 1
                }

                if (next !== '' && this.state.previous !== next && this.state.previous!== ''){
                    temp.push({id: id, previous: this.state.previous, next: next})
                

                    let tempStates = this.state.dragObjects
                    for (var i = 0; i < tempStates.length; i++) {
                        if (Number(tempStates[i]['id']) === Number(this.state.previous)) {
                            tempStates[i]['outboundConn'] = Number(tempStates[i]['outboundConn'])+1;
                        } else if (Number(tempStates[i]['id']) === Number(next)){
                            tempStates[i]['inboundConn'] = Number(tempStates[i]['inboundConn'])+1;
                        }
                    }

                    this.setState({
                        drag: false,
                        previous: '',
                        connections: temp,
                        dragObjects: tempStates,
                    })
                
                } else {
                    this.setState({
                        drag: false,
                        previous: '',
                    })
                }

            }catch{

            }
        }
    }

    handleAppPluginToTask = (id, relatedPlugins) =>{
        let temp = this.state.dragObjects
        const index = temp.findIndex(obj => obj.id === id);
        temp[index].relatedPlugins = relatedPlugins
        this.setState({
            dragObjects: temp
        })
    } 

    onStop = (e, ui) => {
        let temp = this.state.objectPositions
        let targetID = ui.node.attributes.name.value
        const {x, y} = temp[targetID];
        temp[targetID] = {id: targetID, x: ui.x , y: ui.y}

        this.setState({
            objectPositions: temp
        })
    }

    onAddComponent = (e) => {
        let temp = this.state.dragObjects
        let objectPositions = this.state.objectPositions

        objectPositions.push({id:(Number(temp[temp.length - 1].id) + 1), x: 0, y:0})
        temp.push({id: (Number(temp[temp.length - 1].id) + 1) , name:'Task', type: e.target.name, relatedPlugins: [], inboundConn: 0, outboundConn: 0})
        this.setState({
            dragObjects: temp,
            objectPositions: objectPositions,
        })
    }

    saveProcess = () => {

    }

    toggleConfigVisibility= () => {
        this.setState({
            configVisible: !this.state.configVisible
        })
    }

    render (){
        return(
            <> 
                {(this.state.pluginAssignment === '')?<></> :
                    <div className='flexWrapper widthMax row'>
                        <div><br/>
                            <h1 className='blue noTopSpace'>{this.props.task}</h1>
                            <center>
                                <BtnClass2 text="Neuen Task hinzufügen" name='task' action={this.onAddComponent}/><br/>
                                <BtnClass2 text="Neues exklusives Gateway" name='decision' action={this.onAddComponent}/><br/>
                                <BtnClass2 text="Neues paralleles Gateway" name='parallel' action={this.onAddComponent}/><br/>
                                <BtnClass2 text="Neuer Wartepunkt" name='interrupt' action={this.onAddComponent}/><br/><br/>
                                <BtnClass1 text="Prozess speichern" action={this.saveProcess} />
                            </center>
                            {(this.state.drag)?<TempArrow start={this.state.previous} abortArrow={this.abortArrow}/>:<></>}
                        </div>
                        {this.state.connections.map((item) => (
                                <>
                                    <Xarrow
                                        start={String(item['previous'])}
                                        end={String(item['next'])}
                                        zIndex={100}
                                        color="rgb(100,100,100)"
                                        curveness={0.5}
                                        strokeWidth={3}
                                        labels={<div className='error arrowLabel' name={item['id']} onClick={(e) => this.deleteArrow(e)}><Icon icon={closeThick}/></div>}
                                    />
                                </>
                        ))}
                        <div className="dragContainer">
                            <StartPoint outboundConn={this.state.dragObjects[0].outboundConn} maxOutboundConn={1} onStop= {this.onStop} name={0} handleArrowDrag={this.handleArrowDrag} objectPosition={this.state.objectPositions[0]} /> 
                            {this.state.dragObjects.map((item) => (
                                <>
                                {(item.type==='task')?<DraggableComp inboundConn={item.inboundConn} outboundConn={item.outboundConn} maxInboundConn={1} maxOutboundConn={1} objectPosition={getObjectById(this.state.objectPositions, item['id'])} relatedPlugins={item.relatedPlugins} handleAppPluginToTask={this.handleAppPluginToTask} name={item['id']} onStop= {this.onStop} text={item['name']} handleArrowDrag={this.handleArrowDrag} handleArrowFinish={this.handleArrowFinish} handleTextChange={this.handleTextChange} pluginAssignment={this.state.pluginAssignment} />:
                                (item.type === 'decision')? <DecisionComp inboundConn={item.inboundConn} outboundConn={item.outboundConn} maxInboundConn={1} maxOutboundConn={2} objectPosition={getObjectById(this.state.objectPositions, item['id'])} name={item['id']} onStop= {this.onStop} handleArrowDrag={this.handleArrowDrag} handleArrowFinish={this.handleArrowFinish}/>:
                                (item.type === 'parallel')? <ParallelComp inboundConn={item.inboundConn} outboundConn={item.outboundConn} maxInboundConn={2} maxOutboundConn={2} maxConn={3} objectPosition={getObjectById(this.state.objectPositions, item['id'])} name={item['id']} onStop= {this.onStop} handleArrowDrag={this.handleArrowDrag} handleArrowFinish={this.handleArrowFinish}/>:
                                (item.type === 'interrupt')? <InterruptComp inboundConn={item.inboundConn} outboundConn={item.outboundConn} maxInboundConn={1} maxOutboundConn={1} objectPosition={getObjectById(this.state.objectPositions, item['id'])} name={item['id']} onStop= {this.onStop} handleArrowDrag={this.handleArrowDrag} handleArrowFinish={this.handleArrowFinish}/>: <></>
                                }
                            </>
                            ))}
                            <EndPoint inboundConn={this.state.dragObjects[1].inboundConn}  maxInboundConn={1} onStop= {this.onStop} name={1} handleArrowFinish={this.handleArrowFinish} objectPosition={this.state.objectPositions[1]}/> 
                        </div>
                        {(true)?<></>:<RightSideMenu 
                            configVisible={this.state.configVisible} 
                            toggleConfigVisibility={this.toggleConfigVisibility}
                        />}
                    </div>
                }
            </>
        )
    }
}

function RightSideMenu(props){
    return(
        <div className='absPos right'>
            <div className='accordeonWrapper'>
                <div className={(props.configVisible)?"accordeonElem visible content":"accordeonElem content"}>
                    <div className='minHeight' onClick={props.toggleConfigVisibility}>
                        <Icon icon={menuOpen} width={32} />
                    </div>
                    <div className='content'>
                        <h2 className='oneLine noTopSpace'>Plugin Overrides</h2>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default WorkflowBuilder;