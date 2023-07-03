import { HrefClass1 } from "../components/Href"
import BackgroundLogo from "../components/BackgroundLogo"

function NotFound(){
    return(
        <div className='centered heightCenter content widthMax'>
            <BackgroundLogo/>
            <div className="centered">
                <h1 className="blue noTopSpace">Es tut uns leid, aber die gesuchte Seite existiert nicht.</h1>
                Bitte klicke unten, um zum Dashboard zurückzukehren.<br/><br/>
                <HrefClass1 text="Zum Dashboard" noUnderline={true} action='/'/><br/><br/>
                Wenn die Seite existieren sollte, wende dich bitte an einen zuständigen Administrierenden.
            </div>
        </div>
    )
}

export default NotFound
