import React from 'react';
import { io } from "socket.io-client";

const socket = io("http://192.168.56.1:3000")

socket.on("hello", (arg) => {
  console.log(arg)
})

socket.emit('teste', 'ola')

function App() {
  return (
    <div>
      <h1>Teste</h1>
    </div>
  );
}

export default App;
