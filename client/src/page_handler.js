import React from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import Landing from "./landing_page/landing";
import Mainmenu from "./menu/Mainmenu";
import Menu from "./menu/Sidemenu";
import Login from './login_page/Login';
import NotFound from './not_found/NotFound';
import PWChanger from './pw_change_page/PWChanger';
import { getCookie } from './helpers';
import UserTable from './user_page/UserOverv';
import PlugInMgmt from './plugins/PluginPage';
import GroupManager from './group_page/GroupMgmt';
import AppManagement from './application_page/AppManagement';
import ProcessPage from './process_page/ProcessPage';

function PageHandler(){
    let x = getCookie('token')
    return(
        <>
        {(x==='')?<NotLoggedIn/>:<LoggedIn/>}
        </>
    )
}

function LoggedIn(){
    return(
        <>
        <Mainmenu/>
        <div className="pageStructure widthMax">
            <Menu/>
            <BrowserRouter>
                <Routes>
                    <Route path='/' element={<Landing />} />
                    <Route path='/groupmgmt' element={<GroupManager />} />
                    <Route path='/pluginmgmt' element={<PlugInMgmt />} />
                    <Route path='/processmgmt' element={<ProcessPage />} />
                    <Route path='/programmgmt' element={<AppManagement />} />
                    <Route path='/pwmgmt' element={<PWChanger />} />
                    <Route path='/usermgmt' element={<UserTable />} />
                    <Route path='/*' element={<NotFound />} />
                </Routes>
            </BrowserRouter>
        </div>
        </>
    )
}

function NotLoggedIn(){
    return(
        <Login/>
    )
}

export default PageHandler