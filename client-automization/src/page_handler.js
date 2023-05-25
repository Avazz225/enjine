import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter, Route, Routes } from 'react-router-dom';

import Landing from "./landing_page/landing";
import Mainmenu from "./menu/Mainmenu";
import Menu from "./menu/Sidemenu";
import Login from './login_page/Login';

function PageHandler(){
    return(
        <NotLoggedIn/>
    )
}

function LoggedIn(){
    return(
        <>
        <Mainmenu/>
        <div className="pageStructure">
            <Menu/>
            <BrowserRouter>
                <Routes>
                    <Route path='/' element={<Landing />} />
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