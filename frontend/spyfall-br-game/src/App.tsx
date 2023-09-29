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
import ConfigInterface, { defaultConfig } from "./interfaces/ConfigInterface";

var loaded = false

const dbPath: string = process.env.NODE_ENV === 'development' ?
                       'http://localhost:3000' + process.env.REACT_APP_DB_PATH as string :
                       process.env.REACT_APP_DB_PATH as string

const rootUrl: string = process.env.NODE_ENV === 'development' ?
                        'localhost:3000' :
                        window.location.host

const gamePath: string = process.env.PUBLIC_URL as string


function getURLGameCode() {
  var url =  window.location.href
  if (url.endsWith('/')) {
    url = url.substring(0, url.length - 1)
  }
  if (url.length <= 36) {
    return ''
  }
  var gameCode = url.substring(url.length - 36)

  return gameCode

}

const socket = io(
  rootUrl, {
    autoConnect: false,
    path: `${gamePath}/multiplayer/socket.io/`
  }
)
const sessionID = localStorage.getItem("sessionID")

var places: Place[] = []
var roles: Role[] = []
var categories: Category[] = []

var matchTimeoutObject: undefined|NodeJS.Timeout
var votationTimeoutObject: undefined|NodeJS.Timeout

function App() {

  const [URLGameCode, setURLGameCode] = useState("")
  const [gameCode, setGameCode] = useState("")
  const [currentUserID, setCurrentUserID] = useState("")
  const [leaderUserID, setLeaderUserID] = useState("")
  const [players, setPlayers] = useState<Player[]>([])
  const [config, setConfig] = useState(defaultConfig)
  const [currentPage, setCurrentPage] = useState<"loading"|"main"|"lobby"|"game">("loading")
  const [matchTime, setMatchTime] = useState(0)
  const [votationTime, setVotationTime] = useState(10)

  const [isSpy, setIsSpy] = useState(false)
  const [possiblePlaces, setPossiblePlaces] = useState<Place[]>([])
  const [selectedPlace, setSelectedPlace] = useState<Place|undefined>()
  const [playerRole, setPlayerRole] = useState<Role|undefined>()
  const [askingUserID, setAskingUserID] = useState('')
  const [targetUserID, setTargetUserID] = useState<string|undefined>()
  const [previousAskingUserID, setPreviousAskingUserID] = useState<string|undefined>()

  const [inVotation, setInVotation] = useState<boolean>(false)
  const [accusedUserID, setAccusedUserID] = useState<string|undefined>()
  const [accuserUserID, setAccuserUserID] = useState<string|undefined>()
  const [agreedUsersIds, setAgreedUsersIds] = useState<string[]>([])
  const [desagreedUsersIds, setDesagreedsUsersIds] = useState<string[]>([])

  const [showResultsModal, setShowResultsModal] = useState(false)
  const [winner, setWinner] = useState<"spy"|"agents"|undefined>()
  const [winDescription, setWinDescription] = useState<string|undefined>()
  const [spy, setSpy] = useState<Player|undefined>()

  useEffect(() => {
    clearTimeout(matchTimeoutObject)
    if (matchTime > 0) {
      matchTimeoutObject = setTimeout(() => {setMatchTime(matchTime - 1)}, 1000)
    }
  }, [matchTime])

  useEffect(() => {
    clearTimeout(votationTimeoutObject)
    if (votationTime > 0) {
      votationTimeoutObject = setTimeout(() => {setVotationTime(votationTime - 1)}, 1000)
    }
  }, [votationTime])

  useEffect(() => {
    if (!loaded) {

      Promise.all([
        fetch(`${dbPath}/places`, {method: 'GET'}).then((response) => (response.json())),
        fetch(`${dbPath}/categories`, {method: 'GET'}).then((response) => (response.json())),
        fetch(`${dbPath}/roles`, {method: 'GET'}).then((response) => (response.json()))
      ]).then((responses) => {
        places = responses[0].map((place: any) => {
          if (place.imgPath) {
            return {...place, imgPath: `${dbPath}/${place.imgPath}`}
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
          window.history.replaceState({}, '', `${gamePath}/${gameInfo.code}`)
          setGameCode(gameInfo.code)
          setLeaderUserID(gameInfo.leaderUserID)
          setConfig(gameInfo.config)
          if (gameInfo.inMatch) {
            var match = gameInfo.match
            setAskingUserID(match.askingUserID)
            setTargetUserID(match.targetUserID)
            setPossiblePlaces(places.filter((place) => (match.possiblePlacesIDs.includes(place.id))))
            setIsSpy(match.isSpy)
            setSelectedPlace(places.find((place) => (place.id === match.selectedPlaceID)))
            setPlayerRole(roles.find((role) => (role.id === match.userRoleID)))
            setPreviousAskingUserID(match.previousAskingUserID)
            setMatchTime(match.matchTimeLeft)
            if (match.inVotation) {
              setInVotation(true)
              setAccusedUserID(match.accusedUserID)
              setAccuserUserID(match.accuserUserID)
              setAgreedUsersIds(match.agreedUsersIds)
              setDesagreedsUsersIds(match.desagreedUsersIds)
              setVotationTime(match.votationTimeLeft)
            }
            setCurrentPage('game')
          } else {
            setCurrentPage('lobby')
          }
        } else {
          setURLGameCode(getURLGameCode())
          setCurrentPage('main')
        }
      });

      socket.on('success-join', (gameInfo) => {
        setPlayers([...gameInfo.players])
        window.history.replaceState({}, '', `${gamePath}/${gameInfo.code}`)
        setGameCode(gameInfo.code)
        setLeaderUserID(gameInfo.leaderUserID)
        setConfig(gameInfo.config)
        setCurrentPage('lobby')
      })

      socket.on('votation-start', ([newAccuserID, newAccusedID, votationTime]) => {
        setInVotation(true)
        setAccuserUserID(newAccuserID)
        setAccusedUserID(newAccusedID)
        setVotationTime(votationTime)
      })

      socket.on('new-questioning', (targetUserID) => {
        setTargetUserID(targetUserID)
      })

      socket.on('logout', () => {
        window.history.replaceState({}, '', `${gamePath}`)
        setCurrentPage('main')
      })

      socket.on('error', (message) => {
        alert(message)
      })

      socket.on('new-config', (newConfig: ConfigInterface) => {
        setConfig(newConfig)
      })

      loaded = true
    }
  }, [])

  // É preciso colocar essas funções para fora, pois é preciso ter o users atualizado para ela funcionar corretamente (ou outras variaveis)
  socket.on('new-player-joined', (gameInfo) => {
    setPlayers([...players, gameInfo])
  })

  socket.on('player-disconnect', (playerID) => {
    setPlayers(players.filter((player) => (player.id !== playerID)))
  })

  socket.on('end-questioning', () => {
    setPreviousAskingUserID(askingUserID)
    setAskingUserID(targetUserID as string)
    setTargetUserID(undefined)
  })

  socket.on('match-end', (matchResults) => {
    setWinner(matchResults.winner)
    setWinDescription(matchResults.winDescription)
    setSelectedPlace(places.find((place) => (place.id === matchResults.selectedPlaceID)))
    setSpy(players.find((player) => (player.id === matchResults.spyUserID)))

    setAccusedUserID(undefined)
    setAccusedUserID(undefined)
    setAgreedUsersIds([])
    setDesagreedsUsersIds([])
    setInVotation(false)

    setShowResultsModal(true)
    setCurrentPage('lobby')
  })

  socket.on('agreed-vote', (newAgreedUserID) => {
    let newAgreedUsersIds = [...agreedUsersIds, newAgreedUserID]
    setAgreedUsersIds(newAgreedUsersIds)
    if (newAgreedUsersIds.length === players.length - 2 && votationTime > 5) {
      setVotationTime(5)
    }
  })

  socket.on('desagreed-vote', (newDesagreedUserID) => {
    setDesagreedsUsersIds([...desagreedUsersIds, newDesagreedUserID])
    if (votationTime > 5) {
      setVotationTime(5)
    }
  })

  socket.on('vote-failed', () => {
    setAccusedUserID(undefined)
    setAccusedUserID(undefined)
    setAgreedUsersIds([])
    setDesagreedsUsersIds([])
    setInVotation(false)
  })

  socket.on('match-start', (match) => {
    setPlayers(players.map((player) => ({...player, ready: false})))
    setAskingUserID(match.askingUserID)
    setTargetUserID(match.targetUserID)
    setPossiblePlaces(places.filter((place) => (match.possiblePlacesIDs.includes(place.id))))
    setIsSpy(match.isSpy)
    setSelectedPlace(places.find((place) => (place.id === match.selectedPlaceID)))
    setPlayerRole(roles.find((role) => (role.id === match.userRoleID)))
    setMatchTime(match.matchTimeLeft)
    setCurrentPage('game')
  })

  socket.on('player-ready', (playerID) => {
    (players.find((player) => player.id === playerID) as Player).ready = true
    setPlayers([...players])
  })

  socket.on('player-unready', (playerID) => {
    (players.find((player) => player.id === playerID) as Player).ready = false
    setPlayers([...players])
  })

  return (
    <>
      <Navbar fixed="top" bg="dark" variant="dark">
        <Container>
          <Navbar.Brand>Spyfall-br</Navbar.Brand>
          <Container>
            <Row>
              <Nav className="me-auto justify-content-end">
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
          URLGameCode={URLGameCode}
          setURLGameCode={setURLGameCode}
          show={currentPage === 'main'} 
          socket={socket} 
        />

        <LobbyPage
          serverURL={window.location.host}
          show={currentPage === 'lobby'} 
          socket={socket}
          players={players} 
          setPlayers={setPlayers}
          currentUserID={currentUserID} 
          leaderUserID={leaderUserID}
          gameCode={gameCode}
          places={places}
          categories={categories}
          config={config}
          setConfig={setConfig}
        />

        <GamePage
          show={currentPage === 'game'}
          players={players}
          currentUserID={currentUserID}
          leaderUserID={leaderUserID}
          possiblePlaces={possiblePlaces}
          isSpy={isSpy}
          matchTime={matchTime}
          votationTime={votationTime}
          selectedPlace={selectedPlace}
          askingUserID={askingUserID}
          targetUserID={targetUserID}
          playerRole={playerRole}
          previousAskingUserID={previousAskingUserID}
          inVotation={inVotation}
          agreedUsersIds={agreedUsersIds}
          desagreedUsersIds={desagreedUsersIds}
          accusedUserID={accusedUserID}
          accuserUserID={accuserUserID}
          socket={socket}
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
