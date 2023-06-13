import { HrefClass1, HrefClass2 } from "../components/Href"

function Landing(){
    return(
        <div className="content">
            <h1 className="blue noTopSpace">Schnelle Aktionen</h1>
            <HrefClass1 text="On-/Offboarding" action='/usermgmt'/> 
            <HrefClass2 text="Aktuelle Prozesse einsehen" action='/activeprocesses'/>
            <HrefClass2 text="Logdateien einsehen" action='/logs'/>
            <br/><br/>
            <h1 className="blue">Übersicht</h1>
            Hier können detaillierte Informationen stehen.<br/>
            Diese können beispielsweise die Gesamtanzahl der aktuellen Prozesse oder die mittlere Durchlaufzeit der Prozesse in einem bestimmten Zeitraum sein.<br/>
            Der Kreativität sind hier kaum Grenzen gesetzt.
        </div>
    )
}

export default Landing