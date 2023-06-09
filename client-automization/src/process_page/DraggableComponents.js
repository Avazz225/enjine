import React from "react";
import Draggable from 'react-draggable'
import { Icon } from '@iconify/react';
import accountIcon from '@iconify/icons-mdi/account';
import menuIcon from '@iconify/icons-mdi/menu';

function DraggableComp(props){
    return(
        <Draggable onStop={props.onStop} grid={[5, 5]}>
            <div name={props.name} id={props.name} className='absPos'>
                <div className="dragItem flexWrapper">
                    <div name={props.name} onMouseUpCapture={(e) => props.handleArrowFinish(e)} contentEditable onInput={(e) => props.handleTextChange(e)}>
                        {props.text}
                    </div>
                    <div className="spacer"/>
                    <Icon icon={menuIcon} width={24}/>
                </div>
                <ConnectionPoint name={props.name} handleArrowDrag={props.handleArrowDrag}/>
            </div>
        </Draggable>
    )
}
 
function StartPoint(props){
    return(
        <Draggable onStop={props.onStop} grid={[5, 5]}>
            <div name={props.name} id={props.name} className='DragRound start'><ConnectionPoint name={props.name} handleArrowDrag={props.handleArrowDrag}/></div>
        </Draggable>
    )
}

function EndPoint(props){
    return(
        <Draggable name={props.name} onStop={props.onStop} grid={[5, 5]}>
            <div name={props.name} id={props.name} onMouseUpCapture={(e) => props.handleArrowFinish(e)} className='DragRound end'></div>
        </Draggable>
    )
}

function InterruptComp(props){
    return(
        <Draggable onStop={props.onStop} grid={[5, 5]}>
            <div name={props.name} id={props.name} className='dragItemWrapper'>
                <div name={props.name} id={props.name} onMouseUpCapture={(e) => props.handleArrowFinish(e)} className='DragRound'>
                    <Icon icon={accountIcon} width={26} name={props.name} id={props.name} onMouseUpCapture={(e) => props.handleArrowFinish(e)}/>
                </div>
                <ConnectionPoint name={props.name} handleArrowDrag={props.handleArrowDrag}/>
            </div>
        </Draggable>
    )
}

function DecisionComp(props){
    /*Decides which path to take, only one.*/
    return(
        <Draggable onStop={props.onStop} grid={[5, 5]}>
            <div name={props.name} className='dragItemWrapper' >
                <div className='dragItem diamond' id={props.name} ><PlusSign name={props.name} handleArrowFinish={props.handleArrowFinish} /><ConnectionPoint name={props.name} handleArrowDrag={props.handleArrowDrag}/></div>
            </div>
        </Draggable>
    )
}

function DecisionUniterComp(props){
    /*Waits for any input to be present before continue and executes all following tasks*/
    return(
        <Draggable onStop={props.onStop} grid={[5, 5]}>
            <div name={props.name} className='dragItemWrapper'>
                <div className='dragItem diamond' id={props.name} ><PlusSign name={props.name} rotated={true} handleArrowFinish={props.handleArrowFinish} /><ConnectionPoint name={props.name} handleArrowDrag={props.handleArrowDrag} /></div>
            </div>
        </Draggable>
    )
}

function PlusSign(props){
    return(
        <div className={(props.rotated)?'plusWrapper normalPlus':'plusWrapper'} name={props.name} onMouseUpCapture={(e) => props.handleArrowFinish(e)}>
            <div className='plusStroke'/>
            <div className='plusStroke'/>
        </div>
    )
}

function ConnectionPoint (props) { 
    return (
        <div className='connectionPoint' name={props.name} onMouseDown={(e) => props.handleArrowDrag(e)}/>  
    )
}

export {DraggableComp, StartPoint, EndPoint, DecisionComp, DecisionUniterComp, InterruptComp}