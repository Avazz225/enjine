import React, { useEffect, useRef, useState } from 'react';
import {DecisionComp, DecisionUniterComp, DraggableComp, EndPoint, StartPoint, InterruptComp} from './DraggableComponents';
import { BtnClass2 } from '../components/Btn';
import Xarrow from "react-xarrows";
import Sticker from './Sticker';
import { timeout } from '../helpers';
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
            dragObjects: [{id:0, name:'Start', type:'start', relatedPlugins: []}, {id:1, name:'End', type:'end', relatedPlugins: []}], 
            objectPositions: [{id:0,x:0,y:0}, {id:1,x:0,y:0}],
            connections: [],
            drag: false,
            previous: '',
            pluginAssignment: [{}],
        };

        this.abortArrow = this.abortArrow.bind(this);
    }

    componentDidMount(){
        fetch('http://127.0.0.1:5000/getPrograms', {
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
                pluginAssignment: data['program_plugin'],
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

    async abortArrow() {
        this.setState({
            drag: false,
        })
        await timeout(500);
        this.setState({
            previous: '',
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
        try{
        let next = e.target.attributes.name.value
        let temp = this.state.connections

        if (next !== '' && this.state.previous !== next && this.state.previous!== ''){
            temp.push({previous: this.state.previous, next: next})
        }

        this.setState({
            drag: false,
            previous: '',
            connections: temp,
        })}
        catch{

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
        temp.push({id: this.state.dragObjects.length, name:'Task', type: e.target.name, relatedPlugins: []})
        objectPositions.push({id:this.state.dragObjects.length, x: 0, y:0})
        this.setState({
            dragObjects: temp,
            objectPositions: objectPositions,
        })
    }

    render (){
        return(
            <>
                <div><br/><br/>
                    <BtnClass2 text="Neuen Task hinzufügen" name='task' action={this.onAddComponent}/><br/>
                    <BtnClass2 text="Neues exklusives Gateway" name='decision' action={this.onAddComponent}/><br/>
                    <BtnClass2 text="Neues paralleles Gateway" name='parallel' action={this.onAddComponent}/><br/>
                    <BtnClass2 text="Neuer Wartepunkt" name='interrupt' action={this.onAddComponent}/>
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
                            />
                        </>
                ))}
                <div className="dragContainer">
                    <StartPoint onStop= {this.onStop} name={0} handleArrowDrag={this.handleArrowDrag} /> 
                    {this.state.dragObjects.map((item) => (
                        <>
                        {(item.type==='task')?<DraggableComp relatedPlugins={item.relatedPlugins} handleAppPluginToTask={this.handleAppPluginToTask} name={item['id']} onStop= {this.onStop} text={item['name']} handleArrowDrag={this.handleArrowDrag} handleArrowFinish={this.handleArrowFinish} handleTextChange={this.handleTextChange} pluginAssignment={this.state.pluginAssignment} />:
                        (item.type === 'decision')? <DecisionComp name={item['id']} onStop= {this.onStop} handleArrowDrag={this.handleArrowDrag} handleArrowFinish={this.handleArrowFinish}/>:
                        (item.type === 'parallel')? <DecisionUniterComp name={item['id']} onStop= {this.onStop} handleArrowDrag={this.handleArrowDrag} handleArrowFinish={this.handleArrowFinish}/>:
                        (item.type === 'interrupt')? <InterruptComp name={item['id']} onStop= {this.onStop} handleArrowDrag={this.handleArrowDrag} handleArrowFinish={this.handleArrowFinish}/>: <></>
                        }
                      </>
                    ))}
                    <EndPoint onStop= {this.onStop} name={1} handleArrowFinish={this.handleArrowFinish}/> 
                </div>
            </>
        )
    }
}

export default WorkflowBuilder;