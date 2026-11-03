import React, { useState, useEffect } from 'react';
import Role from './interfaces/RoleInterface'
import Place from './interfaces/PlaceInterface'
import Category from './interfaces/CategoryInterface'
import ModalRole from './components/ModalRole';
import ModalPlace from './components/ModalPlace';
import ModalCategory from './components/ModalCategory';
import SimpleCard from './components/SimpleCard';
import ModalProperties from './interfaces/ModalProperties';
import { dbPath } from './utils/configs'
import ModalLoading from './components/ModalLoading';
import axios from 'axios'
import { createEmptyCategory, createEmptyPlace, createEmptyRole, displayName, getCategoryById, getRoleById } from './utils/utils';

const buttonTitleMap = {
  role: "Criar novo cargo",
  place: "Criar novo local",
  category: "Criar nova categoria"
}

const tabs = [
  { key: 'place', label: 'Locais' },
  { key: 'role', label: 'Cargos' },
  { key: 'category', label: 'Categorias' }
] as const

type Page = typeof tabs[number]['key']

var placesGetCalled = false
var categoriesGetCalled = false
var rolesGetCalled = false
var pendingRequests = 3


function App() {
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState<Page>("place")
  const [filter, setFilter] = useState("")

  const [categories, setCategories] = useState<Category[]>([])
  const [roles, setRoles] = useState<Role[]>([])
  const [places, setPlaces] = useState<Place[]>([])
  useEffect(() => {
    if (!placesGetCalled) {
      placesGetCalled = true

      axios.get(`${dbPath}/places`)
      .then((response) => {
        let placesJSON = response.data as Place[]
        setPlaces(placesJSON.map((place) => {
          if (place.imgPath) {
            return {...place, imgPath: `${dbPath}/${place.imgPath}`}
          }
          return place
        }))

        pendingRequests--
        if (pendingRequests === 0) {
          setLoading(false)
        }
      })
    }
  }, [])

  useEffect(() => {
    if (!categoriesGetCalled) {
      categoriesGetCalled = true

      axios.get(`${dbPath}/categories`)
      .then((response) => {
        let categoriesJSON = response.data
        setCategories(categoriesJSON)

        pendingRequests--
        if (pendingRequests === 0) {
          setLoading(false)
        }
      })
    }
  }, [])

  useEffect(() => {
    if (!rolesGetCalled) {
      rolesGetCalled = true

      axios.get(`${dbPath}/roles`)
      .then((response) => {
        let rolesJSON = response.data
        setRoles(rolesJSON)

        pendingRequests--
        if (pendingRequests === 0) {
          setLoading(false)
        }
      })
    }
  }, [])



  const [modalRoleProperties, setModalRoleProperties] = useState<ModalProperties<Role>>({
    show: false,
    type: "create",
    currentValue: createEmptyRole()
  })
  const [modalPlaceProperties, setModalPlaceProperties] = useState<ModalProperties<Place>>({
    show: false,
    type: "create",
    currentValue: createEmptyPlace()
  })
  const [modalCategoryProperties, setModalCategoryProperties] = useState<ModalProperties<Category>>({
    show: false,
    type: "create",
    currentValue: createEmptyCategory()
  })

  const counts: Record<Page, number> = { place: places.length, role: roles.length, category: categories.length }
  const matches = (name: Place['name']) => Object.values(name).some((text) => text.toLowerCase().startsWith(filter.toLowerCase()))
  const filteredPlaces = places.filter((place) => matches(place.name))
  const filteredRoles = roles.filter((role) => matches(role.name))
  const filteredCategories = categories.filter((category) => matches(category.name))
  const visibleCount = page === 'place' ? filteredPlaces.length : page === 'role' ? filteredRoles.length : filteredCategories.length

  const createNew = () => {
    if (page === 'category') {
      setModalCategoryProperties({ show: true, type: "create", currentValue: createEmptyCategory() })
    } else if (page === 'place') {
      setModalPlaceProperties({ show: true, type: "create", currentValue: createEmptyPlace() })
    } else {
      setModalRoleProperties({ show: true, type: "create", currentValue: createEmptyRole() })
    }
  }

  const placeMeta = (place: Place) => {
    const roleNames = place.rolesIds.map((id) => { const n = getRoleById(id, roles)?.name; return n ? displayName(n) : undefined }).filter(Boolean)
    const categoryNames = place.categoriesIds.map((id) => { const n = getCategoryById(id, categories)?.name; return n ? displayName(n) : undefined }).filter(Boolean)
    const parts = [
      `${place.rolesIds.length} cargo${place.rolesIds.length === 1 ? '' : 's'}`,
      `${place.categoriesIds.length} categoria${place.categoriesIds.length === 1 ? '' : 's'}`
    ]
    if (roleNames.length > 0) {
      parts.push(roleNames.slice(0, 3).join(', ') + (roleNames.length > 3 ? '...' : ''))
    }
    if (categoryNames.length > 0) {
      parts.push(categoryNames.join(', '))
    }
    return parts.join(' · ')
  }

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-40 bg-zinc-900 text-white shadow-md">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-x-6 gap-y-3 px-4 py-3 sm:px-6">
          <a href="#home" className="flex items-baseline gap-2 text-white no-underline">
            <span className="font-display text-xl font-bold tracking-tight">Spyfall</span>
            <span className="rounded bg-emerald-600 px-1.5 py-0.5 text-[11px] font-semibold uppercase tracking-wider">admin</span>
          </a>
          <nav className="flex gap-1" aria-label="Seções">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                type="button"
                onClick={() => { setPage(tab.key); setFilter("") }}
                aria-current={page === tab.key ? 'page' : undefined}
                className={`rounded-md px-3 py-1.5 text-sm font-medium transition ${
                  page === tab.key
                    ? 'bg-white text-zinc-900'
                    : 'text-zinc-300 hover:bg-zinc-800 hover:text-white'
                }`}
              >
                {tab.label}
                <span className={`ml-1.5 rounded-full px-1.5 py-0.5 text-[11px] font-semibold ${
                  page === tab.key ? 'bg-zinc-900 text-white' : 'bg-zinc-700 text-zinc-200'
                }`}>
                  {counts[tab.key]}
                </span>
              </button>
            ))}
          </nav>
        </div>
      </header>


      <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6">
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center">
          <label className="relative flex-1">
            <span className="sr-only">Filtrar por nome</span>
            <input
              type="text"
              placeholder="Filtrar por nome..."
              value={filter}
              onChange={(event) => { setFilter(event.target.value) }}
              className="w-full rounded-lg border border-zinc-300 bg-white py-2.5 pl-10 pr-9 text-sm shadow-sm outline-none transition placeholder:text-zinc-400 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20"
            />
            <svg className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
              <path fillRule="evenodd" d="M9 3.5a5.5 5.5 0 100 11 5.5 5.5 0 000-11zM2 9a7 7 0 1112.45 4.39l3.83 3.83a1 1 0 01-1.41 1.41l-3.83-3.83A7 7 0 012 9z" clipRule="evenodd" />
            </svg>
            {filter && (
              <button
                type="button"
                onClick={() => setFilter("")}
                aria-label="Limpar filtro"
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded px-1 text-lg leading-none text-zinc-400 hover:text-zinc-700"
              >
                &times;
              </button>
            )}
          </label>
          <button
            type="button"
            onClick={createNew}
            className="shrink-0 rounded-lg bg-emerald-700 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-emerald-800 focus:outline-none focus:ring-2 focus:ring-emerald-700 focus:ring-offset-2"
          >
            + {buttonTitleMap[page]}
          </button>
        </div>

        <p className="mb-4 text-sm text-zinc-500" role="status">
          {visibleCount} {visibleCount === 1 ? 'item' : 'itens'}
          {filter && <> para &ldquo;{filter}&rdquo;</>}
        </p>

        {visibleCount === 0 && !loading ? (
          <div className="rounded-lg border border-dashed border-zinc-300 bg-white px-6 py-14 text-center">
            <p className="text-base font-medium text-zinc-700">Nada encontrado</p>
            <p className="mt-1 text-sm text-zinc-500">
              {filter ? 'Tente outro termo ou limpe o filtro.' : 'Crie o primeiro item usando o botão acima.'}
            </p>
          </div>
        ) : page === 'place' ? (
          <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" aria-label="Locais">
            {filteredPlaces.map((place) => (
              <SimpleCard
                key={place.id}
                name={displayName(place.name)}
                imgURL={place.imgPath}
                meta={placeMeta(place)}
                updateFunction={() => {
                  setModalPlaceProperties({ show: true, type: "update", currentValue: {...place, name: {...place.name}} })
                }}
                deleteFunction={() => {
                  setModalPlaceProperties({ show: true, type: "delete", currentValue: place })
                }}
              />
            ))}
          </section>
        ) : page === 'role' ? (
          <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" aria-label="Cargos">
            {filteredRoles.map((role) => (
              <SimpleCard
                key={role.id}
                name={displayName(role.name)}
                updateFunction={() => {
                  setModalRoleProperties({ show: true, type: "update", currentValue: {...role, name: {...role.name}} })
                }}
                deleteFunction={() => {
                  setModalRoleProperties({ show: true, type: "delete", currentValue: role })
                }}
              />
            ))}
          </section>
        ) : (
          <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" aria-label="Categorias">
            {filteredCategories.map((category) => (
              <SimpleCard
                key={category.id}
                name={displayName(category.name)}
                updateFunction={() => {
                  setModalCategoryProperties({ show: true, type: "update", currentValue: {...category, name: {...category.name}} })
                }}
                deleteFunction={() => {
                  setModalCategoryProperties({ show: true, type: "delete", currentValue: category })
                }}
              />
            ))}
          </section>
        )}


        <ModalRole
          modalRoleProperties={modalRoleProperties}
          setModalRoleProperties={setModalRoleProperties}
          setRoles={setRoles}
          roles={roles}
          places={places}
          setPlaces={setPlaces}
        />

        <ModalPlace
          modalPlaceProperties={modalPlaceProperties}
          setModalPlaceProperties={setModalPlaceProperties}
          setPlaces={setPlaces}
          places={places}
          setCategories={setCategories}
          categories={categories}
          setRoles={setRoles}
          roles={roles}
        />

        <ModalCategory
          setModalCategoryProperties={setModalCategoryProperties}
          modalCategoryProperties={modalCategoryProperties}
          setCategories={setCategories}
          categories={categories}
          places={places}
          setPlaces={setPlaces}
        />

        <ModalLoading
          show={loading}
        />
      </main>
    </div>
  );
}

export default App;
