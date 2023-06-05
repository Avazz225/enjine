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
  
      const { identifier, password } = this.state;
  
      // Create an object with the user's credentials
      const credentials = {
        identifier: identifier,
        password: password
      };
  
      // Send the POST request to the backend
      fetch('http://127.0.0.1:5000/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(credentials)
      })
      .then((response) => {
        // Check the response status
        if (response.ok) {
          return response.json();
        } else {
          throw new Error(response.status);
        }
      })
        .then((data) => {
          // Handle the response

          let token = data['token']['str']
          let expires = data['token']['valid_until']
          var d1 = new Date(Date.UTC(expires[0], expires[1]-1, expires[2], expires[3], expires[4], expires[5]))
          let perms = data['permissions']
          let remTime = data['remainingPwTime']

          // set a cookie containing the auth token and permissions in the local storage
          setCookie(token, d1);
          setLocal("userRights", perms);
          

          if (remTime['days']<14){
            let hms = secondsToHMS(remTime['seconds'])
            window.alert('Bitte ändere dein Passwort! Dein aktuelles ist nur noch '+remTime['days']+' Tag(e) und '+hms['h'] +' Stunde(n) '+ hms['m'] +' Minute(n) '+ hms['s'] +' Sekunde(n) gültig.' )
            setLocal('remainingPWTimeWarn', true)
          } else {
            setLocal('remainingPWTimeWarn', false)
          }

          //reload the site
          window.location.reload()
        })
        .catch((error) => {
            if (error.message === '401') {
                // Unauthorized
                this.setState({pwErrorMessage: 'Das eingegebene Passwort ist falsch.', unameErrorMessage: '', serverErrorMessage: ''})
              } else if (error.message === '404') {
                // Not found
                this.setState({unameErrorMessage: 'Der eingegebene Anmeldename konnte nicht gefunden werden.', pwErrorMessage: '', serverErrorMessage: ''})
              } else if (error.message === '403') {
                // Forbidden (Password expired)
                this.setState({serverErrorMessage: 'Das Passwort ist abgelaufen, bitte lass es zurücksetzen.', unameErrorMessage: '', pwErrorMessage: ''})
              } else {
                // Internal server error
                this.setState({serverErrorMessage: 'Datenbankfehler, bitte kontaktiere den zuständigen Administrierenden!', unameErrorMessage: '', pwErrorMessage: ''})
              }
        });
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