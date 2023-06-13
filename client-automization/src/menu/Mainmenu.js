import { HrefClass1, HrefClass3, HrefClass2 } from "../components/Href"
import { getLocal, logout } from "../helpers"
import { Icon } from '@iconify/react';
import logoutIcon from '@iconify/icons-mdi/logout';
import { BtnClass3 } from "../components/Btn";

function Mainmenu(){
    let perm = getLocal("userRights")
    return(
        <>
        <a href='/'>
            <img src="/ENJineLogo.svg" className="logoContainer" alt="ENJine (ausgesprochen: Engine)"/>
        </a>
        <div className="menuBackground mainMenu">
            <div className="mainSlave">
                
                {(perm['sysAdmin']===1|perm["processAdmin"]===1|perm["processGlobal"]===1)?<HrefClass3 text="Prozessverwaltung" noUnderline={true} action='/processmgmt'/>:<></>}
                {(perm['sysAdmin']===1|perm["userAdmin"]===1|perm["userGlobal"]===1)?<HrefClass3 text="Nutzerverwaltung" noUnderline={true} action='/usermgmt?s=1'/>:<></>}
                {(perm['sysAdmin']===1|perm["processAdmin"]===1|perm["processGlobal"]===1)?<HrefClass3 text="Aktive Prozesse" noUnderline={true} action='/activeprocesses'/>:<></>}
                
                {(perm['sysAdmin']===1|perm["groupAdmin"]===1|perm["groupGlobal"]===1)?<HrefClass2 text="Gruppenverwaltung" noUnderline={true} action='/groupmgmt'/>:<></>}
                {(perm['sysAdmin']===1|perm["applicationAdmin"]===1|perm["applicationGlobal"]===1)?<HrefClass3 text="Programmverwaltung" noUnderline={true} action='/programmgmt'/>:<></>}
                {(perm['sysAdmin']===1|perm["pluginAdmin"]===1)?<HrefClass3 text="Pluginkonfiguration" noUnderline={true} action='/pluginmgmt'/>:<></>}
                <HrefClass3 text="Dashboard" noUnderline={true} action='/'/>
                {(perm['sysAdmin']===1|perm["rightAdmin"]===1|perm["rightGlobal"]===1|perm["rightLocal"]===1)?<HrefClass3 text="Rechteverwaltung" noUnderline={true} action='/rightmgmt'/>:<></>}
                {(perm['sysAdmin']===1|perm["logAdmin"]===1|perm["logGlobal"]===1)?<HrefClass3 text="Logs" noUnderline={true} action='/logs'/>:<></>}
                
            </div>
            <LogOut/>  
        </div>
        </>
    )
}

function LogOut(){
    let warn = getLocal('remainingPWTimeWarn')
    return(
        <div className="logoutContainer href Class3 zeroTB">
            <div className="iconWrapper">
                <Icon icon={logoutIcon} width={24}/>
            </div>
            <div className="logoutSlave">
                <div className="logoutBG">
                    {(warn)? <HrefClass1 text="Passwort ändern" action='/pwmgmt'/>:<HrefClass3 text="Passwort ändern" noUnderline={true} action='/pwmgmt'/>}
                    <BtnClass3 text="Abmelden" noUnderline={true} action={logout}/>
                </div>
            </div>
        </div>
    )
}

export default Mainmenu