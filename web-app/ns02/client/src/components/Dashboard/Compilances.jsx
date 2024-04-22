// Element placed in the bottom of the left orange column. Here real time data is retrieved
// and displayed in a specific mode when clicked on a measure
import API from "../../API/API";
import { useEffect, useState } from "react";
import { Col, Row } from "react-bootstrap";
import measuresInfo from "../../assets/measures.json";
import "../../CSS/dashboard.css";
const avgToTimeSpan = {
  rt: "90m",
  "3h": "3h",
  "24h": "7d",
  "3d": "3d",
  "1w": "1w",
  "1M": "1M",
};

export default function Compliances(props) {
  // const [loading, setLoading] = useState(true);

  const fetchAndSetData = async () => {
    props.setLoading(true);
    let measures = [];
    for (const key in measuresInfo) {
      if (measuresInfo[key].grafana.unitName) {
        measures.push({ key, value: measuresInfo[key].grafana.unitName });
      }
    }
    const fetchPromises = [];
    measures.map((measure) =>
      fetchPromises.push(
        API.getDashboardValues(
          measure.key,
          measure.value,
          props.timeWindow == "RT"
            ? props.timeWindow.toLowerCase()
            : props.timeWindow,
          props.timeWindow == "RT"
            ? avgToTimeSpan[props.timeWindow.toLowerCase()]
            : avgToTimeSpan[props.timeWindow],
          localStorage.getItem("boardID")
        )
      )
    );

    await Promise.allSettled(fetchPromises)
      .then((results) => {
        props.setLoading(true);
        const validResults = results.filter((p) => p.status !== "rejected");
        const updatedValues = [];
        measures.forEach((m) => {
          let measure = validResults.filter((vr) => vr.value.measure === m.key);
          if (measure.length > 0 && measure[0].value.value != null) {
            updatedValues[measure[0].value.measure] = measure[0].value.value;
          } else {
            updatedValues[m.key] = {
              average: "...",
              max: "...",
              min: "...",
              ninth: "...",
              tenth: "...",
              std: "...",
            };
          }
        });
        props.setRTValues(updatedValues);
        props.setLoading(false);
      })
      .catch((error) => console.error(error));
  };

  // data refresh every five minutes
  useEffect(() => {
    const APIcall = setInterval(() => {
      fetchAndSetData();
    }, 300000); //5 minutes
    return () => clearInterval(APIcall);
  }, []);

  // data refresh everytime user changes timewindow
  useEffect(() => {
    fetchAndSetData();
  }, [props.timeWindow, props.reload]);

  return (
    <Row style={{ height: "36%" }}>
      {props.compareGraph && props.loading ? null : (
        <Col style={{ borderTop: "7px solid white", padding: "10px 0" }}>
          {props.topic !== "init" &&
            props.topic !== "IEQ" &&
            props.topic !== "Air" &&
            props.topic !== "Temp" &&
            props.topic !== "Light" &&
            props.topic !== "Sound" ? (
              <Row style={{ height: "30%" }}>
                <ReferenceValues topic={props.topic} ita={props.ita} />
              </Row>
            ) : <div style={{marginBottom: "4%"}}/>}
          <Row id="compliances">
            {props.timeWindow === "RT" ? (
              <RTCompliancesValues
                ita={props.ita}
                topic={props.topic}
                RTValues={props.RTValues}
              />
            ) : (
              <NotRTCompliancesValues
                topic={props.topic}
                RTValues={props.RTValues}
                ita={props.ita}
              />
            )}
          </Row>
        </Col>
      )}
    </Row>
  );
}

function RTCompliancesValues(props) {
  let thisTopic = props.topic === "init" ? "IEQ" : props.topic;

  return (
    <div id="compliance" style={{ textAlign: "center" }}>
      {props.ita ? "Valore in tempo reale: " : "Real-time value: "}
      {parseComplianceValue(props.RTValues[thisTopic].average)}
      {" " + measuresInfo[thisTopic].unit}
    </div>
  );
}

function NotRTCompliancesValues(props) {
  let thisTopic = props.topic === "init" ? "IEQ" : props.topic;
  return (
    <div id="compliance" style={{ textAlign: "center" }}>
      {props.ita ? "Media: " : "Mean value: "}
      {parseComplianceValue(props.RTValues[thisTopic].average)}
      {" " + measuresInfo[thisTopic].unit}
      <br />
      {props.ita ? "Deviazione standard: " : "Standard deviation: "}
      {parseComplianceValue(props.RTValues[props.topic].std)}
      {" " + measuresInfo[thisTopic].unit}
      <br />
      {props.ita ? "10° " : "10ᵗʰ "}Percentile:{" "}
      {parseComplianceValue(props.RTValues[props.topic].tenth)}
      {" " + measuresInfo[thisTopic].unit}
      <br />
      {props.ita ? "90° " : "90ᵗʰ "}Percentile:{" "}
      {parseComplianceValue(props.RTValues[props.topic].ninth)}
      {" " + measuresInfo[thisTopic].unit}
      <br />
      {props.ita ? "Valore massimo: " : "Max value: "}
      {parseComplianceValue(props.RTValues[props.topic].max)}
      {" " + measuresInfo[thisTopic].unit}
      <br />
      {props.ita ? "Valore minimo: " : "Min value: "}
      {parseComplianceValue(props.RTValues[props.topic].min)}
      {" " + measuresInfo[thisTopic].unit}
    </div>
  );
}

function ReferenceValues(props) {
  //checks which panel should be later displayed according to the current date
  const isSummer = () => {
    var today = new Date();
    var startSummer = new Date(today.getFullYear() + 1, 5, 21); // 5 represents june (0-based)
    var endSummer = new Date(today.getFullYear(), 8, 21); // 8 represents semptember (0-based)
    return today <= endSummer && today >= startSummer;
  };

  return (
    <div className="text-center">
      <div
        style={{
          fontSize: "1.2em",
          textAlign: "center",
          textDecoration: "underline",
          margin: 0,
          marginBottom: "-2%",
        }}
      >
        {props.ita ? "Valori di riferimento: " : "Reference values: "}
        {
          measuresInfo[props.topic === "init" ? "IEQ" : props.topic][
            props.topic === "T" && isSummer()
              ? "referenceValueSummer"
              : "referenceValue"
          ]
        }
      </div>
      <i style={{ fontSize: "80%" }}>
        ({measuresInfo[props.topic].law})
      </i>
    </div>
  );
}

const parseComplianceValue = (value) => {
  return value != "..." ? parseFloat(value).toFixed(1) : "...";
};
