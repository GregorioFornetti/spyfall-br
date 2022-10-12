import { io } from "socket.io-client"
import 'bootstrap/dist/css/bootstrap.min.css';

import Container from 'react-bootstrap/Container';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import GamePage from './components/GamePage';
import MainPage from "./components/MainPage";

const socket = io("http://192.168.56.1:3000", {autoConnect: false})
var currentUserID

const sessionID = localStorage.getItem("sessionID")

if (sessionID) {
  socket.auth = { sessionID }
}
socket.connect()

socket.on("session", ({ sessionID, userID }) => {
  console.log('alo')
  // attach the session ID to the next reconnection attempts
  socket.auth = { sessionID };
  // store it in the localStorage
  localStorage.setItem("sessionID", sessionID);
  // save the ID of the user
  currentUserID = userID
  console.log(currentUserID)
});

socket.on('failed-join', (arg) => {
  alert("Não foi possivel entrar na sala ! Verifique se o código está correto")
})


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
