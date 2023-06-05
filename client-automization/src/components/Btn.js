function BtnClass1(props){
    return(
        <button onClick={(e) => props.action(e)} className="btn Class1 green" name={props.name} disabled={(props.disabled)? true:false}>{props.text}</button>
    )
}

function BtnClass2(props){
    return(
        <button onClick={(e) => props.action(e)} className="btn Class2 green" disabled={(props.disabled)? true:false}>{props.text}</button>
    )
}

function BtnClass3(props){
    return(
        <button onClick={(e) => props.action(e)} className={(props.noUnderline)?"btn Class3 green noUnderline":"btn Class3 green"} disabled={(props.disabled)? true:false}>{props.text}</button>
    )
}

export {BtnClass1, BtnClass2, BtnClass3}