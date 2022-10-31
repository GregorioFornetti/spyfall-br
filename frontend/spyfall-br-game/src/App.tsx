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
import { Nav, Row } from "react-bootstrap";
import ResultsModal from "./components/ResultsModal";

var loaded = false

const serverURL = 'http://localhost:3000'  // http://191.101.235.230:3000

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

  const [showResultsModal, setShowResultsModal] = useState(true)
  const [winner, setWinner] = useState<"spy"|"agents"|undefined>()
  const [winDescription, setWinDescription] = useState<string|undefined>()
  const [spy, setSpy] = useState<Player|undefined>()

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

      socket.on('logout', () => {
        setCurrentPage('main')
      })

      loaded = true
    }
  }, [])

  // É preciso colocar essas funções para fora, pois é preciso ter o users atualizado para ela funcionar corretamente (ou outras variaveis)
  socket.on('new-player-joined', (gameInfo) => {
    setPlayers([...players, gameInfo])
  })

  socket.on('player-disconnect', (playerID) => {
    console.log('hey')
    setPlayers(players.filter((player) => (player.id !== playerID)))
  })

  return (
    <>
      <Navbar fixed="top" bg="dark" variant="dark">
        <Container>
          <Navbar.Brand>Spyfall-br</Navbar.Brand>
          <Container>
            <Row>
              <Nav className="col-6 me-auto">
                {(currentPage === 'game') &&
                  <Nav.Link href="#">Sua vez de questionar</Nav.Link>  
                }
              </Nav>
              <Nav className="col-6 me-auto justify-content-end">
                {(currentPage === 'lobby' || currentPage === 'game') && 
                  <Nav.Link href="#" className='link-danger' onClick={() => socket.emit('logout')}>Sair do jogo</Nav.Link>
                }
              </Nav>
            </Row>
          </Container>
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

        <ResultsModal
          show={showResultsModal}
          setShow={setShowResultsModal}

          spy={spy}
          selectedPlace={selectedPlace}
          winDescripton={winDescription}
          winner={winner}
        />
      </main>
    </>
  );
}

export default App;
