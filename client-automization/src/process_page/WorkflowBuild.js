import React, { useEffect, useRef, useState } from 'react';
import {DecisionComp, DecisionUniterComp, DraggableComp, EndPoint, StartPoint, InterruptComp} from './DraggableComponents';
import { BtnClass2 } from '../components/Btn';
import Xarrow from "react-xarrows";
import Sticker from './Sticker';
import { timeout } from '../helpers';

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
            dragObjects: [{id:0, name:'Start', type:'start'}, {id:1, name:'End', type:'end'}], 
            objectPositions: [{id:0,x:0,y:0}, {id:1,x:0,y:0}],
            connections: [],
            drag: false,
            previous: '',
        };

        this.abortArrow = this.abortArrow.bind(this);
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
        temp.push({id: this.state.dragObjects.length, name:'Test', type: e.target.name})
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
                <div className="dragContainer">
                    <StartPoint onStop= {this.onStop} name={0} handleArrowDrag={this.handleArrowDrag} /> 
                    {this.state.dragObjects.map((item) => (
                        <>
                        {(item.type==='task')?<DraggableComp name={item['id']} onStop= {this.onStop} text={item['name']} handleArrowDrag={this.handleArrowDrag} handleArrowFinish={this.handleArrowFinish} handleTextChange={this.handleTextChange} />:
                        (item.type === 'decision')? <DecisionComp name={item['id']} onStop= {this.onStop} handleArrowDrag={this.handleArrowDrag} handleArrowFinish={this.handleArrowFinish}/>:
                        (item.type === 'parallel')? <DecisionUniterComp name={item['id']} onStop= {this.onStop} handleArrowDrag={this.handleArrowDrag} handleArrowFinish={this.handleArrowFinish}/>:
                        (item.type === 'interrupt')? <InterruptComp name={item['id']} onStop= {this.onStop} handleArrowDrag={this.handleArrowDrag} handleArrowFinish={this.handleArrowFinish}/>: <></>
                        }
                      </>
                    ))}
                    <EndPoint onStop= {this.onStop} name={1} handleArrowFinish={this.handleArrowFinish}/> 
                    {this.state.connections.map((item) => (
                        <>
                            <Xarrow
                                start={String(item['previous'])}
                                end={String(item['next'])}
                                zIndex={1000}
                                color="rgb(100,100,100)"
                                curveness={0.5}
                                strokeWidth={3}
                            />
                        </>
                    ))}
                </div>
            </>
        )
    }
}

export default WorkflowBuilder;