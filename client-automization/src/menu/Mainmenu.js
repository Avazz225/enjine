import { HrefClass3 } from "../components/Href"

function Mainmenu(){
    return(
        <div className="menuBackground mainMenu">
            <HrefClass3 text="Startseite" noUnderline={true}/>
            <HrefClass3 text="Prozesse" noUnderline={true}/>
            <HrefClass3 text="Prozessmodellierung" noUnderline={true}/>
            <HrefClass3 text="Aktive Prozesse" noUnderline={true}/>
            <HrefClass3 text="Nutzer" noUnderline={true}/>
            <HrefClass3 text="Logs" noUnderline={true}/>
        </div>
    )
}

export default Mainmenu