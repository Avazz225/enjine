import React from 'react'
import BackgroundLogo from '../components/BackgroundLogo';
import { logout, getCookie } from '../helpers';
class PWChanger extends React.Component {
    constructor(props) {
      super(props);
      this.state = {
        oldPW: '',
        password: '',
        password2: '',
        serverErrorMessage: '', 
        pwNotCompleteErrorMessage: '',
        pwNotMatchingErrorMessage: '',
        oldPwWrongErrorMessage: '',
      };
    }

    checkPWRequirements = (e) => {
        let val = e.target.value
        let re = /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[!@#€$€&{}§%+^=&*()_+]).{12,}$/gm;
        if ((re.exec(val) && val!=='') | val === ''){
            this.setState({pwNotCompleteErrorMessage:''})
        } else {
            this.setState({pwNotCompleteErrorMessage:'Das Passwort erfüllt nicht die Anforderungen.'})
        }
    }

    checkPWSame = () =>{
        if(this.state.password === this.state.password2){
            this.setState({pwNotMatchingErrorMessage:''})
        } else {
            this.setState({pwNotMatchingErrorMessage:'Die Passwörter stimmen nicht überein.'})
        }
    }
  
    handleSubmit = (e) => {
      e.preventDefault();
  
      const { oldPW, password } = this.state;
  
      // Create an object with the user's credentials
      const credentials = {
        oldpw: oldPW,
        newpw: password,
        admReset: 'False'
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
          throw new Error(response.status);
        }
      })
        .then(() => {
          // Display information
          window.alert("Passwort erfolgreich geändert!")

          // force logout
          logout()
          window.location.reload()
          
        })
        .catch((error) => {
            if (error.message === '401') {
                // Unauthorized
                this.setState({oldPwWrongErrorMessage: 'Das alte Passwort ist falsch.', serverErrorMessage: ''});
              } else if (error.message === '403') {
                // Forbidden (Token expired)
                window.alert('Der Anmeldetoken ist abgelaufen. Du wirst jetzt ausgeloggt.');
                logout();
              } else if (error.message === '409') {
                // Conflict
                this.setState({oldPwWrongErrorMessage: 'Das neue Passwort darf nicht mit einem Alten übereinstimmen.', serverErrorMessage: ''});
              }else {
                // Internal server error
                this.setState({serverErrorMessage: 'Datenbankfehler, bitte kontaktiere den zuständigen Administrierenden!', oldPwWrongErrorMessage: ''});
              }
        });
    };
  
    handleChange = (e) => {
      this.setState({ [e.target.name]: e.target.value });
    };
  
    render() {
      const { oldPW, password, password2 } = this.state;
  
      return (
        <div className='flexWrapper heightCenter widthMax'>
            <BackgroundLogo/>
            <div className='cardUnderlay'>
              <div className='glassyCard'>
                  <center>
                  <h1 className='blue noTopSpace'>Passwort ändern</h1>
                  <form onSubmit={this.handleSubmit} className='centered'>
                      <div className='left'>
                          <label htmlFor="oldPW" className={(this.state.oldPwWrongErrorMessage !== '')? 'error': ''}>Altes Passwort:</label><br/>
                          <input
                          className={(this.state.oldPwWrongErrorMessage !== '')? 'error': ''}
                          type="password"
                          id="oldPW"
                          name="oldPW"
                          value={oldPW}
                          onChange={this.handleChange}
                          autoComplete='password'
                          />
                        </div><br/>
                        <span className='error'>{this.state.oldPwWrongErrorMessage}</span>
                        <div>
                            Anforderungen: 
                            <ul className='left'>
                                <li>mindestens 12 Zeichen</li>    
                                <li>min. 1 Großbuchstabe</li>
                                <li>min. 1 Kleinbuchstabe</li>
                                <li>min. 1 Zahl</li>
                                <li>min. 1 Sonderzeichen</li>
                            </ul>
                        </div>
                        <div className='left'>
                          <label htmlFor="password" className={(this.state.pwNotCompleteErrorMessage !== '')? 'error': ''}>Neues Passwort:</label><br/>
                          <input
                          className={(this.state.pwNotCompleteErrorMessage !== '')? 'error': ''}
                          type="password"
                          id="password"
                          name="password"
                          value={password}
                          onChange={this.handleChange}
                          onBlur={this.checkPWRequirements}
                          autoComplete='current-password'
                          /><br/>
                          <span className='error'>{this.state.pwNotCompleteErrorMessage}</span>
                      </div>
                      <div className='left'>
                          <label htmlFor="password2" className={(this.state.pwNotMatchingErrorMessage !== '')? 'error': ''}>Passwort bestätigen:</label><br/>
                          <input
                          className={(this.state.pwNotMatchingErrorMessage !== '')? 'error': ''}
                          type="password"
                          id="password2"
                          name="password2"
                          value={password2}
                          onChange={this.handleChange}
                          onBlur={this.checkPWSame}
                          autoComplete='current-password'
                          /><br/>
                          <span className='error'>{this.state.pwNotMatchingErrorMessage}</span>
                      </div> <br/>

                      <span className='error'>{this.state.serverErrorMessage}</span>
                      <center>
                          <button type="submit" className='btn Class1' disabled={!(this.state.pwNotMatchingErrorMessage === '' && this.state.pwNotCompleteErrorMessage==='' && this.state.password !== '')}>Passwort ändern</button>
                      </center> 
                  </form>
                  </center>
              </div>
            </div>
        </div>
      );
    }
  }

export default PWChanger