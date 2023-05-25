function BtnClass1(props){
    return(
        <button onClick={() => props.action()} className="btn Class1 green">{props.text}</button>
    )
}

function BtnClass2(props){
    return(
        <button onClick={() => props.action()} className="btn Class2 green">{props.text}</button>
    )
}

function BtnClass3(props){
    return(
        <button onClick={() => props.action()} className="btn Class3 green">{props.text}</button>
    )
}

export {BtnClass1, BtnClass2, BtnClass3}