function HrefClass1(props){
    return(
        <a href={props.action} className="href Class1 green">{props.text}</a>
    )
}

function HrefClass2(props){
    return(
        <a href={props.action} className="href Class2 green">{props.text}</a>
    )
}

function HrefClass3(props){
    return(
        <a href={props.action} className={(props.noUnderline)?"href Class3 green noUnderline":"href Class3 green"}>{props.text}</a>
    )
}

export {HrefClass1, HrefClass2, HrefClass3}