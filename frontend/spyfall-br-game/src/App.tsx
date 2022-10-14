import { io } from "socket.io-client"
import 'bootstrap/dist/css/bootstrap.min.css';

import Container from 'react-bootstrap/Container';
import Navbar from 'react-bootstrap/Navbar';
import GamePage from './components/GamePage';
import MainPage from "./components/MainPage";
import { useState, useEffect } from "react";
import User from './interfaces/UserInterface'
import LobbyPage from "./components/LobbyPage";

import Place from './interfaces/PlaceInterface'
import Role from './interfaces/RoleInterface'
import Category from './interfaces/CategoryInterface'
import LoadingModal from "./components/LoadingModal";

var loaded = false

const socket = io("http://192.168.56.1:3000", {autoConnect: false})
const sessionID = localStorage.getItem("sessionID")

var places: Place[] = []
var roles: Role[] = []
var categories: Category[] = []

function App() {

  const [roomCode, setRoomCode] = useState("")
  const [currentUserID, setCurrentUserID] = useState("")
  const [leaderUserID, setLeaderUserID] = useState("")
  const [users, setUsers] = useState<User[]>([])
  const [currentPage, setCurrentPage] = useState<"loading"|"main"|"lobby"|"game">("loading")

  useEffect(() => {
    if (!loaded) {

      Promise.all([
        fetch('http://192.168.56.1:3000/places', {method: 'GET'}).then((response) => (response.json())),
        fetch('http://192.168.56.1:3000/categories', {method: 'GET'}).then((response) => (response.json())),
        fetch('http://192.168.56.1:3000/roles', {method: 'GET'}).then((response) => (response.json()))
      ]).then((responses) => {
        places = responses[0]
        categories = responses[1]
        roles = responses[2]

        if (sessionID) {
          socket.auth = { sessionID }
        }
        socket.connect()
      })

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
          setLeaderUserID(gameInfo.game.leaderUserID)
        } else {
          setCurrentPage('main')
        }
      });

      socket.on('success-join', (gameInfo) => {
        setUsers([...gameInfo.users])
        setRoomCode(gameInfo.game.roomCode)
        setLeaderUserID(gameInfo.game.leaderUserID)
        setCurrentPage('lobby')
      })

      socket.on('failed-join', (arg) => {
        alert("Não foi possivel entrar na sala ! Verifique se o código está correto")
      })

      loaded = true
    }
  }, [])

  // É preciso colocar essas funções para fora, pois é preciso ter o users atualizado para ela funcionar corretamente (ou outras variaveis)
  socket.on('new-user-joined', (gameInfo) => {
    setRoomCode(gameInfo.game.roomCode)
    setLeaderUserID(gameInfo.game.leaderUserID)
    setUsers([...users, gameInfo])
  })


  console.log(currentUserID)
  console.log(leaderUserID)

  return (
    <>
      <Navbar fixed="top" bg="dark" variant="dark">
        <Container>
          <Navbar.Brand>Spyfall-br</Navbar.Brand>
        </Container>
      </Navbar>

      <main style={{marginTop: '100px'}}>
        <LoadingModal 
          show={currentPage === 'loading'} 
        />

        <MainPage 
          socket={socket} 
          show={currentPage === 'main'} 
        />

        <LobbyPage 
          users={users} 
          currentUserID={currentUserID} 
          leaderUserID={leaderUserID}
          show={currentPage === 'lobby'} 
          roomCode={roomCode} 
        />

        <GamePage />
      </main>
    </>
  );
}

export default App;
