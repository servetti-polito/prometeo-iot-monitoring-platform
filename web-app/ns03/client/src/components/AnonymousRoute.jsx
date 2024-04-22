import React from "react";
import { Outlet } from "react-router-dom";
import { Col, Container, Row } from "react-bootstrap";

export default function AnonymousRoute(props) {
  
  if (localStorage.getItem("loading") === "true")
    return (
      <Container>
        <Row className="h-100 align-items-center">
          <Col>
            <h1 className="text-center"> Loading... </h1>
          </Col>
        </Row>
      </Container>
    );

  return props.anon || props.logged ? <Outlet /> : <>{window.location.assign("/auth/login?redirect="+ window.location.href.replace(window.location.origin, "")
  )}</>;
  // return <Outlet />
}
