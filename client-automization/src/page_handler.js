import React from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import Landing from "./landing_page/landing";
import Mainmenu from "./menu/Mainmenu";
import Menu from "./menu/Sidemenu";
import Login from './login_page/Login';
import NotFound from './not_found/NotFound';
import PWChanger from './pw_change_page/PWChanger';
import { getCookie } from './helpers';

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
                    <Route path='/pwmgmt' element={<PWChanger />} />
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