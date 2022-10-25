import { io } from "socket.io-client"
import 'bootstrap/dist/css/bootstrap.min.css';

import Container from 'react-bootstrap/Container';
import Navbar from 'react-bootstrap/Navbar';
import GamePage from './components/GamePage';
import MainPage from "./components/MainPage";
import { useState, useEffect } from "react";
import Player from './interfaces/PlayerInterface'
import LobbyPage from "./components/LobbyPage";

import Place from './interfaces/PlaceInterface'
import Role from './interfaces/RoleInterface'
import Category from './interfaces/CategoryInterface'
import LoadingModal from "./components/LoadingModal";

var loaded = false

const serverURL = 'http://localhost:3000'

const socket = io(serverURL, {autoConnect: false})
const sessionID = localStorage.getItem("sessionID")

var places: Place[] = []
var roles: Role[] = []
var categories: Category[] = []

function App() {

  const [gameCode, setGameCode] = useState("")
  const [currentUserID, setCurrentUserID] = useState("")
  const [leaderUserID, setLeaderUserID] = useState("")
  const [players, setPlayers] = useState<Player[]>([])
  const [currentPage, setCurrentPage] = useState<"loading"|"main"|"lobby"|"game">("loading")

  const [isSpy, setIsSpy] = useState(false)
  const [possiblePlaces, setPossiblePlaces] = useState<Place[]>([])
  const [selectedPlace, setSelectedPlace] = useState<Place|undefined>()
  const [playerRole, setPlayerRole] = useState<Role|undefined>()
  const [askingUserID, setAskingUserID] = useState('')
  const [targetUserID, setTargetUserID] = useState<string|undefined>()

  useEffect(() => {
    if (!loaded) {

      Promise.all([
        fetch(`${serverURL}/places`, {method: 'GET'}).then((response) => (response.json())),
        fetch(`${serverURL}/categories`, {method: 'GET'}).then((response) => (response.json())),
        fetch(`${serverURL}/roles`, {method: 'GET'}).then((response) => (response.json()))
      ]).then((responses) => {
        places = responses[0].map((place: any) => {
          if (place.imgPath) {
            return {...place, imgPath: `${serverURL}/${place.imgPath}`}
          }
          return place
        })
        categories = responses[1]
        roles = responses[2]

        if (sessionID) {
          socket.auth = { sessionID }
        }
        socket.connect()
      })

      socket.on("session", ({ sessionID, userID, gameInfo }) => {

        socket.auth = { sessionID };
        localStorage.setItem("sessionID", sessionID);
        setCurrentUserID(userID)

        if (gameInfo) {
          setPlayers(gameInfo.players)
          setGameCode(gameInfo.code)
          setLeaderUserID(gameInfo.leaderUserID)
          if (gameInfo.inMatch) {
            var match = gameInfo.match
            console.log(match)
            setAskingUserID(match.askingUserID)
            setTargetUserID(match.targetUserID)
            setPossiblePlaces(places.filter((place) => (match.possiblePlacesIDs.includes(place.id))))
            setIsSpy(match.isSpy)
            setSelectedPlace(places.find((place) => (place.id === match.selectedPlaceID)))
            setPlayerRole(roles.find((role) => (role.id === match.userRoleID)))
            setCurrentPage('game')
          } else {
            setCurrentPage('lobby')
          }
        } else {
          setCurrentPage('main')
        }
      });

      socket.on('success-join', (gameInfo) => {
        console.log(gameInfo)
        setPlayers([...gameInfo.players])
        setGameCode(gameInfo.code)
        setLeaderUserID(gameInfo.leaderUserID)
        setCurrentPage('lobby')
      })

      socket.on('failed-join', (arg) => {
        alert("Não foi possivel entrar na sala ! Verifique se o código está correto")
      })

      socket.on('match-start', (match) => {
        setCurrentPage('game')
        setAskingUserID(match.askingUserID)
        setTargetUserID(match.targetUserID)
        setPossiblePlaces(places.filter((place) => (match.possiblePlacesIds.includes(place.id))))

        setIsSpy(match.isSpy)
        setSelectedPlace(places.find(match.selectedPlaceID))
        setPlayerRole(roles.find(match.userRoleID))
      })

      loaded = true
    }
  }, [])

  // É preciso colocar essas funções para fora, pois é preciso ter o users atualizado para ela funcionar corretamente (ou outras variaveis)
  socket.on('new-player-joined', (gameInfo) => {
    console.log(gameInfo)
    setPlayers([...players, gameInfo])
  })

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
          show={currentPage === 'main'} 
          socket={socket} 
        />

        <LobbyPage
          show={currentPage === 'lobby'} 
          socket={socket}
          players={players} 
          currentUserID={currentUserID} 
          leaderUserID={leaderUserID}
          gameCode={gameCode} 
        />

        <GamePage
          show={currentPage === 'game'}
          players={players}
          currentUserID={currentUserID}
          leaderUserID={leaderUserID}
          possiblePlaces={possiblePlaces}
          isSpy={isSpy}
          selectedPlace={selectedPlace}
          askingUserID={askingUserID}
          targetUserID={targetUserID}
          playerRole={playerRole}
        />
      </main>
    </>
  );
}

export default App;
