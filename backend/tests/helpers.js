import fs from 'fs'
import os from 'os'
import path from 'path'

export const seed = {
    places: [
        { id: 1, name: { pt: 'Casa', en: 'House' }, imgPath: 'placeImgs/casa.png', rolesIds: [10, 11], categoriesIds: [20] },
        { id: 2, name: { pt: 'Avião', en: 'Airplane' }, rolesIds: [10, 12], categoriesIds: [20, 21] },
        { id: 3, name: { pt: 'Circo', en: 'Circus' }, rolesIds: [13], categoriesIds: [21] }
    ],
    roles: [
        { id: 10, name: { pt: 'Piloto', en: 'Pilot' } },
        { id: 11, name: { pt: 'Morador', en: 'Resident' } },
        { id: 12, name: { pt: 'Passageiro', en: 'Passenger' } },
        { id: 13, name: { pt: 'Palhaço', en: 'Clown' } }
    ],
    categories: [
        { id: 20, name: { pt: 'Transporte', en: 'Transportation' } },
        { id: 21, name: { pt: 'Lazer', en: 'Leisure' } }
    ]
}

// Aponta DATA_DIR para um diretório temporário por processo de teste e
// (re)semeia os arquivos JSON a cada chamada, restaurando o estado inicial
// entre testes. O diretório é fixo por processo porque o store resolve
// DATA_DIR uma única vez, na importação do módulo (por isso os testes
// usam import dinâmico depois desta chamada).
let sharedDir = null
export function useTempDataDir(t, data = seed) {
    if (!sharedDir) {
        sharedDir = fs.mkdtempSync(path.join(os.tmpdir(), 'spyfall-data-'))
        process.env.DATA_DIR = sharedDir
        process.on('exit', () => fs.rmSync(sharedDir, { recursive: true, force: true }))
    }
    for (const name of ['places', 'roles', 'categories']) {
        fs.writeFileSync(path.join(sharedDir, `${name}.json`), JSON.stringify(data[name], null, 2) + '\n')
    }
    return sharedDir
}

export function readDataFile(dir, name) {
    return JSON.parse(fs.readFileSync(path.join(dir, `${name}.json`), 'utf-8'))
}

// Resposta Express falsa, que registra status e corpo.
export function fakeRes() {
    return {
        statusCode: null,
        body: null,
        status(code) { this.statusCode = code; return this },
        json(payload) { this.body = payload; return this }
    }
}

export function fakeReq({ body = {}, params = {} } = {}) {
    return { body, params }
}

// Socket falso (socket.io): registra eventos recebidos via emit e
// permite disparar os eventos registrados via on.
export function fakeSocket(id = 'socket-1') {
    const handlers = {}
    return {
        id,
        sessionID: null,
        userID: null,
        handshake: { auth: {} },
        emitted: [],
        handlers,
        on(event, fn) { handlers[event] = fn },
        emit(event, ...args) { this.emitted.push([event, ...args]) },
        async trigger(event, ...args) { return handlers[event](...args) }
    }
}

// io falso: io.to(socketID).emit(...) registra [socketID, event, ...args].
export function fakeIo() {
    const sent = []
    return {
        sent,
        to(socketID) {
            return { emit: (event, ...args) => sent.push([socketID, event, ...args]) }
        }
    }
}

export function fakeUser(socketID, userID) {
    return { socketID, userID, game: null, online: true }
}
