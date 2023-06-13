import { BtnClass3 } from "../components/Btn"
import { getCookie, setLocal } from "../helpers"

function Menu(){
    let fullUrl = window.location.href
    let loc = fullUrl.slice(fullUrl.lastIndexOf('/'))
    return(
        <div className="menuBackground sideMenu">
            <center>
                Aktionen
            </center>
            {(loc === '/pluginmgmt')?<BtnClass3 text='Neue Plugins suchen' action={refreshPlugInLib} />: <></>}
        </div>
    )
}

function refreshPlugInLib(){
    
}

export default Menu