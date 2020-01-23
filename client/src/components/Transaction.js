import React from 'react';

const Transaction = ({transaction}) => {
    
    const {input, outputMap} = transaction;
    return(
        <div className='Transaction'>
            <div>From: {`${input.address.substring(0, 20)}...`}</div>
            <div key={outputMap['recipient']}>
                To: {`${outputMap['recipient'].substring(0, 20)}...`} | Product_ID: {outputMap['productId']} 
            </div>    
        </div>
    )
}

export default Transaction;