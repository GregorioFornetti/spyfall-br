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

const buttonTittleMap = {
  "role": "Criar novo cargo",
  "place": "Criar novo local",
  "category": "Criar nova categoria"
}


function createEmptyRole(): Role {
  return {id: -1, name: ''}
}

function createEmptyPlace(): Place {
  return {id: -1, name: '', selectedCategoriesIds: [], selectedRolesIds: []}
}

function createEmptyCategory(): Category {
  return {id: -1, name: ''}
}


function App() {
  const [page, setPage] = useState<"role"|"place"|"category">("place")
  const [filter, setFilter] = useState("")

  const [categories, setCategories] = useState<Category[]>([
    {id: 1, name: "Casual"},
    {id: 2, name: "Apenas adultos"}
  ])
  const [roles, setRoles] = useState<Role[]>([
    {id: 1, name: "Cozinheiro"},
    {id: 2, name: "Marinheiro"}
  ])


  const [showModalRole, setShowModalRole] = useState(false)
  const [role, setRole] = useState<Role>(createEmptyRole())
  const [modalRoleType, setModalRoleType] = useState<"create"|"update"|"delete">("create")

  const [showModalPlace, setShowModalPlace] = useState(false)
  const [place, setPlace] = useState<Place>(createEmptyPlace())

  const [showModalCategory, setShowModalCategory] = useState(false)
  const [category, setCategory] = useState<Category>(createEmptyCategory())

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
                        setCategory(createEmptyCategory())
                        setShowModalCategory(true)
                      } else if (page === 'place') {
                        setPlace(createEmptyPlace())
                        setShowModalPlace(true)
                      } else if (page === 'role') {
                        setRole(createEmptyRole())
                        setShowModalRole(true)
                      }
                    }}
                  >
                    {buttonTittleMap[page]}
                  </Button>
              </div>
            </Col>
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
                  setRole(role)
                  setShowModalRole(true)
                }}
                deleteFunction={() => {
                  // Chamar a remoção do cargo do backend AQUI
                  
                  // Remoção do cargo no frontend
                  setRoles(roles.filter((roleParam) => role !== roleParam))
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
                  setCategory(category)
                  setShowModalCategory(true)
                }}
                deleteFunction={() => {
                  // Chamar a remoção da categoria do backend AQUI
                  
                  // Remoção da categoria no frontend
                  setCategories(categories.filter((categoryParam) => category !== categoryParam))
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
