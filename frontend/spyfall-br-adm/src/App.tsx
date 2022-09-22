import React, { useState } from 'react';
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

const buttoTitleMap = {
  "role": "Criar novo cargo",
  "place": "Criar novo local",
  "category": "Criar nova categoria"
}

const roles: Role[] = [
  {id: 1, name: "Cozinheiro"},
  {id: 2, name: "Marinheiro"}
]

function App() {
  const [page, setPage] = useState<"role"|"place"|"category">("place")
  const [filter, setFilter] = useState("")

  const [showModalRole, setShowModalRole] = useState(false)
  const [role, setRole] = useState<Role>({id: -1, name: ""})

  const [showModalPlace, setShowModalPlace] = useState(false)
  const [place, setPlace] = useState<Place>({id: -1, name: "", selectedRolesIds: [], selectedCategoriesIds: []})

  const [showModalCategory, setShowModalCategory] = useState(false)
  const [category, setCategory] = useState<Category>({id: -1, name: ""})

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
                        setShowModalCategory(true)
                      } else if (page === 'place') {
                        setShowModalPlace(true)
                      } else if (page === 'role') {
                        setShowModalRole(true)
                      }
                    }}
                  >
                    {buttoTitleMap[page]}
                  </Button>
              </div>
            </Col>
          </Row>
        </Container>

        <Container fluid="md">
          <Row xl={5} lg={4} md={3} sm={2} className={"gy-5 gx-4"}>
            {roles.map((role) => (
              <SimpleCard
                name={role.name}
                updateFunction={() => {

                }}
                deleteFunction={() => {

                }}
              />
            ))}
          </Row>
        </Container>

        <ModalRole
          showModalRole={showModalRole}
          setShowModalRole={setShowModalRole}
          type="create"
          role={role}
          setRole={setRole}
        />

        <ModalPlace
          showModalPlace={showModalPlace}
          setShowModalPlace={setShowModalPlace}
          type="create"
          place={place}
          setPlace={setPlace}
        />

        <ModalCategory
          showModalCategory={showModalCategory}
          setShowModalCategory={setShowModalCategory}
          type="create"
          category={category}
          setCategory={setCategory}
        />
      </main>
    </>
  );
}

export default App;
