import { io } from "socket.io-client"
import 'bootstrap/dist/css/bootstrap.min.css';

import Container from 'react-bootstrap/Container';
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

  const [roomCode, setRoomCode] = useState("")
  const [currentUserID, setCurrentUserID] = useState("")
  const [users, setUsers] = useState<User[]>([])
  const [currentPage, setCurrentPage] = useState<"loading"|"main"|"lobby"|"game">("loading")

  useEffect(() => {
    if (!loaded) {

      if (sessionID) {
        socket.auth = { sessionID }
      }
      socket.connect()

      socket.on("session", ({ sessionID, userID, gameInfo }) => {
        // attach the session ID to the next reconnection attempts
        socket.auth = { sessionID };
        // store it in the localStorage
        localStorage.setItem("sessionID", sessionID);
        // save the ID of the user
        setCurrentUserID(userID)
        if (gameInfo) {
          setUsers(gameInfo.users)
          setRoomCode(gameInfo.game.roomCode)
          setCurrentPage('lobby')
        } else {
          setCurrentPage('main')
        }
      });

      socket.on('success-join', (arg) => {
        setUsers([...arg.users])
        setCurrentPage('lobby')
      })

      socket.on('failed-join', (arg) => {
        alert("Não foi possivel entrar na sala ! Verifique se o código está correto")
      })

      loaded = true
    }
  }, [])

  // É preciso colocar essas funções para fora, pois é preciso ter o users atualizado para ela funcionar corretamente (ou outras variaveis)
  socket.on('new-user-joined', (arg) => {
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
        <MainPage socket={socket} show={currentPage === 'main'} />
        <LobbyPage users={users} currentUserID={currentUserID} show={currentPage === 'lobby'} roomCode={roomCode} />
        <GamePage />
      </main>
    </>
  );
}

export default App;
