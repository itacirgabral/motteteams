import React, { useEffect, useState } from 'react';
import logo from './logo.svg';
import './App.css';
import io, { Socket } from 'socket.io-client'

declare const window: any

function App() {
  useEffect(() => {
    const newSocket = io(`http://${window.location.hostname}:4433`);
    window.io = newSocket
    return () => {};
  }, [])

  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>
          Edit <code>src/App.tsx</code> and save to reload.
        </p>
        <a
          className="App-link"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn React
        </a>
      </header>
    </div>
  );
}

export default App;
