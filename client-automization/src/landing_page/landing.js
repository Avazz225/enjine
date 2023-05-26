import { HrefClass1, HrefClass2 } from "../components/Href"

function Landing(){
    return(
        <div className="content">
            <h1 className="blue noTopSpace">Schnelle Aktionen</h1>
            <HrefClass1 text="On-/Offboarding"/> 
            <HrefClass2 text="Aktuelle Prozesse einsehen"/>
            <HrefClass2 text="Logdateien einsehen"/>
            <br/><br/>
            <h1 className="blue">Übersicht</h1>
            Monitoring Stuff I guess @Maxim Schmaxim
        </div>
    )
}

export default Landing