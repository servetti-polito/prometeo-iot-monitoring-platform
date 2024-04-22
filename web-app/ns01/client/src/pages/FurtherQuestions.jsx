import "bootstrap/dist/css/bootstrap.min.css";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { Alert, Spinner, Container, Row, Col } from "react-bootstrap";
import "../CSS/App.css";
import API from "../API/API";

export default function FurtherQuestions(props) {
  let navigate = useNavigate();
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!localStorage.getItem("completedSurvey")) {
      navigate("/");
    }
    setLoading(true);
    API.submitAnswers(props.answers)
      .then(() => {
        props.setAnswers(null);
        setLoading(false);
      })
      .catch((err) => {
        setLoading(false);
        setError(
          props.ita
            ? "Si è verificato un errore: " + JSON.stringify(err.response)
            : "An error occourred: " + JSON.stringify(err.response)
        );
      });
  }, []);

  return (
    <Container>
      <Row className="h-25" />
      <Row className="h-25 align-items-center m-5">
        {error === null ? <></> : <Alert variant="danger">{error}</Alert>}
        <Col md={12}>
          <h1 className="text-center pb-3 mb-5 orange-border-bottom">
            {props.ita
              ? "Grazie per le tue risposte!"
              : "Thank you for your answers!"}
          </h1>
          <h3 className="text-center">
            {props.ita
              ? "Vuoi creare un account per essere aggiornato sulle condizioni ambientali dell’ambiente in cui ti trovi?"
              : "Would you like to create an account to be updated on the environmental conditions of your office? "}
          </h3>
        </Col>
        <Row className="h-25" />
        <Row className="d-flex justify-content-between align-items-center text-align-center">
          <Col md={6} className="text-center">
            <button
              onClick={() => navigate("/personal")}
              className="btn btn-lg btn-secondary w-50"
              disabled={loading}
            >
              {loading ? (
                <Spinner animation="border" hidden={!loading} />
              ) : props.ita ? (
                "Non adesso"
              ) : (
                "Not now"
              )}
            </button>
          </Col>
          <Col md={6} className="text-center">
            <button
              onClick={() => window.location.assign("/auth/login?redirect=/")}
              className="btn btn-lg btn-primary w-80"
            >
              {props.ita ? "Crea un account" : "Create an account"}
            </button>
          </Col>
        </Row>
      </Row>
    </Container>
  );
}
