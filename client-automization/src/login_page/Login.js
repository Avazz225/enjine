import React from 'react'

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
          console.log(data); // Assuming the backend returns some data
          // Reset the form
          this.setState({
            username: '',
            password: ''
          });
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
                this.setState({pwErrorMessage: 'Das Passwort ist abgelaufen, bitte lass es zurücksetzen.', unameErrorMessage: '', serverErrorMessage: ''})
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
        <div className='flexWrapper heightCenter'>
            <div className='glassyCard'>
                <center>
                <h1 className='blue noTopSpace'>Einloggen</h1>
                <form onSubmit={this.handleSubmit}>
                    <div className='left'>
                        <label htmlFor="identifier" className={(this.state.unameErrorMessage !== '')? 'error': ''}>Anmeldename:</label><br/>
                        <input
                        className={(this.state.unameErrorMessage !== '')? 'error': ''}
                        type="text"
                        id="identifier"
                        name="identifier"
                        value={identifier}
                        onChange={this.handleChange}
                        />
                        <span className='error'>{this.state.unameErrorMessage}</span>
                    </div>
                    <div className='left'>
                        <label htmlFor="password" className={(this.state.pwErrorMessage !== '')? 'error': ''}>Passwort:</label><br/>
                        <input
                        className={(this.state.pwErrorMessage !== '')? 'error': ''}
                        type="password"
                        id="password"
                        name="password"
                        value={password}
                        onChange={this.handleChange}
                        />
                        <span className='error'>{this.state.pwErrorMessage}</span>
                    </div><br/>
                    <span className='error'>{this.state.serverErrorMessage}</span>
                    <center>
                        <button type="submit" className='btn Class1'>Login</button>
                    </center> 
                </form>
                </center>
            </div>
        </div>
      );
    }
  }

export default Login