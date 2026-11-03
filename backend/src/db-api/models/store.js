import fsp from 'fs/promises'
import path from 'path'
import { fileURLToPath } from 'url'

// Os dados vivem em arquivos JSON na pasta `data`, na raiz do backend:
//   data/places.json      [{ id, name: { pt, en }, imgPath?, rolesIds, categoriesIds }]
//   data/roles.json       [{ id, name: { pt, en } }]
//   data/categories.json  [{ id, name: { pt, en } }]
// `name` é um objeto de traduções: a chave é o locale (ex.: 'pt', 'en')
// e o valor é o nome naquele idioma. 'pt' é obrigatório; sem 'en', ele
// herda o valor de 'pt'.
// DATA_DIR permite apontar para outro diretório (ex.: testes com dados
// temporários). Sem ela, usa a pasta `data` na raiz do backend.
export const dataDir = process.env.DATA_DIR
    ? path.resolve(process.env.DATA_DIR)
    : path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../../data')

const files = {
    places: 'places.json',
    roles: 'roles.json',
    categories: 'categories.json'
}

// Fila simples para serializar as escritas: assim duas requisições de
// escrita ao mesmo tempo não se sobrescrevem nem corrompem o arquivo.
let writeQueue = Promise.resolve()

function withWriteLock(fn) {
    const run = writeQueue.then(fn, fn)
    writeQueue = run.catch(() => {})
    return run
}

async function readCollection(name) {
    try {
        const content = await fsp.readFile(path.join(dataDir, files[name]), 'utf-8')
        return JSON.parse(content)
    } catch (error) {
        if (error.code === 'ENOENT') {
            return []
        }
        throw error
    }
}

async function writeCollection(name, items) {
    await fsp.mkdir(dataDir, { recursive: true })
    const filePath = path.join(dataDir, files[name])
    const tmpPath = `${filePath}.tmp`
    // Escreve em arquivo temporário e renomeia, para nunca deixar o
    // arquivo principal pela metade em caso de erro no meio da escrita.
    await fsp.writeFile(tmpPath, JSON.stringify(items, null, 2) + '\n', 'utf-8')
    await fsp.rename(tmpPath, filePath)
}

export async function getCollection(name) {
    return readCollection(name)
}

// Lê a coleção, aplica `updater(items)` (que pode mutar o array e deve
// retornar o valor a ser devolvido) e salva o resultado, tudo sob a fila
// de escrita. Em caso de erro dentro do updater, nada é salvo.
export async function updateCollection(name, updater) {
    return withWriteLock(async () => {
        const items = await readCollection(name)
        const result = await updater(items)
        await writeCollection(name, items)
        return result
    })
}

// Remove de `places.json` as referências a um cargo/categoria apagado,
// como a chave estrangeira com CASCADE fazia no Postgres.
export async function removePlaceReferences(field, id) {
    await updateCollection('places', (places) => {
        for (const place of places) {
            place[field] = place[field].filter((refId) => refId !== id)
        }
    })
}

export function nextId(items) {
    return items.reduce((max, item) => Math.max(max, item.id), 0) + 1
}

// Normaliza o `name` recebido (objeto de traduções, ou sua forma em
// string JSON, como chega no formulário multipart de lugares) para o
// formato canônico { pt, en, ... }. Retorna null se não houver um
// nome válido em português.
export function normalizeName(value) {
    let raw = value
    if (typeof raw === 'string') {
        const trimmed = raw.trim()
        if (!trimmed.startsWith('{')) {
            return null
        }
        try {
            raw = JSON.parse(trimmed)
        } catch {
            return null
        }
    }
    if (!raw || typeof raw !== 'object' || Array.isArray(raw)) {
        return null
    }
    const pt = typeof raw.pt === 'string' ? raw.pt.trim() : ''
    if (!pt) {
        return null
    }
    const name = { pt, en: (typeof raw.en === 'string' && raw.en.trim()) ? raw.en.trim() : pt }
    for (const [locale, text] of Object.entries(raw)) {
        if (locale !== 'pt' && locale !== 'en' && typeof text === 'string' && text.trim()) {
            name[locale] = text.trim()
        }
    }
    return name
}

export function assertUniqueName(items, name, exceptId = null) {
    const locales = Object.keys(name ?? {})
    const conflict = items.find((item) =>
        item.id !== exceptId && item.name &&
        locales.some((locale) => item.name[locale] && item.name[locale] === name[locale])
    )
    if (conflict) {
        throw new Error(`name must be unique: "${name.pt ?? locales.map((l) => name[l])[0]}" is already in use`)
    }
}

export function findById(items, id) {
    const item = items.find((item) => item.id === id)
    if (!item) {
        throw new Error(`No item found with id ${id}`)
    }
    return item
}
{}