// import "bootstrap/dist/css/bootstrap.min.css";
// import { useNavigate } from "react-router-dom";
// import { Alert, Col, Container, Row, Spinner } from "react-bootstrap";
// import { useEffect, useState } from "react";
// import "../CSS/Thanks.css";
// import "../CSS/App.css";
// import API from "../API/API";
// import GraphFrame from "../components/Dashboard/GraphFrames";

// export default function Thanks(props) {
//   const [error, setError] = useState(null);
//   const [loading, setLoading] = useState(false);
//   const [sentence, setSentence] = useState("");

//   let navigate = useNavigate();

//   const sentenceFun = (message, ita) => {
//     let result = "";
//     if (message["thermal_comfort_sbj"] !== null) {
//       result += ita
//         ? "Il tuo Comfort Termico è " + message["thermal_comfort_sbj"] + "%"
//         : "Your Thermal Comfort is " + message["thermal_comfort_sbj"] + "%";
//     }
//     if (message["visual_comfort_sbj"] !== null) {
//       if (result === "")
//         result += ita
//           ? "Il tuo Comfort Visivo è " + message["visual_comfort_sbj"] + "%"
//           : "Your Visual Comfort is " + message["visual_comfort_sbj"] + "%";
//       else
//         result += ita
//           ? ", il Comfort Visivo " + message["visual_comfort_sbj"] + "%"
//           : ", Visual Comfort " + message["visual_comfort_sbj"] + "%";
//     }
//     if (message["acoustic_comfort_sbj"] !== null) {
//       if (result === "")
//         result += ita
//           ? "Il tuo Comfort Acustico è " + message["acoustic_comfort_sbj"] + "%"
//           : "Your Acoustic Comfort is " + message["acoustic_comfort_sbj"] + "%";
//       else
//         result += ita
//           ? ", il Comfort Acustico " + message["acoustic_comfort_sbj"] + "%"
//           : ", Acoustic Comfort " + message["acoustic_comfort_sbj"] + "%";
//     }
//     if (message["air_quality_sbj"] !== null) {
//       if (result === "")
//         result += ita
//           ? "La tua Qualità dell'Aria è " + message["air_quality_sbj"] + "%"
//           : "Your Indoor Air Quality is " + message["air_quality_sbj"] + "%";
//       else
//         result += ita
//           ? ", la Qualità dell'Aria " + message["air_quality_sbj"] + "%"
//           : ", Indoor Air Quality " + message["air_quality_sbj"] + "%";
//     }
//     return (
//       <>
//         <h5 style={{ fontSize: "100%", margin: 0 }}>{result}</h5>
//         <h5 style={{ fontSize: "100%", margin: 0 }}>
//           {props.ita
//             ? "Confronta con i dati oggettivi riportati di seguito."
//             : "Compare with objective data below."}
//         </h5>
//       </>
//     );
//   };

//   useEffect(() => {

//     setLoading(true);
//     if (
//       (props.logged || props.anon) &&
//       error === null &&
//       props.answers !== null
//     ) {
//       setSentence(sentenceFun(props.answers.mqttMessage, props.ita));

//       API.submitAnswers(props.answers)
//         .then((data) => {
//           props.setAnswers(null);
//           localStorage.removeItem("previousPersonal");
//           setLoading(false);
//         })
//         .catch((err) => {
//           setLoading(false);
//           setError(
//             props.ita
//               ? "Si è verificato un errore: " + JSON.stringify(err.response)
//               : "An error occourred: " + JSON.stringify(err.response)
//           );
//         });
//     } else {
//       setLoading(false);
//       console.error("Error: ");
//     }
//   }, []);

