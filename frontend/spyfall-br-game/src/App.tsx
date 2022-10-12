import { io } from "socket.io-client"
import 'bootstrap/dist/css/bootstrap.min.css';

import Container from 'react-bootstrap/Container';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import GamePage from './components/GamePage';
import MainPage from "./components/MainPage";
import { useState, useEffect } from "react";
import User from './interfaces/UserInterface'
import LobbyPage from "./components/LobbyPage";

var loaded = false

const socket = io("http://192.168.56.1:3000", {autoConnect: false})
const sessionID = localStorage.getItem("sessionID")

function App() {
  const [currentUserID, setCurrentUserID] = useState("")
  const [users, setUsers] = useState<User[]>([])
  console.log(users)

  useEffect(() => {
    if (!loaded) {

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
        setCurrentUserID(userID)
        console.log(currentUserID)
      });

      socket.on('failed-join', (arg) => {
        alert("Não foi possivel entrar na sala ! Verifique se o código está correto")
      })

      socket.on('success-join', (arg) => {
        console.log('sucesso, entrei')
        users.concat(arg.users)
        setUsers([...arg.users])
      })

      socket.on('new-user-joined', (arg: any) => {
        console.log(users)
        users.push(arg)
        setUsers([...users])
      })

      loaded = true
    }
  }, [])

  socket.on('new-user-joined', (arg: any) => {
    console.log(users)
    setUsers([...users, arg])
  })

  return (
    <>
      <Navbar fixed="top" bg="dark" variant="dark">
        <Container>
          <Navbar.Brand>Spyfall-br</Navbar.Brand>
        </Container>
      </Navbar>

      <main style={{marginTop: '100px'}}>
        <MainPage socket={socket} show />
        <LobbyPage users={users} currentUserID={currentUserID} />
        <GamePage />
      </main>

      {currentUserID}
      <br />
      {JSON.stringify(users)}
    </>
  );
}

export default App;
