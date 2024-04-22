import "bootstrap/dist/css/bootstrap.min.css";
import "../CSS/dashboard.css";
import { useEffect, useState } from "react";
import { Container, Row, Col } from "react-bootstrap";
import measuresInfo from "../assets/measures.json";
import DashIframe from "../components/Dashboard/DashGauges";
import Legenda from "../components/Dashboard/Legenda";
import HintsMore from "../components/Dashboard/HintsMore";
import CompareGraphs from "../components/Dashboard/CompareGraphs";
import Clock from "../components/Dashboard/Clock";
import Compliances from "../components/Dashboard/Compilances";
import TimeButton from "../components/Dashboard/TimeButton";
import GraphFrame from "../components/Dashboard/GraphFrames";
import bToS from "../assets/boardIDtoSurvey.json";
import CompareGraphsList from "../components/Dashboard/CompareGraphsList";
import { useNavigate, useLocation } from "react-router-dom";
import { BoardIDModal } from "../components/BoardIDModal";

export default function Dashboard(props) {
  const navigate = useNavigate();
  const location = useLocation();
  const isBoardIDDefined = () => {
    return !(localStorage.getItem("boardID") == undefined ||
      !bToS.some((b) => b["boardID"] == localStorage.getItem("boardID")));
  };
  let [showGraph, setShowGraph] = useState(false);
  let [compareGraph, setCompareGraph] = useState(false);
  let [timeWindow, setTimeWindow] = useState("RT");
  let [topic, setTopic] = useState("init");
  let [RTValues, setRTValues] = useState({
    RH: "...",
    T: "...",
    Temp: "",
    Air: "",
    Sound: "",
    Light: "",
    IEQ: "",
    SPL: "...",
    VOC: "...",
    CO2: "...",
    CO: "...",
    PM10: "...",
    "PM2.5": "...",
    E: "...",
  });
  let [compareTopics, setCompareTopics] = useState([]);
  let [disableTopics, setDisableTopics] = useState(false);
  let [compareTime, setCompareTime] = useState([]);
  let [disableTime, setDisableTime] = useState(false);
  let [loading, setLoading] = useState(false);
  let [showModal, setShowModal] = useState(!isBoardIDDefined());

  const toggleGraph = () => {
    if (showGraph) {
      setCompareGraph(false);
      setCompareTopics([]);
      setCompareTime([]);
      setDisableTime(false);
      setDisableTopics(false);
    }
    setShowGraph(!showGraph);
  };
  const toggleCompare = () => {
    if (!compareGraph) {
      setDisableTopics(false);
      setDisableTime(false);
      setCompareTime([timeWindow]);
      setCompareTopics([topic === "init" ? "IEQ" : topic]);
    }
    setCompareGraph(!compareGraph);
  };
  const addCompareTopic = (newTopic) => {
    let tempTopics = compareTopics;
    if (tempTopics.includes(newTopic)) {
      let index = tempTopics.indexOf(newTopic);
      if (index > -1 && tempTopics.length > 1) tempTopics.splice(index, 1);
      if (tempTopics.length < 4) setDisableTopics(false);
      if (tempTopics.length < 2) setDisableTime(false);
    } else {
      tempTopics.push(newTopic);
      if (tempTopics.length >= 2) setDisableTime(true);
      if (tempTopics.length >= 4) setDisableTopics(true);
    }
    setCompareTopics([...tempTopics]);
  };
  const addCompareTime = (newTime) => {
    let tempTime = compareTime;
    if (tempTime.includes(newTime)) {
      let index = tempTime.indexOf(newTime);
      if (index > -1 && tempTime.length > 1) tempTime.splice(index, 1);
      if (tempTime.length < 4) setDisableTime(false);
      if (tempTime.length < 2) setDisableTopics(false);
    } else {
      tempTime.push(newTime);
      if (tempTime.length >= 4) setDisableTime(true);
      if (tempTime.length >= 2) setDisableTopics(true);
    }
    setCompareTime([...tempTime]);
  };

  useEffect(() => {
    const boardID = localStorage.getItem("boardID");
    if (boardID && location.search !== `boardID=${boardID}`) {
      navigate({ pathname: location.pathname, search: `boardID=${boardID}` });
    }
  }, [location.pathname, location.search, showModal]);

  return (
    <>
      <Container id="Dashboard">
        {showModal && <BoardIDModal showModal={showModal} setShowModal={setShowModal} ita={props.ita}/>}
        <Row className="h-100">
          <Col
            md={4}
            className="valuesContainer d-flex justify-content-between flex-column"
          >
            <div className="h-100">
              <Row style={{ height: "9%" }}>
                <h1 id="dashPrometeo">PROMET&O</h1>
              </Row>
              <Clock ita={props.ita} />
              {compareGraph ? (
                <Row className="mt-1">
                  <CompareGraphsList
                    measure={props.measure}
                    addCompareTopic={addCompareTopic}
                    compareTopics={compareTopics}
                    disableTopics={disableTopics}
                  />
                </Row>
              ) : (
                <>
                  <Row style={{ height: "45%" }}>
                    <h2 id="dashTitle">
                      {
                        measuresInfo[topic === "init" ? "IEQ" : topic][
                          "labelText"
                        ][props.ita ? "it" : "en"]
                      }
                    </h2>

                    <div id="dashExplain">
                      {
                        measuresInfo[topic === "init" ? "IEQ" : topic][
                          "description"
                        ][props.ita ? "it" : "en"]
                      }
                    </div>
                  </Row>
                </>
              )}
              {!showGraph && (
                <Compliances
                  compareGraph={compareGraph}
                  RTValues={RTValues}
                  setRTValues={setRTValues}
                  topic={topic}
                  timeWindow={timeWindow}
                  ita={props.ita}
                  loading={loading}
                  setLoading={setLoading}
                  reload={showModal}
                />
              )}
            </div>
            <Row className="justify-content-center pb-3">
              <button
                className="btn btn-white btn-compliances"
                type="button"
                onClick={toggleGraph}
              >
                {showGraph
                  ? props.ita
                    ? "Nascondi il grafico"
                    : "Hide the graph"
                  : props.ita
                  ? "Mostra il grafico"
                  : "Show the graph"}
              </button>
            </Row>
          </Col>
          <Col md={8} className="pb-1 pt-1 vh-100">
            <Row>
              {["RT", "3h", "24h", "3d", "1w", "1M"].map((tb) => {
                return (
                  <TimeButton
                    time={tb}
                    compareGraph={compareGraph}
                    disableTime={disableTime}
                    compareTime={compareTime}
                    addCompareTime={addCompareTime}
                    timeWindow={timeWindow}
                    setTimeWindow={setTimeWindow}
                    topic={topic}
                    setTopic={setTopic}
                    loading={loading}
                  />
                );
              })}
              <Col
                role="button"
                style={{
                  textDecoration: "underline",
                  fontSize: "130%",
                  padding: "0px",
                }}
                className="ms-2 mt-1"
                onClick={() => navigate("/")}
              >
                Home
              </Col>
            </Row>
            {showGraph ? (
              compareGraph ? (
                <div id="graphBox">
                  <CompareGraphs
                    compareTopics={compareTopics}
                    compareTime={compareTime}
                  />
                </div>
              ) : (
                <div id="graphBox">
                  <GraphFrame
                    measure={topic === "init" ? "IEQ" : topic}
                    time_span={timeWindow}
                  />
                </div>
              )
            ) : (
              <div id="gaugeBox">
                <DashIframe
                  timeWindow={timeWindow}
                  topic={topic}
                  setTopic={setTopic}
                  RTValues={RTValues}
                />
              </div>
            )}
            {showGraph ? (
              <Legenda
                ita={props.ita}
                topic={topic}
                compareTopics={compareTopics}
              />
            ) : (
              <HintsMore topic={topic} ita={props.ita} />
            )}
          </Col>
          <Row className="compareButtonHolder">
            <button
              hidden={!showGraph}
              className={
                compareGraph
                  ? "btn btn-primary btn-compliances-active"
                  : "btn btn-white-border btn-compliances"
              }
              type="button"
              onClick={toggleCompare}
            >
              {props.ita ? "Confronta i grafici" : "Compare the graphs"}
            </button>
          </Row>
        </Row>
      </Container>
    </>
  );
}