//   return (
//     <Container>
//       <Row>
//         <Col xs={12} className="mt-2 text-center orange-border-bottom">
//           <h1 id="thanksTitle">
//             {props.ita
//               ? "Grazie per aver completato il sondaggio"
//               : "Thank you for completing the survey"}{" "}
//           </h1>
//         </Col>
//       </Row>
//       <Row className="h-75 text-center m-1">
//         {error === null ? (
//           <div style={{ padding: 10, height: props.logged ? "85%" : "100%" }}>
//             {props.NO_DASH ? null : (
//               <Container style={{ height: "90%" }}>
//                 {sentence}
//                 <Row className="h-50">
//                   <Col md={6}>
//                     <GraphFrame measure={"Temp"} time_span={"rt"} />
//                   </Col>
//                   <Col md={6}>
//                     <GraphFrame measure={"Light"} time_span={"rt"} />
//                   </Col>
//                 </Row>
//                 <div className="row h-50">
//                   <Col md={6}>
//                     <GraphFrame measure={"Sound"} time_span={"rt"} />
//                   </Col>
//                   <Col md={6}>
//                     <GraphFrame measure={"Air"} time_span={"rt"} />
//                   </Col>
//                 </div>
//               </Container>
//             )}
//           </div>
//         ) : (
//           <div
//             className="p-1"
//             // style={{ height: props.logged ? "85%" : "100%" }}
//           >
//             <Alert variant="danger">
//               <h3>{error}</h3>
//             </Alert>
//           </div>
//         )}
//         {/* {props.logged && !props.NO_DASH ? (
//           <div
//             className="orange-border-bottom orange-border-top p-1"
//             style={{ fontSize: "150%" }}
//           >
//             {props.ita ? "Visita " : "Visit "}
//             <a
//               href="https://dev.prometeo.click/chart"
//               target="_blank"
//               rel="noopener noreferrer"
//             >
//               {props.ita ? "questo link" : "this link"}
//             </a>
//             {props.ita ? " o scansiona" : " or scan"}
//             <img alt="qrcode" style={{ height: 100, width: 100 }} src={qrcode} />
//             {props.ita
//               ? "per visualizzare tutti i dati oggettivi e soggettivi"
//               : "to get full objective and subjective data."}
//           </div>
//         ) : null} */}
//       </Row>

//       {
//         <button
//           style={{ position: "absolute", right: 20, bottom: 20 }}
//           className="btn btn-lg btn-primary"
//           type="button"
//           onClick={() => navigate("/")}
//           disabled={loading}
//         >
//           {loading ? (
//             <Spinner animation="border" hidden={!loading} />
//           ) : props.ita ? (
//             "Torna alla home"
//           ) : (
//             "Go back to home"
//           )}
//         </button>
//       }
//     </Container>
//   );
// }

import "bootstrap/dist/css/bootstrap.min.css";
import { useNavigate } from "react-router-dom";
import { Alert, Col, Container, Row, Spinner } from "react-bootstrap";
import { useEffect, useState } from "react";
import "../CSS/Thanks.css";
import "../CSS/App.css";
import API from "../API/API";
import comfort from "../components/evaluateComfort";

export default function Thanks(props) {
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [sentence, setSentence] = useState("");

  let navigate = useNavigate();

  useEffect(() => {
    if (!localStorage.getItem("completedSurvey")) {
      navigate("/");
    }
    setLoading(true);

    if (
      (props.logged || props.anon) &&
      error === null &&
      props.answers !== null
    ) {
      // setSentence(sentenceFun(props.answers.mqttMessage, props.ita));

      API.submitAnswers(props.answers)
        .then((data) => {
          props.setAnswers(null);
          localStorage.removeItem("previousPersonal");
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
    } else {
      setLoading(false);
      console.error("Error:");
    }
  }, []);

  return (
    <Container className="d-flex flex-column align-items-center justify-content-center w-100">
      <Row className="w-100">
        <Col className="mt-2 text-center orange-border-bottom w-100">
          <h1 id="thanksTitle">
            {props.ita
              ? "Grazie per aver completato il sondaggio"
              : "Thank you for completing the survey"}{" "}
          </h1>
        </Col>
      </Row>
      <Row className="text-center m-1">
        {error === null ? (
          <div style={{ padding: 10, height: props.logged ? "85%" : "100%" }}>
            {props.NO_DASH ? null : (
              <Container style={{ height: "90%" }}>
                <h5 style={{ fontSize: "100%", margin: 0 }}>
                  {localStorage.getItem("completedSurvey") != "true" ? localStorage.getItem("completedSurvey") : null}
                </h5>
              </Container>
            )}
          </div>
        ) : (
          <div className="p-1">
            <Alert variant="danger">
              <h3>{error}</h3>
            </Alert>
          </div>
        )}
      </Row>

      {
        <button
          style={{ position: "absolute", right: 20, bottom: 20 }}
          className="btn btn-lg btn-primary"
          type="button"
          onClick={() => {
            navigate("/");
            localStorage.removeItem("completedSurvey");
          }}
          disabled={loading}
        >
          {loading ? (
            <Spinner animation="border" hidden={!loading} />
          ) : props.ita ? (
            "Torna alla home"
          ) : (
            "Go back to home"
          )}
        </button>
      }
    </Container>
  );
}
