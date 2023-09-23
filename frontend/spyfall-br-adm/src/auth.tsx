import React from 'react';
import ReactDOM from 'react-dom/client';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import 'bootstrap/dist/css/bootstrap.min.css';
import './auth.css';




const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);


root.render(
    <div className="center">
      <Form action={process.env.PUBLIC_URL + '/login'} method="post">
        <Form.Group controlId="password">
          <Form.Label>Password</Form.Label>
          <Form.Control
            type="password"
            placeholder="Enter your password"
            name="password"
          />
        </Form.Group>
        <Button variant="primary" type="submit" className="mt-2">
          Submit
        </Button>
      </Form>
    </div>
);
