import { HrefClass1 } from "../components/Href"
import BackgroundLogo from "../components/BackgroundLogo"

function NotFound(){
    return(
        <div className='centered heightCenter content widthMax'>
            <BackgroundLogo/>
            <div className="centered">
                <h1 className="blue noTopSpace">Es tut uns leid, aber die gesuchte Seite existiert noch nicht.</h1>
                <h2>Die Seite wurde noch nicht gebaut, wird aber bis zum Produktivstatus ergänzt.</h2>
                Bitte klicke unten, um zum Dashboard zurückzukehren.<br/><br/>
                <HrefClass1 text="Zum Dashboard" noUnderline={true} action='/'/><br/><br/>
                
            </div>
        </div>
    )
}

export default NotFound