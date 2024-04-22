import "bootstrap/dist/css/bootstrap.min.css";
import { useNavigate } from "react-router-dom";
import {
  Alert,
  Button,
  Spinner,
  Pagination,
  Container,
  Row,
  Col,
} from "react-bootstrap";
import { useEffect, useState } from "react";
import "../CSS/Profile.css";
import "../CSS/App.css";
import API from "../API/API";

let MAXPAGES;

export default function Profile(props) {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [list, setList] = useState([]);
  const [page, setPage] = useState(0);
  //navigation
  let navigate = useNavigate();

  //page update
  function listUpdate() {
    let result = "";
    if (list.length === 0) {
      let text = "No data collected";
      if (props.ita) text = "Nessun dato";
      return (
        '<div className="row text-center"><p style="width:\'100%\'; border-bottom: 1px solid #ff9724;"}}>' +
        text +
        "</p></div>"
      );
    }
    list.sort((a, b) =>
      a.timestamp < b.timestamp ? 1 : b.timestamp < a.timestamp ? -1 : 0
    );
    let listOut = [];
    for (let i = 0; i < 10; i++) {
      if (list[page * 10 + i] === undefined) break;
      listOut.push(list[page * 10 + i]);
    }
    listOut.map(
      (it) =>
        (result +=
          "<div className=\"row text-center\"><h3 id='surveyTime' style=\"width:'100%'; border-bottom: 1px solid #ff9724;\"}}>" +
          new Date(it.timestamp).toLocaleString(props.ita ? "it" : "en") +
          " - " +
          (props.ita ? "Sensore: " : "Sensor: ") +
          it.boardID +
          "</h3></div>")
    );
    return result;
  }
  useEffect(() => {
    setLoading(true);
    API.getSurveys(localStorage.getItem("email"))
      .then(async (data) => {
        setList(data);
        MAXPAGES =
          data.length % 10 === 0
            ? data.length / 10
            : Math.floor(data.length / 10) + 1;
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setError("get fail:" + err);
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    if (document.getElementById("list") === null) return;
    document.getElementById("list").innerHTML = listUpdate();
  }, [list, page]);

  return (
    <Container id="Profile" className="text-center">
      <Row className="p-4">
        <Col xs={12} className="text-align-center orange-border-bottom">
          <h1 className="title" id="profileTitle">
            {props.ita ? "Benvenuto " : "Welcome "}
            {localStorage.getItem("username")}
          </h1>
        </Col>
      </Row>

      <Row className="h-75 text-align-center m-1">
        <Col xs={2} />
        <Col xs={8}>
          <Row className="text-center orange-border-bottom mb-2">
            <h1 className="title w-100" id="profileTitle">
              {props.ita ? "Risposte ai sondaggi" : "Survey answers"}
            </h1>
          </Row>
          {error !== "" ? <Alert variant="danger">{error}</Alert> : null}
          {loading ? (
            <Spinner animation="border" variant="dark" />
          ) : (
            <div id="list" />
          )}
        </Col>
        <Col md={2} />
      </Row>
      <Row className="text-center">
        {MAXPAGES > 1 ? (
          <Pagination
            className="d-flex justify-content-center"
            style={{ position: "fixed", bottom: "10%" }}
          >
            <Pagination.Prev
              disabled={page <= 0}
              onClick={() => setPage(page - 1)}
            />
            <div className="w-30" />
            <Pagination.Next
              disabled={page >= MAXPAGES - 1}
              onClick={() => setPage(page + 1)}
            />
          </Pagination>
        ) : null}
      </Row>
    
    </Container>
  );
}
