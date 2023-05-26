import { HrefClass1 } from "../components/Href"
import BackgroundLogo from "../components/BackgroundLogo"

function NotFound(){
    return(
        <div className='flexWrapper heightCenter widthMax'>
            <BackgroundLogo/>
            <div className="centered">
                <h1 className="blue">Die angeforderte Seite wurde nicht gefunden</h1>
                Bitte kehre zum Dashboard zurück.<br/><br/>
                <HrefClass1 text="Zum Dashboard" noUnderline={true} action='/'/>
            </div>
        </div>
    )
}

export default NotFound