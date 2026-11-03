import { io } from "socket.io-client"

import GamePage, { QuestionLogEntry, ExtensionVote } from './components/GamePage';

import MainPage from "./components/MainPage";
import { useState, useEffect } from "react";
import Player from './interfaces/PlayerInterface'
import LobbyPage from "./components/LobbyPage";

import Place from './interfaces/PlaceInterface'
import Role from './interfaces/RoleInterface'
import Category from './interfaces/CategoryInterface'
import LoadingModal from "./components/LoadingModal";
import ResultsModal from "./components/ResultsModal";
import ConfigInterface, { defaultConfig } from "./interfaces/ConfigInterface";
import HelpModal from "./components/HelpModal";
import { useTranslation } from 'react-i18next';
import i18n, { translateServerMessage, SupportedLanguage } from './i18n';
import {
  CUSTOM_CATEGORY,
  loadCustomPlaces,
  loadCustomRoles,
  mergeById
} from './utils/customData';

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

var serverPlaces: Place[] = []
var serverRoles: Role[] = []
var serverCategories: Category[] = []
// Personalizados deste usuário (localStorage) e os do líder da sala
// (recebidos na configuração/partida): ids negativos, sem colisão com o banco.
var ownCustomPlaces: Place[] = []
var ownCustomRoles: Role[] = []
var remoteCustomPlaces: Place[] = []
var remoteCustomRoles: Role[] = []

var places: Place[] = []
var roles: Role[] = []
var categories: Category[] = []

function rebuildData() {
  places = mergeById(mergeById(serverPlaces, remoteCustomPlaces), ownCustomPlaces)
  roles = mergeById(mergeById(serverRoles, remoteCustomRoles), ownCustomRoles)
  categories = [...serverCategories, CUSTOM_CATEGORY]
}

function learnRemoteCustom(customPlaces?: Place[], customRoles?: Role[]) {
  if (!customPlaces?.length && !customRoles?.length) {
    return
  }
  remoteCustomPlaces = mergeById(remoteCustomPlaces, customPlaces ?? [])
  remoteCustomRoles = mergeById(remoteCustomRoles, customRoles ?? [])
  rebuildData()
}

var matchTimeoutObject: undefined|NodeJS.Timeout
var votationTimeoutObject: undefined|NodeJS.Timeout

