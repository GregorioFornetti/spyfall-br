import React, { useState, useEffect } from 'react';
import Container from 'react-bootstrap/Container';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import 'bootstrap/dist/css/bootstrap.min.css';
import Role from './interfaces/RoleInterface'
import Place from './interfaces/PlaceInterface'
import Category from './interfaces/CategoryInterface'
import ModalRole from './components/ModalRole';
import ModalPlace from './components/ModalPlace';
import ModalCategory from './components/ModalCategory';
import './App.css';
import Row from 'react-bootstrap/Row';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import Col from 'react-bootstrap/Col';
import SimpleCard from './components/SimpleCard';
import ModalProperties from './interfaces/ModalProperties';
import {serverURL} from './utils/configs'
import ModalLoading from './components/ModalLoading';
import axios from 'axios'

const buttonTittleMap = {
  role: "Criar novo cargo",
  place: "Criar novo local",
  category: "Criar nova categoria"
}

var placesGetCalled = false
var categoriesGetCalled = false
var rolesGetCalled = false
var pendingRequests = 3


function createEmptyRole(): Role {
  return {id: -1, name: ''}
}

function createEmptyPlace(): Place {
  return {id: -1, name: '', categoriesIds: [], rolesIds: []}
}

function createEmptyCategory(): Category {
  return {id: -1, name: ''}
}


function App() {
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState<"role"|"place"|"category">("place")
  const [filter, setFilter] = useState("")

  const [categories, setCategories] = useState<Category[]>([])
  const [roles, setRoles] = useState<Role[]>([])
  const [places, setPlaces] = useState<Place[]>([])
  useEffect(() => {
    if (!placesGetCalled) {
      placesGetCalled = true

      axios.get(`${serverURL}/places`)
      .then((response) => {
        let placesJSON = response.data as Place[]
        setPlaces(placesJSON.map((place) => {
          if (place.imgPath) {
            return {...place, imgPath: `${serverURL}/${place.imgPath}`}
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

      axios.get(`${serverURL}/categories`)
      .then((response) => {
        let categoriesJSON = response.data
        console.log(categoriesJSON)
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

      axios.get(`${serverURL}/roles`)
      .then((response) => {
        let rolesJSON = response.data
        console.log(rolesJSON)
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

  return (
    <>
      <header>
        <Navbar bg="dark" variant="dark" fixed="top">
          <Container>
            <Navbar.Brand href="#home">Spyfall admin</Navbar.Brand>
            <Nav className="me-auto">
              <Nav.Link 
                active={page === 'place'} 
                onClick={() => {
                  setPage("place")
                  setFilter("")
                }}
              >
                Locais
              </Nav.Link>
              <Nav.Link
                active={page === 'role'}
                onClick={() => {
                  setPage("role")
                  setFilter("")
                }}
              >
                Cargos
              </Nav.Link>
              <Nav.Link
                active={page === 'category'}
                onClick={() => {
                  setPage("category")
                  setFilter("")
                }}
              >
                Categorias
              </Nav.Link>
            </Nav>
          </Container>
        </Navbar>
      </header>


      <main>
        <Container fluid="md">
          <Row className="justify-content-center mb-2">
            <Col xxl={5} xl={6} lg={7} md={8} sm={9} xs={10}>
              <Form.Control 
                type="text" 
                placeholder='Filtro...'
                value={filter}
                onChange={(event) => {setFilter(event.target.value)}}
              />
            </Col>
          </Row>
          <Row className="justify-content-center mb-5">
            <Col xxl={3} xl={4} lg={5} md={6} sm={7} xs={8}>
              <div className="d-grid">
                  <Button
                    variant="success"
                    onClick={() => {
                      if (page === 'category') {
                        setModalCategoryProperties({
                          show: true,
                          type: "create",
                          currentValue: createEmptyCategory()
                        })
                      } else if (page === 'place') {
                        setModalPlaceProperties({
                          show: true,
                          type: "create",
                          currentValue: createEmptyPlace()
                        })
                      } else if (page === 'role') {
                        setModalRoleProperties({
                          show: true,
                          type: "create",
                          currentValue: createEmptyRole()
                        })
                      }
                    }}
                  >
                    {buttonTittleMap[page]}
                  </Button>
              </div>
            </Col>
          </Row>
        </Container>


        <Container fluid="md" className={(page === 'place') ? ('') : ("d-none")}>
          <Row xl={5} lg={4} md={3} sm={2} className={"gy-5 gx-4"}>
            {places
            .filter((place) => place.name.toLowerCase().startsWith(filter.toLowerCase()))
            .map((place) => (
              <SimpleCard
                name={place.name}
                updateFunction={() => {
                  setModalPlaceProperties({
                    show: true,
                    type: "update",
                    currentValue: {...place}
                  })
                }}
                deleteFunction={() => {
                  setModalPlaceProperties({
                    show: true,
                    type: "delete",
                    currentValue: place
                  })
                }}
              />
            ))}
          </Row>
        </Container>

        <Container fluid="md" className={(page === 'role') ? ('') : ("d-none")}>
          <Row xl={5} lg={4} md={3} sm={2} className={"gy-5 gx-4"}>
            {roles
            .filter((role) => role.name.toLowerCase().startsWith(filter.toLowerCase()))
            .map((role) => (
              <SimpleCard
                name={role.name}
                updateFunction={() => {
                  setModalRoleProperties({
                    show: true,
                    type: "update",
                    currentValue: {...role}
                  })
                }}
                deleteFunction={() => {
                  setModalRoleProperties({
                    show: true,
                    type: "delete",
                    currentValue: role
                  })
                }}
              />
            ))}
          </Row>
        </Container>
        
        <Container fluid="md" className={(page === 'category') ? ('') : ("d-none")}>
          <Row xl={5} lg={4} md={3} sm={2} className={"gy-5 gx-4"}>
            {categories
            .filter((category) => category.name.toLowerCase().startsWith(filter.toLowerCase()))
            .map((category) => (
              <SimpleCard
                name={category.name}
                updateFunction={() => {
                  setModalCategoryProperties({
                    show: true,
                    type: "update",
                    currentValue: {...category}
                  })
                }}
                deleteFunction={() => {
                  setModalCategoryProperties({
                    show: true,
                    type: "delete",
                    currentValue: category
                  })
                }}
              />
            ))}
          </Row>
        </Container>

        
        <ModalRole
          modalRoleProperties={modalRoleProperties}
          setModalRoleProperties={setModalRoleProperties}
          setRoles={setRoles}
          roles={roles}
        />

        <ModalPlace
          modalPlaceProperties={modalPlaceProperties}
          setModalPlaceProperties={setModalPlaceProperties}
          setPlaces={setPlaces}
          places={places}
          categories={categories}
          roles={roles}
        />

        <ModalCategory
          setModalCategoryProperties={setModalCategoryProperties}
          modalCategoryProperties={modalCategoryProperties}
          setCategories={setCategories}
          categories={categories}
        />

        <ModalLoading
          show={loading}
        />
      </main>
    </>
  );
}

export default App;
