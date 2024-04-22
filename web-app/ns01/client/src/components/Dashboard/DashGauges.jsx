//Placement of main gauges and their relative measurements
import Gauge from "./Gauges";
import air from "../../assets/images/air.png";
import temp from "../../assets/images/temp.png";
import light from "../../assets/images/light.png";
import IEQ from "../../assets/images/ieq.png";
import sound from "../../assets/images/sound.png";
import dashLogo from "../../assets/images/logo.png";
import { Col, Row } from "react-bootstrap";
import "../../CSS/dashboard.css";
import measuresInfo from "../../assets/measures.json";

function HolderGauge(props) {
  return (
    <div
      className="holderGauge "
      id={props.thisTopic === "IEQ" ? "gauge" + props.thisTopic : "gauge"}
      style={{
        opacity: props.opacity.includes(props.topic) ? 1 : 0.5,
      }}
      onClick={() => {
        props.setTopic(props.thisTopic);
      }}
      role="button"
    >
      <Gauge
        measure={props.thisTopic}
        time_span={props.timeWindow}
        value={
          props.value && props.value.average
            ? parseFloat(props.value.average).toFixed(0)
            : 0
        }
      />
      <img
        id={props.thisTopic === "IEQ" ? "imgIEQ" : "imgTopic"}
        src={props.imgSrc}
        alt={props.thisTopic}
      />
    </div>
  );
}
function Holder(props) {
  return (
    <>
      <div
        id={props.thisTopic}
        className="holder "
        style={{
          borderColor: props.color,
          opacity:
            !props.hidden.includes(props.topic) || props.thisTopic == "hidden"
              ? 0
              : props.topic === "IEQ" || props.topic === props.thisTopic
              ? 1
              : 0.5,
        }}
        onClick={() => {
          if (props.hidden.includes(props.topic)) {
            props.setTopic(props.thisTopic);
          }
        }}
        role="button"
      >
        {props.hidden.includes(props.topic) && props.thisTopic != "hidden" && (
          <TopicValue
            value={
              props.value && props.value.average
                ? parseFloat(props.value.average).toFixed(0)
                : "..."
            }
            thisTopic={props.thisTopic}
          />
        )}
      </div>
    </>
  );
}
function TopicValue(props) {
  return (
    <div id="topicValueContainer">
      <p id="topicLabel">{measuresInfo[props.thisTopic]["labelSymbol"]}</p>
      <p id="topicValue">
        {props.value}
        {" " + measuresInfo[props.thisTopic]["unit"]}
      </p>
    </div>
  );
}

