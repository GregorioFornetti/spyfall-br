import { test } from 'node:test'
import assert from 'node:assert/strict'
import { spawn } from 'child_process'
import path from 'path'
import { fileURLToPath } from 'url'
import { useTempDataDir } from './helpers.js'

const backendDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const GAME_PORT = 3100
const ADM_PORT = 3101

async function waitForServer(url, child, t) {
    const deadline = Date.now() + 15000
    let output = ''
    child.stdout.on('data', (d) => { output += d })
    child.stderr.on('data', (d) => { output += d })
    while (Date.now() < deadline) {
        if (child.exitCode !== null) {
            throw new Error(`servidor encerrou antes de subir:\n${output}`)
        }
        try {
            const res = await fetch(url)
            if (res.status > 0) return
        } catch { /* ainda subindo */ }
        await new Promise((r) => setTimeout(r, 100))
    }
    throw new Error(`servidor não respondeu a tempo:\n${output}`)
}

function startServer(t, script, env) {
    const child = spawn(process.execPath, [script], {
        cwd: backendDir,
        env: { ...process.env, NODE_ENV: 'production', ...env },
        stdio: ['ignore', 'pipe', 'pipe']
    })
    t.after(() => { child.kill('SIGKILL') })
    return child
}

test('servidores reais: jogo somente-leitura e administração sem senha', async (t) => {
    const dir = useTempDataDir(t)
    const baseEnv = {
        GAME_PATH: '/spyfall', ADM_PATH: '/spyfall/adm', DB_PATH: '/spyfall/db',
        DATA_DIR: dir
    }

    const game = startServer(t, 'src/index.js', { ...baseEnv, PORT: String(GAME_PORT) })
    const adm = startServer(t, 'src/admServer.js', { ...baseEnv, ADM_PORT: String(ADM_PORT) })
    await waitForServer(`http://localhost:${GAME_PORT}/spyfall/db/places`, game, t)
    await waitForServer(`http://localhost:${ADM_PORT}/spyfall/db/places`, adm, t)

    const gameApi = `http://localhost:${GAME_PORT}/spyfall/db`
    const admApi = `http://localhost:${ADM_PORT}/spyfall/db`

    await t.test('jogo lê os dados, administração tem escrita completa sem autenticação', async () => {
        const places = await (await fetch(`${gameApi}/places`)).json()
        assert.equal(places.length, 3)

        const created = await fetch(`${admApi}/roles`, {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name: { pt: 'Cargo via HTTP', en: 'Role via HTTP' } })
        })
        assert.equal(created.status, 200)
        const role = await created.json()

        // o jogo enxerga a escrita da administração (mesmos arquivos JSON)
        const roles = await (await fetch(`${gameApi}/roles`)).json()
        assert.ok(roles.some((r) => r.id === role.id))

        const deleted = await fetch(`${admApi}/roles/${role.id}`, { method: 'DELETE' })
        assert.equal(deleted.status, 200)
        const rolesAfter = await (await fetch(`${gameApi}/roles`)).json()
        assert.ok(!rolesAfter.some((r) => r.id === role.id))
    })

    await t.test('jogo rejeita escrita com 405 e não serve a administração', async () => {
        const post = await fetch(`${gameApi}/roles`, {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name: 'Não deve criar' })
        })
        assert.equal(post.status, 405)

        const del = await fetch(`${gameApi}/roles/10`, { method: 'DELETE' })
        assert.equal(del.status, 405)

        const put = await fetch(`${gameApi}/categories/20`, {
            method: 'PUT', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name: 'X' })
        })
        assert.equal(put.status, 405)

        const admPage = await fetch(`http://localhost:${GAME_PORT}/spyfall/adm`)
        assert.equal(admPage.status, 404)

        const roles = await (await fetch(`${gameApi}/roles`)).json()
        assert.ok(!roles.some((r) => r.name && r.name.pt === 'Não deve criar'))
    })
})
