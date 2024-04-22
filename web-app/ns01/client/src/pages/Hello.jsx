import "../CSS/Hello.css";
import "bootstrap/dist/css/bootstrap.min.css";
import { Container, Row, Col } from "react-bootstrap";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { PrivacyModal } from "../components/PrivacyModal";
import Cookies from "js-cookie";

const authenticationPath = "/auth/login?redirect=/";

export default function Hello(props) {
  const navigate = useNavigate();

  const toggleLanguage = () => {
    let curr = props.ita;
    props.setIta(!curr);
  };

  const [show, setShow] = useState(false);

  return (
    <Container className="bg-orange">
      <Row className="h-10">
        <Row className="p-4 align-items-end d-flex">
          <Col md={6}>
            {
              <Row>
                <Col>
                  <h4 onClick={toggleLanguage} role="button">
                    {props.ita ? <b>ITA</b> : "ITA"} |{" "}
                    {props.ita ? "ENG" : <b>ENG</b>}
                  </h4>
                </Col>
              </Row>
            }
          </Col>
          <Col
            md={6}
            className="text-right d-flex justify-content-end"
          >
            {props.logged && !props.anon ? (
              <>
                <h4 className="display-inline-block me-4">
                  {props.ita ? "Ciao" : "Hello"},{" "}
                  {localStorage.getItem("email")}
                </h4>

                <h4
                  onClick={props.doLogout}
                  role="button"
                  className="display-inline-block underline"
                >
                  {" "}
                  Log out
                </h4>
              </>) :
              (<>
              <h4
                  onClick={() => window.location.assign(authenticationPath)}
                  role="button"
                  className="display-inline-block underline"
                >
                  {props.ita ? "Accedi" : "Login"}
                </h4>
              </>
            )}
          </Col>
        </Row>
      </Row>
      <Row className="align-items-center">
        <Col md={12} className="mt-2 mb-2 bg-white">
          <h1
            id="prometeoTitle"
            className="display-1 text-center mt-3 mb-3 orange ink-free"
          >
            PROMET&O
          </h1>
        </Col>
        <Col md={12} className="p-4">
          <h2 className="display-3 text-center white">
            {props.ita
              ? "Benvenuto al sondaggio sulla"
              : "Welcome to the questionnaire of"}
            <br />{" "}
            {props.ita
              ? "qualità dell'ambiente interno!"
              : "Indoor Environmental Quality!"}
          </h2>
        </Col>
        {(props.logged || props.anon) && (
          <>
            <Row className="gap-2">
              <Col md={3} xs={1} />
              <Col md={6} xs={10} className="d-grid">
                <button
                  className="btn glow-button btn-lg btn-white orange text-lg"
                  type="button"
                  onClick={() => navigate("/survey")}
                >
                  {props.ita
                    ? "Inizia il sondaggio"
                    : "Start the questionnaire"}
                </button>
                <p className="text-center" style={{ margin: 0, color: "#fff" }}>
                  {props.ita
                    ? "Tempo di completamento stimato: 2-5 min"
                    : "Estimated completion time: 2-5 min"}
                </p>
              </Col>
              <Col lg={2} xs={1} />
            </Row>
            <div className={"p-2"} />
          </>
        )}
      
        <Row className="gap-2">
          <Col md={3} xs={1} />
          <Col md={6} xs={10} className="d-grid">
            {props.logged && !props.anon ? (
              <button
                className="btn btn-lg btn-white text-lg orange"
                type="button"
                onClick={() => navigate("/profile")}
              >
                {props.ita ? "Profilo" : "Profile"}
              </button>
            ) : Cookies.get("Role") === "Private" && (
                <button
                className="btn btn-lg btn-white text-lg orange"
                type="button"
                onClick={() => navigate("/dashboard")}
              >
                {"Dashboard"}
              </button>
            )}
          </Col>
          <Col lg={2} xs={1} />
        </Row>
      </Row>

      <h4
        onClick={() => setShow(true)}
        role="button"
        className={"privacy underline text-lg"}
      >
        Privacy
      </h4>

      {show && <PrivacyModal show={show} setShowModal={setShow} />}
    </Container>
  );
}
