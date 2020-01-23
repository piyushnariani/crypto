import React, { Component } from 'react';
import { FormGroup, FormControl, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';

class ConductTransaction extends Component {
    state = { recipient: '', productId: '' };

    updateRecipient = event => {
        this.setState({recipient: event.target.value});
    }

    updateProductId = event => {
        this.setState({productId: event.target.value});
    }

    conductTransaction = () => {
        const { recipient, productId } = this.state;
        fetch(`${document.location.origin}/api/transact`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json'},
            body: JSON.stringify({recipient, productId})
        }).then(response => response.json())
            .then(json => {
                alert(json.message || json.type);
            })
    }

    render() {
        return (
            <div className='ConductTransaction'>
                <Link to='/'>Home</Link>
                <h3>Conduct a Transaction</h3>
                <FormGroup>
                    <FormControl 
                        input='text'
                        placeholder='recipient'
                        value={this.state.recipient}
                        onChange={this.updateRecipient}
                    />
                </FormGroup>
                <FormGroup>
                <FormControl 
                        input='text'
                        placeholder='product id'
                        value={this.state.productId}
                        onChange={this.updateProductId}
                    />
                </FormGroup>
                <div>
                    <Button bsStyle="danger" onClick={this.conductTransaction}>Submit</Button>
                </div>
            </div>
        )
    }
}

export default ConductTransaction;