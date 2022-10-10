import { io } from "socket.io-client"
import 'bootstrap/dist/css/bootstrap.min.css';

import Container from 'react-bootstrap/Container';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import GamePage from './components/GamePage';
import MainPage from "./components/MainPage";

const socket = io("http://192.168.56.1:3000")

socket.on("hello", (arg) => {
  console.log(arg)
})

socket.on('failed-join', (arg) => {
  alert("Não foi possivel entrar na sala ! Verifique se o código está correto")
})

socket.emit('teste', 'ola')
socket.emit('create-room1', 'ola')

function App() {

  return (
    <>
      <Navbar fixed="top" bg="dark" variant="dark">
        <Container>
          <Navbar.Brand>Spyfall-br</Navbar.Brand>
        </Container>
      </Navbar>

      <main style={{marginTop: '100px'}}>
        <MainPage socket={socket} show />
        <GamePage />
      </main>
      

    </>
  );
}

export default App;