export default function DashGauges(props) {
  const airParams = ["Air", "VOC", "CH2O", "CO2", "CO", "NO2", "PM2.5", "PM10"];

  return (
    <Row className="h-100 py-3 justify-content-center">
      <Col xs={4} className="mainColGauges align-items-end">
        <Row className="pt-4">
          <Col xs={5} className="align-items-end justify-content-start">
            <div style={{ marginBottom: "46px" }}>
              <Holder
                color="#c2a29f"
                hidden={["IEQ", "Temp", "RH", "T"]}
                value={props.RTValues["T"]}
                topic={props.topic}
                thisTopic={"T"}
                setTopic={props.setTopic}
              />
            </div>
          </Col>
          <Col xs={7} className="justify-content-end">
            <Row className="d-flex justify-content-center">
              <div>
                <Holder
                  color="#c2a29f"
                  hidden={["IEQ", "Temp", "RH", "T"]}
                  value={props.RTValues["RH"]}
                  topic={props.topic}
                  thisTopic={"RH"}
                  setTopic={props.setTopic}
                />
              </div>
            </Row>
            <Row className={"mt-2"}>
              <HolderGauge
                topic={props.topic}
                opacity={["IEQ", "Temp", "init"]}
                thisTopic={"Temp"}
                imgSrc={temp}
                setTopic={props.setTopic}
                value={props.RTValues["Temp"]}
              />
            </Row>
          </Col>
        </Row>
        <Row>
          <Col xs={5} className="pe-3 h-100">
            <div style={{ marginTop: "40px" }}>
              <Holder
                color="rgb(132,151,131)"
                hidden={["IEQ", "Sound", "SPL"]}
                value={props.RTValues["SPL"]}
                topic={props.topic}
                thisTopic={"SPL"}
                setTopic={props.setTopic}
              />
            </div>
          </Col>
          <Col xs={7} className="" style={{ height: "100%" }}>
            <Row className={"mb-2"}>
              <HolderGauge
                topic={props.topic}
                opacity={["IEQ", "Sound", "init"]}
                thisTopic={"Sound"}
                imgSrc={sound}
                setTopic={props.setTopic}
                value={props.RTValues["Sound"]}
              />
            </Row>
            <Row className="justify-content-center">
              <Holder hidden={[]} value={"hidden"} thisTopic={"hidden"} />
            </Row>
          </Col>
        </Row>
      </Col>
      <Col xs={4} className=" mainColGauges align-items-center pb-4">
        <Row className="justify-content-center w-100">
          <HolderGauge
            topic={props.topic}
            opacity={["IEQ", "init"]}
            thisTopic={"IEQ"}
            imgSrc={IEQ}
            setTopic={props.setTopic}
            value={props.RTValues["IEQ"]}
          />
        </Row>
        <img id="dashLogo" src={dashLogo} alt="logo" />
        <Row className="justify-content-end align-items-end w-100">
            <Holder
              color="rgb(196, 211, 224)"
              hidden={["IEQ", ...airParams]}
              value={props.RTValues["CO2"]}
              topic={props.topic}
              thisTopic={"CO2"}
              setTopic={props.setTopic}
            />
        </Row>
      </Col>
      <Col xs={4} className="mainColGauges align-items-start">
        <Row className="pt-4 w-100">
          <Col xs={7}>
            <Row className="justify-content-center">
              <div className="align-items-end justify-content-end">
                <Holder
                  color="rgb(236, 203, 123)"
                  hidden={["IEQ", "Light", "E"]}
                  value={props.RTValues["E"]}
                  topic={props.topic}
                  thisTopic={"E"}
                  setTopic={props.setTopic}
                />
              </div>
            </Row>
            <Row className={"mt-2"}>
              <HolderGauge
                topic={props.topic}
                opacity={["IEQ", "Light", "init"]}
                thisTopic={"Light"}
                imgSrc={light}
                setTopic={props.setTopic}
                value={props.RTValues["Light"]}
              />
            </Row>
          </Col>
        </Row>
        <Row className="w-100">
          <Col xs={7} className="d-flex flex-column justify-content-end">
            <Row className={"mb-2"}>
              <HolderGauge
                topic={props.topic}
                opacity={["IEQ", "Air", "init"]}
                thisTopic={"Air"}
                imgSrc={air}
                setTopic={props.setTopic}
                value={props.RTValues["Air"]}
              />
            </Row>
            <Row className="justify-content-center">
            
              <div className="align-items-end justify-content-end">
                <Holder
                  color="rgb(196, 211, 224)"
                  hidden={["IEQ", ...airParams]}
                  value={props.RTValues["VOC"]}
                  topic={props.topic}
                  thisTopic={"VOC"}
                  setTopic={props.setTopic}
                />
              </div>
            </Row>
          </Col>
          <Col xs={5} className="d-flex flex-column gap-3" style={{paddingBottom: "110px"}}>
            <Holder
              color="rgb(196, 211, 224)"
              hidden={["IEQ", ...airParams]}
              value={props.RTValues["PM2.5"]}
              topic={props.topic}
              thisTopic={"PM2.5"}
              setTopic={props.setTopic}
            />
            <Holder
              color="rgb(196, 211, 224)"
              hidden={["IEQ", ...airParams]}
              value={props.RTValues["PM10"]}
              topic={props.topic}
              thisTopic={"PM10"}
              setTopic={props.setTopic}
            />

          </Col>
        </Row>
      </Col>
    </Row>
  );
}
