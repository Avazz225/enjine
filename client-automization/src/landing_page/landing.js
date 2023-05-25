import { HrefClass1, HrefClass2 } from "../components/Href"

function Landing(){
    return(
        <div className="content">
            <h1 className="blue noTopSpace">Schnelle Aktionen</h1>
            <HrefClass1 text="Einen Prozess starten"/> 
            <HrefClass2 text="Aktuelle Prozesse einsehen"/>
            <br/><br/>
            <h1 className="blue">Übersicht</h1>
            Monitoring Stuff I guess
        </div>
    )
}

export default Landing