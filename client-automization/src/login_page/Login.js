import React from 'react'
import BackgroundLogo from '../components/BackgroundLogo';
import { secondsToHMS, setCookie, setLocal } from '../helpers';

class Login extends React.Component {
    constructor(props) {
      super(props);
      this.state = {
        identifier: '',
        password: '',
        serverErrorMessage: '', 
        pwErrorMessage: '',
        unameErrorMessage: '',
      };
    }
  
    handleSubmit = (e) => {
      e.preventDefault();

      let token = "aTestTokenWhichContentIsIrrelevant"
      let expires = [2023,12,31,23,59,59]
      var d1 = new Date(Date.UTC(expires[0], expires[1]-1, expires[2], expires[3], expires[4], expires[5]))
      let perms = {"applicationAdmin":0,"applicationGlobal":0,"groupAdmin":0,"groupGlobal":0,"logAdmin":0,"logGlobal":0,"pluginAdmin":0,"pluginGlobal":0,"processAdmin":0,"processGlobal":0,"rightAdmin":0,"rightGlobal":0,"rightLocal":0,"sysAdmin":1,"userAdmin":0,"userGlobal":0}

      // set a cookie containing the auth token and permissions in the local storage
      setCookie(token, d1);
      setLocal("userRights", perms);
      
      //reload the site
      window.location.reload()
        
    };
  
    handleChange = (e) => {
      this.setState({ [e.target.name]: e.target.value });
    };
  
    render() {
      const { identifier, password } = this.state;
  
      return (
        <div className='centered heightCenter'>
            <BackgroundLogo/>
            <div className='cardUnderlay'>
              <div className='glassyCard'>
                  <center>
                  <h1 className='blue noTopSpace'>Einloggen</h1>
                  <form onSubmit={this.handleSubmit} className='centered'>
                      <div className='left'>
                          <label htmlFor="identifier" className={(this.state.unameErrorMessage !== '')? 'error': ''}>Anmeldename:</label><br/>
                          <input
                          className={(this.state.unameErrorMessage !== '')? 'error': ''}
                          type="text"
                          id="identifier"
                          name="identifier"
                          value={identifier}
                          onChange={this.handleChange}
                          autoComplete='username'
                          /><br/>
                          
                      </div>
                      <span className='error'>{this.state.unameErrorMessage}</span>
                      <div className='left'>
                          <label htmlFor="password" className={(this.state.pwErrorMessage !== '')? 'error': ''}>Passwort:</label><br/>
                          <input
                          className={(this.state.pwErrorMessage !== '')? 'error': ''}
                          type="password"
                          id="password"
                          name="password"
                          value={password}
                          onChange={this.handleChange}
                          autoComplete='current-password'
                          />
                      </div>
                      <span className='error'>{this.state.pwErrorMessage}</span><br/>
                      <center>
                          <button type="submit" className='btn Class1'>Login</button>
                          <br/>
                          Das ist ein Dummy! Hier reicht ein Klick auf Login aus, um zum Programm zu gelangen.
                        <span className='error'>{this.state.serverErrorMessage}</span>
                      </center> 
                  </form>
                  </center>
              </div>
            </div>
        </div>
      );
    }
  }

export default Login