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
    fetch('http://127.0.0.1:5000/refreshPlugIns', {
            method: 'UPDATE',
            headers: {
            'Content-Type': 'application/json',
            'Auth-Header': getCookie('token')
            },
        })
        .then((response) => {
            // Check the response status
            if (response.ok) {
                return
            } else {
                throw new Error(response.status, response.json());
            }
        })
        .then(() => {
            // Handle the response
            window.location.reload()
        })
        .catch((error, data) => {
            if (error.message === '401') {
                // Unauthorized
                this.setState({serverErrorMessage: 'Unzureichende Rechte.'})
                setLocal('userRights', data['rights'])
            } else {
                // Internal server error
                window.alert('Datenbankfehler, bitte kontaktiere den zuständigen Administrierenden!')
            }
        });
}

export default Menu