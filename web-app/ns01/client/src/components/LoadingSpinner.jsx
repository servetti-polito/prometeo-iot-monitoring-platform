import React from 'react';
import { Spinner } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';

function LoadingSpinner() {
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh', 
      }}
    >
      <Spinner animation="border" role="status"/>
        <span className="sr-only">Loading...</span>
    </div>
  );
}

export default LoadingSpinner;
