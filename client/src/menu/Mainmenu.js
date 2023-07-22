import { HrefClass1, HrefClass3 } from "../components/Href"
import { getLocal, logout, setLocal } from "../helpers"
import { Icon } from '@iconify/react';
import logoutIcon from '@iconify/icons-mdi/logout';
import { BtnClass3 } from "../components/Btn";
import lightMode from '@iconify/icons-material-symbols/light-mode';
import darkMode from '@iconify/icons-material-symbols/dark-mode';
import React from "react";

function Mainmenu(){
    let perm = getLocal("userRights")
    let scheme = getLocal('preferredScheme')

    if (scheme === null){
        scheme = fillInitialScheme()
    }

    setInitialScheme(scheme.scheme)

    return(
        <>
        <a href='/'>
            <img src="/ENJineLogo.svg" className="logoContainer" alt="ENJine (ausgesprochen: Engine)"/>
        </a>
        <div className="menuBackground mainMenu">
            <div className="mainSlave">
                <HrefClass3 text="Dashboard" noUnderline={true} action='/'/>

                {(perm['sysAdmin']===1|perm["userAdmin"]===1|perm["userGlobal"]===1)?<HrefClass3 text="Nutzendenverwaltung" noUnderline={true} action='/usermgmt?s=1'/>:<></>}
                {(perm['sysAdmin']===1|perm["processAdmin"]===1|perm["processGlobal"]===1)?<HrefClass3 text="Aktive Prozesse" noUnderline={true} action='/activeprocesses'/>:<></>}
                {(perm['sysAdmin']===1|perm["processAdmin"]===1|perm["processGlobal"]===1)?<HrefClass3 text="Prozessverwaltung" noUnderline={true} action='/processmgmt'/>:<></>}
                
                {(perm['sysAdmin']===1|perm["groupAdmin"]===1|perm["groupGlobal"]===1)?<HrefClass3 text="Gruppenverwaltung" noUnderline={true} action='/groupmgmt'/>:<></>}
                {(perm['sysAdmin']===1|perm["applicationAdmin"]===1|perm["applicationGlobal"]===1)?<HrefClass3 text="Programmverwaltung" noUnderline={true} action='/programmgmt'/>:<></>}
                {(perm['sysAdmin']===1|perm["pluginAdmin"]===1)?<HrefClass3 text="Pluginkonfiguration" noUnderline={true} action='/pluginmgmt'/>:<></>}
                {(perm['sysAdmin']===1|perm["rightAdmin"]===1|perm["rightGlobal"]===1|perm["rightLocal"]===1)?<HrefClass3 text="Rechteverwaltung" noUnderline={true} action='/rightmgmt'/>:<></>}
                {(perm['sysAdmin']===1|perm["logAdmin"]===1|perm["logGlobal"]===1)?<HrefClass3 text="Logs" noUnderline={true} action='/logs'/>:<></>}
            </div>
            <LogOut/>  
        </div>
        </>
    )
}

class LogOut extends React.Component{

    constructor(){
        super();
        this.state = {
            scheme: getLocal('preferredScheme')
        }
        this.toggleDarkMode = this.toggleDarkMode.bind(this)
    }

    
    toggleDarkMode() {
        if (document.documentElement.classList.contains("light")) {
            document.documentElement.classList.remove("light")
            document.documentElement.classList.add("dark")
            setLocal('preferredScheme', {scheme: 'dark'})
            
            this.setState({
                scheme: {scheme: 'dark'}
            })
        } else if (document.documentElement.classList.contains("dark")) {
            document.documentElement.classList.remove("dark")
            document.documentElement.classList.add("light")
            setLocal('preferredScheme', {scheme: 'light'})

            this.setState({
                scheme: {scheme: 'light'}
            })
        } else {
            if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
                document.documentElement.classList.add("dark")
            } else {
                document.documentElement.classList.add("light")
            }
        }
}

    render() {
    let warn = getLocal('remainingPWTimeWarn')
    return(
        <div className="flexWrapper iconWrapper oneLine">
            <Icon icon={(this.state.scheme.scheme === 'light')?lightMode:darkMode} width={24} onClick={this.toggleDarkMode}/>
            <div className="logoutContainer href Class3 zeroTB">
                <div>
                    <Icon icon={logoutIcon} width={24}/>
                </div>
                <div className="logoutSlave">
                    <div className="logoutBG">
                        {(warn)? <HrefClass1 text="Passwort ändern" action='/pwmgmt'/>:<HrefClass3 text="Passwort ändern" noUnderline={true} action='/pwmgmt'/>}
                        <BtnClass3 text="Abmelden" noUnderline={true} action={logout}/>
                    </div>
                </div>
            </div>
        </div>
    )}
}

function setInitialScheme(scheme){
    if (scheme === 'light'){
        document.documentElement.classList.add("light")
    } else if (scheme === 'dark'){
        document.documentElement.classList.add("dark")
    }
}

function fillInitialScheme(){
    let scheme = {scheme: 'light'}
        if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches){
            scheme = {scheme: 'dark'}
        }
    setLocal('preferredScheme', scheme)
    return scheme
}

export default Mainmenu