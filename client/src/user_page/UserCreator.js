import React from "react";
import { BtnClass1 } from "../components/Btn";
import { HrefClass3 } from "../components/Href";
import { getCookie, setLocal } from "../helpers";
import { Icon } from '@iconify/react';
import informationIcon from '@iconify/icons-mdi/information';

function CustomProps(props){
    return(
        <>
        {Object.keys(props.specific_properties).map((item) => (
                <tr>
                    <td>
                        <label htmlFor={item} >{item}:</label> 
                    </td>
                    <td className="centered">
                        <input 
                            value={props.specific_properties[item]}
                            name={item}
                            onChange={(e) => props.handleChange(e)}
                        />
                    </td>
                </tr>
            ))}
        </>
    )
}

function Infobox(){
    return(
        <>
        <span className="infoIcon"><Icon icon={informationIcon} /></span>
        <div className="helpText">
            Aktiv = Der User kann sich anmelden und mit dem Programm interagieren.<br/>
            Passiv = Der User dient nur als Objekt für Prozesse, eine Anmeldung ist nicht möglich.<br/><br/>
            Der Accounttyp kann nach Bedarf geändert werden.
        </div>
        </>
    )
}

class UserCreator extends React.Component{
    constructor(props) {
        super(props);
        this.state = {
            identifier: '',
            specific_properties: {},
            ident_error: '',
            res: false,
            passive: false,
            serverErrorMessage: '',
        };
        this.handleChange = this.handleChange.bind(this);
        this.handleCustomPropChange = this.handleCustomPropChange.bind(this)
        this.createNewAccount = this.createNewAccount.bind(this)
        this.createUser = this.createUser.bind(this)
        this.createUserWRole = this.createUserWRole.bind(this)
        this.togglePassive = this.togglePassive.bind(this)
    }

    async componentDidMount(){
        await fetch('http://127.0.0.1:5000/accountProperties', {
            method: 'GET',
            headers: {
            'Content-Type': 'application/json',
            'Auth-Header': getCookie('token')
            },
        })
        .then((response) => {
            // Check the response status
            if (response.ok) {
                return response.json();
            } else {
                throw new Error(response.status, response.json());
            }
        })
        .then((data) => {
            // Handle the response
            let temp = {}

            for (var i = 0; i < data['default_properties'].length; i++) {
                temp[data['default_properties'][i]] = "";
            }

            this.setState({
                specific_properties: temp,
                res: true,
            })
        })
        .catch((error, data) => {
            if (error.message === '401') {
                // Unauthorized
                this.setState({serverErrorMessage: 'Unzureichende Rechte.'})
                setLocal('userRights', data['rights'])
            } else {
                // Internal server error
                this.setState({serverErrorMessage: 'Datenbankfehler, bitte kontaktiere den zuständigen Administrierenden!'})
            }
        });
    }

    createUser(){
        this.createNewAccount(false)
    }

    createUserWRole(){
        this.createNewAccount(true)
    }

    createNewAccount(withRights){
        if (this.state.identifier === ""){
            this.setState({ident_error: 'Nutzername darf nicht leer sein.'}) 
            return
        } else {
            this.setState({ident_error: ''}) 
        }

        fetch('http://127.0.0.1:5000/newAccount', {
            method: 'PUT',
            headers: {
            'Content-Type': 'application/json',
            'Auth-Header': getCookie('token')
            },
            body: JSON.stringify({
                    passive: this.state.passive,
                    identifier: this.state.identifier,
                    specific_properties: this.state.specific_properties,
                })
        })
        .then((response) => {
            // Check the response status
            if (response.ok) {
                return response.json();
            } else {
                throw new Error(response.status, response.json());
            }
        })
        .then((data) => {
                if(this.state.passive){window.alert("Das Passwort für den neuen Nutzenden ist:\n"+data['password']+"\n\nAchtung: Das Passwort kann nur jetzt angezeigt werden!")}
                if(withRights){
                    window.location.replace('/groupModify?u='+data['userID'])
                } else {
                    window.location.replace('/usermgmt?s=1')
                }
            }
        )
        .catch((error, data) => {
            if (error.message === '401') {
                // Unauthorized
                this.setState({serverErrorMessage: 'Unzureichende Rechte.'})
                setLocal('userRights', data['rights'])
            } else if (error.message === '500') {
                // Error
                this.setState({ident_error: 'Anmeldename existiert bereits!'})
            } else {
                // Internal server error
                this.setState({serverErrorMessage: 'Datenbankfehler, bitte kontaktiere den zuständigen Administrierenden!'})
            }
        });
    }

    handleChange(e){
        this.setState({
            [e.target.name]: e.target.value,
        })
    }

    handleCustomPropChange(e){
        let temp = this.state.specific_properties
        temp[e.target.name] = e.target.value
        this.setState({
            specific_properties: temp,
        })
    }

    togglePassive(){
        this.setState({
            passive: !this.state.passive
        })
    }

    render(){
        return(
            <div className="content">
                <h1 className="blue noTopSpace">Neuen Nutzenden anlegen</h1>

                <center>
                    <table>
                        <thead>
                            <tr>
                                <th>
                                <label htmlFor="identifier" className={(this.state.ident_error !== '')? 'error': ''}>Anmeldename:</label>
                                </th>
                                <th>
                                    <input 
                                        value={this.state.identifier}
                                        name='identifier'
                                        onChange={(e) => this.handleChange(e)}
                                    />
                                    <br/>
                                    <span className="error">{this.state.ident_error}</span>
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td>
                                    Aktiver Account <Infobox/>
                                </td> 
                                <td>
                                    <label class="switch">
                                        <input type="checkbox" checked={this.state.passive} onClick={(e) => this.togglePassive()}/>
                                        <span class="slider round"/>
                                    </label>    
                                </td> 
                            <td><br/></td></tr>
                            {(this.state.res)?<CustomProps specific_properties={this.state.specific_properties} handleChange={this.handleCustomPropChange} />: <></>}
                        </tbody>
                    
                    </table><br/>
                </center>

                <div className="centered">
                    <div className="flexWrapper">
                        <BtnClass1 text="Nutzenden anlegen" action={this.createUser} />
                        <BtnClass1 text="Nutzenden anlegen und Rollen zuweisen" action={this.createUserWRole}/>
                    </div>
                    <HrefClass3 text="Nutzenden nicht anlegen" action="/usermgmt?s=1"/><br/>
                    <span className="error">{this.state.serverErrorMessage}</span>
                </div>
                
            </div>
        )
    }
}

export default UserCreator