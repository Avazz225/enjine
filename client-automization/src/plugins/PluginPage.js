import React from "react"
import { getCookie, setLocal, filterJsonArray } from "../helpers";
import { Icon } from '@iconify/react';
import pencilIcon from '@iconify/icons-mdi/pencil';
import { BtnClass2, BtnClass3 } from "../components/Btn";

const ParamElem = ({data}) =>( 
    <>
    {Object.keys(data).map((key,i) =>(
        <div key={i} className="paramContainer">
            <div className="paramChild">{key}</div>
            <div className="paramChild">{data[key]}</div>
        </div>
    ))}
    </>
)

const ParamMapper = ({descs, params, handleParamChange}) =>( 
    <>
    {Object.keys(descs).map((key,i) =>(
        <div key={i}>
            <div>{key} : {descs[key]}</div>
            Wert: <input type="text" value={params[key]} onChange={(e) => handleParamChange(key, e)}/><br/><br/>
        </div>
    ))}
    </>
)

function SearchBox(props){
    return(
        <div>
            <label htmlFor="search">Suche:</label>
                          <input
                          type="text"
                          id="search"
                          name="search"
                          value={props.searchValue}
                          onChange={ (e) => props.handleChange(e)}
                          autoComplete='searchString'
                          placeholder="Plugin-Name"
                          /><br/>
        </div>
    )
}

const TableElement = ({data, openConfig}) =>( 
    <>
    {data.map(data =>(
        <tr key={data['id']}>
            <td>{data['name']}</td>
            <td className="flexWrapper">
                <ParamElem data={data['params']}/>
            </td>
            {(data['id']!==0)?<td><button className="iconWrapper btn Class1 zeroTB" onClick={() => openConfig(data)}><Icon icon={pencilIcon} width='24'/></button></td>:<></>}
        </tr>
    ))}
    </>
)

class PlugInMgmt extends React.Component{
    constructor(props) {
        super(props);
        this.state = {
            serverErrorMessage: '',
            pluginData: [{}],
            filteredPluginData:[{id:0, 
                                name:'...',
                                params: {unknown: '...', unknown2: '...'},
                                params_description: {unknown: 'None', unknown2: '...'},
                                }],
            searchValue: '',
            selectedPlugIn: '...',
            selectedParams: {unknown: '...', unknown2: '...'},
            selectedDescs: {unknown: 'None', unknown2: '...'},
            selectedID: 0,
        };

        this.abortChange = this.abortChange.bind(this)
        this.handleChange = this.handleChange.bind(this)
        this.openConfig = this.openConfig.bind(this)
        this.handleParamChange  = this.handleParamChange.bind(this)
        this.saveChanges = this.saveChanges.bind(this)

    }

    abortChange(){
        document.getElementById('accordeonInvisible').classList.remove('visible')
        window.location.reload()
    }

    componentDidMount(){
        fetch('http://127.0.0.1:5000/getPlugIns', {
            method: 'GET',
            headers: {
            'Content-Type': 'application/json',
            'Auth-Header': getCookie('token')
            },
        })
        .then((response) => {
            // Check the response status
            if (response.ok) {
                return response.json();
            } else {
                throw new Error(response.status, response.json());
            }
        })
        .then((data) => {
            // Handle the response
            if (data['pData'] !== 'f'){
                this.setState({
                    pluginData: data['pData'],
                    filteredPluginData: data['pData'],
                })
            }
        })
        .catch((error, data) => {
            if (error.message === '401') {
                // Unauthorized
                this.setState({serverErrorMessage: 'Unzureichende Rechte.'})
                setLocal('userRights', data['rights'])
            } else {
                // Internal server error
                this.setState({serverErrorMessage: 'Datenbankfehler, bitte kontaktiere den zuständigen Administrierenden!'})
            }
        });
    }

    handleChange = (e) => {
        this.setState({ [e.target.name]: e.target.value,
                        filteredPluginData: filterJsonArray(this.state.pluginData, e.target.value),
        });
    };

    handleParamChange(key, e){
        let temp = this.state.selectedParams
        temp[key] = e.target.value
        this.setState({
            selectedParams: temp
        })
    }

    openConfig(data){
        this.setState({
            selectedPlugIn: data['name'],
            selectedParams: data['params'],
            selectedDescs: data['params_description'],
            selectedID: data['id'],
        })
        document.getElementById('accordeonInvisible').classList.add('visible')

    }

    saveChanges(){
        const vals = {
            newConfig: this.state.selectedParams,
            id: this.state.selectedID
        };

        fetch('http://127.0.0.1:5000/setPluginConfig', {
            method: 'UPDATE',
            headers: {
            'Content-Type': 'application/json',
            'Auth-Header': getCookie('token')
            },
            body: JSON.stringify(vals)
        })
        .then((response) => {
            // Check the response status
            if (response.ok) {
                return
            } else {
                throw new Error(response.status, response.json());
            }
        })
        .then(() => {
            // Handle the response
            document.getElementById('accordeonInvisible').classList.remove('visible')
        })
        .catch((error, data) => {
            if (error.message === '401') {
                // Unauthorized
                this.setState({serverErrorMessage: 'Unzureichende Rechte.'})
                setLocal('userRights', data['rights'])
            } else {
                // Internal server error
                this.setState({serverErrorMessage: 'Datenbankfehler, bitte kontaktiere den zuständigen Administrierenden!'})
            }
        });
    }

    render(){
        return(
            <div className="content">
                <h1 className="blue noTopSpace">Pluginkonfiguration</h1>
                <div className="accordeonWrapper">
                    <div className="accordeonElem visible" >
                        <h2>Pluginbibliothek</h2>
                        <div className='centered'>
                            <SearchBox handleChange={this.handleChange} searchValue={this.searchValue}/><br/>
                            {(this.state.serverErrorMessage !== '')?<span className="error">{this.state.serverErrorMessage}</span>:<></>}
                            <table>
                                <thead>
                                    <tr>
                                        <th>Plugin-Name</th>
                                        <th>Parameter und Standardwerte</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <TableElement data={this.state.filteredPluginData} openConfig={this.openConfig}/>
                                </tbody>
                            </table>
                        </div>
                    </div>
                    <div id='accordeonInvisible' className="accordeonElem">
                        <h2>Parameter von {this.state.selectedPlugIn}</h2>
                        <ParamMapper params={this.state.selectedParams} descs={this.state.selectedDescs} id={this.state.selectedID} handleParamChange={this.handleParamChange}/>
                        <center>
                            <BtnClass2 text='Änderungen speichern' action={this.saveChanges} /><br/>
                            <BtnClass3 text='Änderungen verwerfen' action={this.abortChange} />
                        </center>
                    </div>
                </div>
            </div>
        )
    }
}

export default PlugInMgmt