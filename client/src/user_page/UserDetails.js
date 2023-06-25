import React from "react";
import { getCookie, setLocal } from "../helpers";
import { BtnClass2 } from "../components/Btn";

class UserDetails extends React.Component{
    constructor(props) {
        super(props);
        this.state = {
            targetID: props.targetID,
            customProps: [],
            userConfig: {},
            res: false,
            serverErrorMessage: '',
        };
        
    }

    async componentDidMount(){
        await fetch('http://127.0.0.1:5000/getUserProps?user='+this.state.targetID, {
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
            let temp = data['userConfig']

            if (temp['specific_properties'] === null){
                temp['specific_properties'] = {}
            }

            data['customProps'].forEach(key => {
                if (!temp['specific_properties'].hasOwnProperty(key)) {
                    temp['specific_properties'][key] = '';
                }
            });

            this.setState({
                customProps: data['customProps'],
                userConfig: temp,
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

    handlePropChange = (value, key) => {
        let temp = this.state.userConfig

        temp['specific_properties'][key] = value
        console.log(temp)
        this.setState({
            userConfig: temp
        })
    } 

    saveCustomProps = () => {
        fetch('http://127.0.0.1:5000/updateUserProps', {
            method: 'UPDATE',
            headers: {
            'Content-Type': 'application/json',
            'Auth-Header': getCookie('token')
            },
            body: JSON.stringify({id: this.state.targetID, props: this.state.userConfig})
        })

        .then((response) => {
            // Check the response status
            if (response.ok) {
                return
            } else {
                throw new Error(response.status, response.json());
            }
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

    render(){
        if (this.props.userConfig) {this.getUserConfig()}
        return(
            <div className='absPos right'>
                <div className='accordeonWrapper'>
                    <div className={(this.props.configVisible)?"accordeonElem content visible":"accordeonElem content user"}>
                        <div className='content'>
                            <span className="error">{this.state.serverErrorMessage} </span>
                            <h2 className='oneLine noTopSpace'>Nutzer: {this.state.userConfig.identifier}</h2>
                            Nutzer-ID: {this.state.targetID}<br/><br/>
                            {(this.state.res)?<CustomProps customProps={this.state.customProps} userConfig={this.state.userConfig} handleChange={this.handlePropChange} />: <></>}
                            <BtnClass2 action={this.saveCustomProps} text='Änderungen speichern'/>
                        </div>
                    </div>
                </div>
            </div>
        )
    }
}

function CustomProps(props){
    return(
        <>
        {props.customProps.map((item) => (
                <>
                    {item}:<br/>
                    <input 
                        value={props.userConfig.specific_properties[item]}
                        onChange={(e) => props.handleChange(e.target.value, item)}
                    /><br/><br/>
                </>
            ))}
        </>
    )
}

export default UserDetails