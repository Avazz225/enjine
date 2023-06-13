import React from 'react'
import { setLocal, getCookie } from '../helpers';
import { Icon } from '@iconify/react';
import lockReset from '@iconify/icons-mdi/lock-reset';
import accountDetails from '@iconify/icons-mdi/account-details';
import Pagy from '../components/Pagy';
import { BtnClass2, BtnClass3 } from '../components/Btn';
import informationIcon from '@iconify/icons-mdi/information';

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

function ResetPwd(props) {
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
                    <></>
                }
                {(false)?<a className='href Class3 zeroTB' target='blank' href={'/accountDetails?aid='+props.data['id']}>
                    <div className="iconWrapper">
                        <Icon icon={accountDetails} width={24}/>
                    </div>
                </a>: <></>}
            </div>
        </td>
    )
}

const TableElement = ({data, togglePopUpVisiblility}) =>( 
    <>
    {data.map(data =>(
        <tr key={data['id']}>
            <td>{data['id']}</td>
            <td>{data['identifier']}</td>
            <td>{(data['active_account'] === 1)?'Aktiv':'Passiv'}</td>
            <ResetPwd data={data} togglePopUpVisiblility={togglePopUpVisiblility} />
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
          popUpVisible: false
        };

        this.forcePwdReset = this.forcePwdReset.bind(this)
        this.getItems = this.getItems.bind(this)
        this.setPage = this.setPage.bind(this)
        this.togglePopUpVisiblility = this.togglePopUpVisiblility.bind(this)
    }

    // Send the GET request to the backend after mount of component
    async componentDidMount(){
        await this.getItems(this.state.currentPage)
    }

    async forcePwdReset(){
        
    }

    async getItems(page){
        let data = {'res': [
                        {'id': 1, 'active_account': 1, 'identifier': 'Beispielnutzer1'}, 
                        {'id': 2, 'active_account': 1, 'identifier': 'Beispielnutzer2'}, 
                        {'id': 8, 'active_account': 0, 'identifier': 'Beispielnutzer3'}, 
                        {'id': 9, 'active_account': 1, 'identifier': 'testadmin'}], 
                        
                    'total': 3}
        // Handle the response
        this.setState({
            userData: data['res'],
            total: data['total']
        })
    
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
    

    render(){
        if (this.state.total === 0) return 
        return(
            <div className="content">
                <ConfirmationPopUp forcePwdReset={this.forcePwdReset} ident={this.state.selectedUser} togglePopUpVisiblility={this.togglePopUpVisiblility} popUpVisible={this.state.popUpVisible} />
                <h1 className='blue noTopSpace'>Nutzerverwaltung</h1>
                <div className='centered'>
                    <Pagy currentPage={this.state.currentPage} elementCount={this.state.total} elementPerPage={this.state.elementsPerPage} setPage={this.setPage} />
                    <table>
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Anmeldename</th>
                                <th>Accounttyp</th>
                                <th>Optionen</th>
                            </tr>
                        </thead>
                        <tbody>
                            <TableElement data={this.state.userData} togglePopUpVisiblility={this.togglePopUpVisiblility}/>
                        </tbody>
                    </table>
                </div>
            </div>
        )
    }
}

export default UserTable