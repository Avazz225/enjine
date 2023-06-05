import React from "react";
import './Pagy.css';

//starting function
function Pagy(props){
    /* params:
        currentPage
        elementCount    
        elementPerPage
        setPage
    */
    return(
        <Pagination params={props} />
    )
}

//site componnets
const PageMapper = ({length, currentPage, setPage}) => (
    <>
    {[...Array(length)].map((e,i) =>
        <>
        {((i+1===currentPage||Math.abs((i+1)-currentPage)===1||i+2===2 || i===length)&& i!==0)?<div key={i+1}><PageSelector number={i+1} setPage={setPage} currentPage={currentPage}/></div>:''}
        {((i+1===currentPage-2 && i+1!==2 ) || (i === 1 && currentPage===4) || (i+1===currentPage+2 && i+1!==length))?<div key={i+1}><PageSelector number={'...'} setPage={setPage} currentPage={'0'}/></div>:''}
        </>
    )}
    </>
)

function Arrow(props){
    return(
        <div className="selectorItem" onClick={() => props.shiftPage(props.direction)}>
            {(props.direction === 'left')?'<':'>'}
        </div>
    )
}

function PageSelector(props){
    return(
        <div className={(Number(props.currentPage) === Number(props.number))?'selectorItem selectorCurrent':'selectorItem'} onClick={() => props.setPage(props.number)}>
            {props.number}
        </div>
    )
}

//class definitions
class Pagination extends React.Component{
    constructor(props){
        super();
        this.state = {
            currentPage: props.params.currentPage,
            elementCount: props.params.elementCount,
            elementPerPage: props.params.elementPerPage,
            pageCount: 0,
        }
        this.alterPage = this.alterPage.bind(this)
        this.shiftPage = this.shiftPage.bind(this)
    }

    alterPage(number){
        if(Number(number) !== Number(this.state.currentPage)) this.props.params.setPage(number)

        this.setState({
            currentPage: Number(number),
        })
    }

    componentDidMount(){
        this.setState({
            pageCount: Math.floor((Number(this.state.elementCount)-1)/Number(this.state.elementPerPage))+1,
        })
    }

    shiftPage(direction){
        if(direction === 'left' && this.state.currentPage != 1){ 
            this.alterPage(Number(this.state.currentPage)-1)
        } else if(direction === 'right' && this.state.currentPage != this.state.pageCount){
            this.alterPage(Number(this.state.currentPage)+1)
        }
    }

    render(){
        if (this.state.pageCount === 0) return
        return(   
            <div className="paginationWrapper">
                <div className="paginationContainer">
                    <Arrow direction={'left'} shiftPage={this.shiftPage}/>
                    {(this.state.currentPage <= 2)?<PageSelector number={'1'} setPage={this.alterPage} currentPage={this.state.currentPage}/>:<></>}
                    {(this.state.pageCount>2)?<PageMapper length={this.state.pageCount} currentPage={this.state.currentPage} setPage={this.alterPage} />:''}
                    
                    <Arrow direction={'right'} shiftPage={this.shiftPage}/>
                </div>
            </div>
        )
    }
}

export default Pagy