import React from 'react'
import { setLocal, getCookie, timeout } from '../helpers';
import { Icon } from '@iconify/react';
import lockReset from '@iconify/icons-mdi/lock-reset';
import accountDetails from '@iconify/icons-mdi/account-details';
import Pagy from '../components/Pagy';
import { BtnClass2, BtnClass3 } from '../components/Btn';
import informationIcon from '@iconify/icons-mdi/information';
import accountGroup from '@iconify/icons-mdi/account-group';
import UserDetails from './UserDetails';

function ConfirmationPopUp(props){
    return(
        <div className={(props.popUpVisible)?'popUp centered heightCenter visible':'popUp centered heightCenter'}>
            Passwort für {props.ident} wirklich zurücksetzen?<br/><br/>
            <BtnClass2 text='Ja, zurücksetzen' action={props.forcePwdReset}/>
            <BtnClass3 text='Nein, nicht zurücksetzen' action={props.togglePopUpVisiblility}/>
        </div>
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

function BtnSet(props) {
    return(
        <td>
            <div className='flexWrapper horCenter'>
                {(props.data['active_account'] === 1)? 
                    <button className='btn Class3 zeroTB' onClick={() => props.togglePopUpVisiblility(props.data['id'], props.data['identifier'])}>
                        <div className="iconWrapper">
                            <Icon icon={lockReset} width={24}/>
                        </div>
                    </button>
                    : 
                    <div className='btn Class3 zeroTB disabled'>
                        <div className="iconWrapper">
                            <Icon icon={lockReset} width={24}/>
                        </div>
                    </div>
                }
                <button className='href Class3 zeroTB' target='blank' onClick={() => props.toggleSidePopUp(props.data['id'])}>
                    <div className="iconWrapper">
                        <Icon icon={accountDetails} width={24}/>
                    </div>
                </button>
                <a className='href Class3 zeroTB' href={'/groupModify?u='+props.data['id']}>
                    <div className="iconWrapper">
                        <Icon icon={accountGroup} width={24}/>
                    </div>
                </a>
            </div>
        </td>
    )
}

const TableElement = ({data, togglePopUpVisiblility, toggleSidePopUp}) =>( 
    <>
    {data.map(data =>(
        <tr key={data['id']}>
            <td>{data['id']}</td>
            <td>{data['identifier']}</td>
            <td>{(data['active_account'] === 1)?'Aktiv':'Passiv'}</td>
            <BtnSet data={data} togglePopUpVisiblility={togglePopUpVisiblility} toggleSidePopUp={toggleSidePopUp} />
        </tr>
    ))}
    </>
)


class UserTable extends React.Component{
    constructor(props) {
        super(props);
        this.state = {
          userData: [{id: '0', identifier: '___', active_account: 1}],
          serverErrorMessage: '',
          total: 0,
          currentPage: new URLSearchParams(window.location.search).get('s'),
          elementsPerPage: 30,
          selectedID: 0,
          selectedUser: '',
          popUpVisible: false,
          targetID: 0,
          sidePopUp: false,
          renderSide: false,
        };

        this.forcePwdReset = this.forcePwdReset.bind(this)
        this.getItems = this.getItems.bind(this)
        this.setPage = this.setPage.bind(this)
        this.togglePopUpVisiblility = this.togglePopUpVisiblility.bind(this)
        this.toggleSidePopUp = this.toggleSidePopUp.bind(this)
    }

    // Send the GET request to the backend after mount of component
    async componentDidMount(){
        await this.getItems(this.state.currentPage)
    }

    async forcePwdReset(){
        // Create an object with the required data
        const credentials = {
            id: this.state.selectedID,
            admReset: 'true'
        };
    
        // Send the POST request to the backend
        fetch('http://127.0.0.1:5000/changepw', {
            method: 'UPDATE',
            headers: {
                'Content-Type': 'application/json',
                'Auth-Header': getCookie('token')
                },
                body: JSON.stringify(credentials)
            })
            .then((response) => {
                    // Check the response status
                    if (response.ok) {
                        return response.json();
                    } else {
                        throw new Error(response.status, response.json());
                    }
                }
            )
            .then((data) => {
                // Display information
                    window.alert("Passwort erfolgreich zurückgesetzt! Das neue temporäre Passwort ist: "+data['password'])
                    this.togglePopUpVisiblility()
                }
            )
            .catch((error, data) => {
                if (error.message === '401') {
                    // Insufficient rights
                    setLocal('userRights', data['rights'])
                } else {
                    // Internal server error
                    window.alert('Datenbankfehler, bitte kontaktiere den zuständigen Administrierenden!');
                }
            }
        );
    }

    async getItems(page){
        await fetch('http://127.0.0.1:5000/getUsers', {
            method: 'POST',
            headers: {
            'Content-Type': 'application/json',
            'Auth-Header': getCookie('token')
            },
            body: JSON.stringify({rowCount:this.state.elementsPerPage, start:(0 + ((parseInt(page)-1) * this.state.elementsPerPage))})
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
            this.setState({
                userData: data['res'],
                total: data['total']
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

    async setPage(number){
        await this.getItems(number)
        this.setState({
            currentPage: number,
        })
        let stateObj = { id: "100" };
        window.history.replaceState(stateObj,'ENJine','/usermgmt?s='+number)
    }

    togglePopUpVisiblility(selectedID=0, selectedUser=''){
        this.setState({
            selectedID: selectedID,
            selectedUser: selectedUser,
            popUpVisible: !this.state.popUpVisible
        })
    }

    async toggleSidePopUp(id){
        let oldState = this.state.sidePopUp

        if (!oldState){
            this.setState({
                renderSide: true,
                targetID: id,
            })
            await timeout(0)
        }

        this.setState({
            sidePopUp: !oldState,
        })

        if (oldState){
            await timeout(500)
            this.setState({
                renderSide: false,
            })
        }
    }

    render(){
        if (this.state.total === 0) return 
        return(
            <div className="content">
                <ConfirmationPopUp forcePwdReset={this.forcePwdReset} ident={this.state.selectedUser} togglePopUpVisiblility={this.togglePopUpVisiblility} popUpVisible={this.state.popUpVisible} />
                <h1 className='blue noTopSpace'>Nutzendenverwaltung</h1>
                <div className='centered'>
                    <Pagy currentPage={this.state.currentPage} elementCount={this.state.total} elementPerPage={this.state.elementsPerPage} setPage={this.setPage} />
                    <table>
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Anmeldename</th>
                                <th>Accounttyp <Infobox/></th>
                                <th>Optionen</th>
                            </tr>
                        </thead>
                        <tbody>
                            <TableElement 
                                data={this.state.userData} 
                                togglePopUpVisiblility={this.togglePopUpVisiblility}
                                toggleSidePopUp = {this.toggleSidePopUp}
                            />
                        </tbody>
                    </table>
                </div>
                {(this.state.renderSide)?<UserDetails configVisible={this.state.sidePopUp} targetID={this.state.targetID} />:<></>}
            </div>
        )
    }
}

export default UserTable