function App() {
  const { t } = useTranslation()

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
  const [round, setRound] = useState(0)
  const [questionLog, setQuestionLog] = useState<QuestionLogEntry[]>([])
  const [extensionUsed, setExtensionUsed] = useState(false)
  const [extensionVote, setExtensionVote] = useState<ExtensionVote | null>(null)
  const [winner, setWinner] = useState<"spy"|"agents"|undefined>()
  const [winDescription, setWinDescription] = useState<string|undefined>()
  const [spy, setSpy] = useState<Player|undefined>()
  const [showHelpModal, setShowHelpModal] = useState(false)

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
        serverPlaces = responses[0].map((place: any) => {
          if (place.imgPath) {
            return {...place, imgPath: `${dbPath}/${place.imgPath}`}
          }
          return place
        })
        serverCategories = responses[1]
        serverRoles = responses[2]
        ownCustomPlaces = loadCustomPlaces()
        ownCustomRoles = loadCustomRoles()
        rebuildData()

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
          learnRemoteCustom(gameInfo.config?.customPlaces, gameInfo.config?.customRoles)
          if (gameInfo.inMatch) {
            learnRemoteCustom(gameInfo.match?.customPlaces, gameInfo.match?.customRoles)
          }
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
            setRound(match.round ?? 1)
            setQuestionLog(match.questionLog ?? [])
            setExtensionUsed(match.extensionUsed ?? false)
            setExtensionVote(match.extensionVote ?? null)
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
        learnRemoteCustom(gameInfo.config?.customPlaces, gameInfo.config?.customRoles)
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

      socket.on('new-questioning', (payload: any) => {
        if (typeof payload === 'string') {
          setTargetUserID(payload)
        } else {
          setTargetUserID(payload.targetUserID)
          if (payload.questionLog) {
            setQuestionLog(payload.questionLog)
          }
        }
      })

      socket.on('logout', () => {
        window.history.replaceState({}, '', `${gamePath}`)
        setCurrentPage('main')
      })

      socket.on('error', (message) => {
        alert(translateServerMessage(message))
      })

      socket.on('new-config', (newConfig: ConfigInterface) => {
        learnRemoteCustom(newConfig.customPlaces, newConfig.customRoles)
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

  socket.on('extension-vote-start', (vote: ExtensionVote) => {
    setExtensionVote(vote)
  })

  socket.on('extension-vote-update', (vote: ExtensionVote) => {
    setExtensionVote(vote)
  })

  socket.on('extension-granted', ({ matchTimeLeft }: { matchTimeLeft: number }) => {
    setExtensionVote(null)
    setExtensionUsed(true)
    setMatchTime(matchTimeLeft)
  })

  socket.on('extension-rejected', () => {
    setExtensionVote(null)
  })

  socket.on('match-end', (matchResults) => {
    setWinner(matchResults.winner)
    setWinDescription(matchResults.winDescription)
    setSelectedPlace(places.find((place) => (place.id === matchResults.selectedPlaceID)))
    setSpy(players.find((player) => (player.id === matchResults.spyUserID)))
    setPlayers(matchResults.players)
    if (matchResults.round) {
      setRound(matchResults.round)
    }
    if (matchResults.questionLog) {
      setQuestionLog(matchResults.questionLog)
    }
    setExtensionVote(null)
    setExtensionUsed(false)

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
    learnRemoteCustom(match.customPlaces, match.customRoles)
    setShowResultsModal(false)
    setRound(match.round ?? 0)
    setQuestionLog(match.questionLog ?? [])
    setExtensionUsed(match.extensionUsed ?? false)
    setExtensionVote(match.extensionVote ?? null)
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
      <header className="sticky top-0 z-40 bg-zinc-900 text-white shadow-md">
        <div className="mx-auto flex max-w-6xl items-center gap-4 px-4 py-3 sm:px-6">
          <span className="font-display text-xl font-bold tracking-tight">Spyfall-br</span>
          <div className="ml-auto flex items-center gap-1" role="group" aria-label={t('common.language')}>
            {(['pt', 'en'] as SupportedLanguage[]).map((lng) => (
              <button
                key={lng}
                type="button"
                onClick={() => i18n.changeLanguage(lng)}
                aria-pressed={i18n.language === lng}
                className={`rounded-md px-2 py-1 text-xs font-semibold uppercase tracking-wide transition ${i18n.language === lng ? 'bg-white text-zinc-900' : 'text-zinc-400 hover:bg-zinc-800 hover:text-white'}`}
              >
                {lng}
              </button>
            ))}
          </div>
          <nav className="flex items-center gap-1" aria-label={t('app.mainNav')}>
            <button type="button" onClick={() => setShowHelpModal(true)} className="rounded-md px-3 py-1.5 text-sm font-medium text-zinc-300 transition hover:bg-zinc-800 hover:text-white">{t('app.help')}</button>
            {(currentPage === 'lobby' || currentPage === 'game') &&
              <button type="button" onClick={() => socket.emit('logout')} className="rounded-md px-3 py-1.5 text-sm font-medium text-red-300 transition hover:bg-zinc-800 hover:text-red-200">{t('app.leaveGame')}</button>
            }
          </nav>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl px-4 pb-24 pt-8 sm:px-6">
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
          roles={roles}
          config={config}
          setConfig={setConfig}
          onCustomDataChange={(customPlaces, customRoles) => {
            ownCustomPlaces = customPlaces
            ownCustomRoles = customRoles
            rebuildData()
          }}
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
          round={round}
          questionLog={questionLog}
          extensionUsed={extensionUsed}
          extensionVote={extensionVote}
          accuserUserID={accuserUserID}
          socket={socket}
        />

        <ResultsModal
          show={showResultsModal}
          setShow={setShowResultsModal}

          spy={spy}
          selectedPlace={selectedPlace}
          winDescripton={winDescription}
          round={round}
          isLeader={currentUserID === leaderUserID}
          onNextRound={() => socket.emit('next-round')}
          winner={winner}
        />

        <HelpModal
          show={showHelpModal}
          setShow={setShowHelpModal}
        />
      </main>
    </>
  );
}

export default App;
