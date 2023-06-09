import React from "react";
import Draggable from 'react-draggable'
import { Icon } from '@iconify/react';
import accountIcon from '@iconify/icons-mdi/account';
import menuIcon from '@iconify/icons-mdi/menu';
import { BtnClass2, BtnClass3 } from "../components/Btn";
import AutocompleteInput from "../components/AutoCompleteInput";

class DraggableComp extends React.Component{
    constructor(props) {
        super(props);
        this.state = {
            pluginAssignment: this.props.pluginAssignment,
            assigner: false,
            referencedPluginData: this.props.relatedPlugins,
            addNewRelation: false,
            selectedRight: '',
            selectedRelation: '',
            objectID: this.props.name,
        };
    }

    filterJsonArrayByPRID(array, filter) {
        const filteredRelations = array.relations.filter(obj => obj.prid === filter);
        const output = filteredRelations.map(rel => {
            const matchingPlugin = array.plugins.find(plugin => plugin.id === rel.pid);
            return {
              id: rel.id,
              name: matchingPlugin ? matchingPlugin.name +': '+ rel.description : '',
            };
          });
        return output
    }

    handleRelAddToggle = () => {
        this.setState({
            addNewRelation: !this.state.addNewRelation
        })
    }

    handleSelectRight = (value) =>{
        this.setState({
            selectedRight: value
        })
    }

    handleSelectPlugin = (value) =>{
        this.setState({
            selectedRelation: value
        })
    }

    getPid = () => {
        const filteredPids = this.state.pluginAssignment.relations.filter(rel => rel.id === this.state.selectedRelation).map(rel => rel.pid);
        return filteredPids[0]
    }

    handleAppPluginToTask = () =>{
        let temp= this.state.referencedPluginData
        temp.push({id: temp.length, pluginID: this.getPid(), referenceID: this.state.selectedRelation})

        this.props.handleAppPluginToTask(this.state.objectID, temp)
        this.setState({
            referencedPluginData: temp,
            addNewRelation: false,
            selectedRight: '',
            selectedRelation: '',
        })
    }

    toggleAssigner = () => {
        this.setState({
            assigner: !this.state.assigner
        })
    }

    dataMapper = (pluginAssignment, referencedPluginData) => {
            const resultList = referencedPluginData.map(data => {
            try {
                const relation = pluginAssignment.relations.find(rel => rel.id === data.referenceID);
                const plugin = pluginAssignment.plugins.find(p => p.id === relation.pid);
                const programRight = pluginAssignment.programsAndRights.find(pr => pr.id === relation.prid);
            
                return {
                    id: data.id,
                    pluginName: plugin.name,
                    pluginID: plugin.id,
                    rightName: programRight.name,
                    description: relation.description
                };
            } catch {return}
        },  
        );
        
        return resultList;
    }

    render(){
        return(
            <Draggable onStop={this.props.onStop} grid={[5, 5]}>
                <div name={this.props.name} id={this.props.name} className='absPos'>
                    <div className="dragItem flexWrapper" name={this.props.name} onMouseUpCapture={(e) => this.props.handleArrowFinish(e)}>
                        <div contentEditable suppressContentEditableWarning={true} name={this.props.name} onBlur={(e) => this.props.handleTextChange(e)}>
                            {this.props.text}
                        </div>
                        <div className="spacer"/>
                        <Icon icon={menuIcon} width={24} onClick={this.toggleAssigner}/>
                    </div>
                    <ConnectionPoint name={this.props.name} handleArrowDrag={this.props.handleArrowDrag}/>
                    <Assigner 
                        assigner={this.state.assigner} 
                        mappedData={this.dataMapper(this.state.pluginAssignment, this.state.referencedPluginData)} 
                        addNewRelation={this.state.addNewRelation}
                        handleRelAddToggle={this.handleRelAddToggle}
                        programData={this.state.pluginAssignment.programsAndRights}
                        handleSelectRight={this.handleSelectRight}
                        filteredPluginData = {this.filterJsonArrayByPRID(this.state.pluginAssignment, this.state.selectedRight)}
                        selectedRight = {this.state.selectedRight}
                        selectedRelation = {this.state.selectedRelation}
                        handleSelectPlugin = {this.handleSelectPlugin}
                        handleAppPluginToTask = {this.handleAppPluginToTask}
                    />
                </div>
            </Draggable>
        )
    }
}
 
function Assigner(props){
    return(
        <div className={(props.assigner)?'relPos popUp popUpBorder visible changingBG':'relPos popUp popUpBorder'}>
            <table>
                <thead>
                    <tr>
                        <th>Anwendung</th>
                        <th>Plugin</th>
                        <th>Beschreibung</th>
                    </tr>
                </thead>
                <tbody>
                    {(props.mappedData[0])?<TableElement data={props.mappedData} />:<></>}
                    {(props.addNewRelation)?
                        <RelAdder
                            handleRelAddToggle={props.handleRelAddToggle}
                            programData = {props.programData}
                            handleSelectRight = {props.handleSelectRight}
                            selectedRight = {props.selectedRight}
                            filteredPluginData = {props.filteredPluginData}
                            handleSelectPlugin = {props.handleSelectPlugin}
                            handleAppPluginToTask = {props.handleAppPluginToTask}
                            selectedRelation = {props.selectedRelation}
                        />:
                        <BtnClass2 text="Plugin hinzufügen" action={props.handleRelAddToggle} />}
                </tbody>
            </table>
        </div>
    )
}

function RelAdder(props){
    return(
        <>
            <tr>
                <td><AutocompleteInput dataList={props.programData} onSelect={props.handleSelectRight}/></td>
                <td>{(props.selectedRight !== '')?<AutocompleteInput dataList={props.filteredPluginData} onSelect={props.handleSelectPlugin}/>:<></>}</td>
            </tr>
            <tr className="centered">
                <td>
                    <BtnClass2 text='Hinzufügen' disabled = {props.selectedRelation === '' | props.selectedRight === ''} action={props.handleAppPluginToTask} />
                    <BtnClass3 text='Abbrechen' action={props.handleRelAddToggle} />
                </td>
            </tr>
        </>
    )
}

const TableElement = ({data}) =>( 
    <>
    {data.map(data =>(
        <tr key={data['id']}>
            <td>{data['rightName']}</td>
            <td>{data['pluginName']}</td>
            <td>{data['description']}</td>
        </tr>
    ))}
    </>
)

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