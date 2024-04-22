import "survey-core/modern.min.css";
import { Survey, Model } from "survey-react-ui";
import { StylesManager } from "survey-core";
import { useNavigate, useLocation } from "react-router-dom";
import { v4 as uuid } from "uuid";
import { useEffect, useState } from "react";
import bToS from "../assets/boardIDtoSurvey.json";
import BoardIDNotFound from "./BoardIDNotFound";
import comfort from "../components/evaluateComfort";
import { Col, Row, Container } from "react-bootstrap";
import Cookies from "js-cookie";
import { BoardIDModal } from "../components/BoardIDModal";
StylesManager.applyTheme("modern");

function SurveyJS(props) {
  let navigate = useNavigate();
  const location = useLocation();

  const boardID = localStorage.getItem("boardID");
  const [survey, setSurvey] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const surveyID =
    bToS.find((item) => item.boardID == boardID)?.surveyID || null;

  //RESPONSE//////////////////////////////////////////////////////////////////////////////////////////
  function sendDataToServer(sur) {
    console.log(sur);
    let ans = sur.data;

    sur
      .getAllQuestions()
      .map((q) => q.jsonObj.name)
      .filter((q) => q.match(/[Q]\d/g))
      .map((q) => {
        if (!ans.hasOwnProperty(q)) ans[q] = "";
      });

    comfort.evaluateComfort(sur.data).then((res) => {
      let data = {
        answers: ans,
        mqttMessage: res,
        resultID: uuid(),
        boardID: boardID,
        userID: props.anon || localStorage.getItem("email"),
        key: props.anon ? Cookies.get("Key") : null,
      };
      props.setAnswers(data);
      localStorage.setItem(
        "completedSurvey",
        comfort.sentenceFun(res, props.ita)
      );
      console.log(comfort.sentenceFun(res, props.ita));
      navigate(props.anon ? "/furtherQuestions" : "/thanks");
    });
  }

  useEffect(() => {
    const boardID = localStorage.getItem("boardID");
    if (boardID && location.search !== `boardID=${boardID}`) {
      navigate({ pathname: location.pathname, search: `boardID=${boardID}` });
    }
    
  }, [location.pathname, location.search, showModal]);

  //LAYOUT E LINGUA////////////////////////////////////////////////////////////////////////////////////
  useEffect(() => {
    const importOfFiles = async () => {
      if (loading && boardID && surveyID) {
        try {
          import(`../assets/surveys/survey${surveyID}.json`)
            .then((json) => {
              import(`../assets/surveys/survey${surveyID}.scss`)
                .then((css) => {
                  let survey = new Model(json);
                  if (props.ita) survey.locale = "it";
                  survey.css = css;
                  setSurvey(survey);
                  setLoading(false);
                })
                .catch(() => {
                  console.log(
                    "CSS not found for boardID: " +
                      boardID +
                      " surveyID: " +
                      surveyID +
                      "."
                  );
                });
            })
            .catch(() => {
              console.log(
                "JSON not found for boardID: " +
                  boardID +
                  " surveyID: " +
                  surveyID +
                  "."
              );
            });
        } catch {
          setSurvey(false);
          setLoading(false);
        }
      } else {
        if (!boardID || !surveyID) {
          setShowModal(true);
        }
      }
    };

    importOfFiles();
  }, [loading, showModal]);

  return (
    <>
      
      {showModal ? (
        <BoardIDModal showModal={showModal} setShowModal={setShowModal} ita={props.ita}/>
      ) : (
        <>
          {!loading && (
            <Container>
              <p
                role="button"
                style={{
                  position: "fixed",
                  top: 25,
                  right: 25,
                  textDecoration: "underline",
                  fontSize: "130%",
                }}
                onClick={() => navigate("/")}
              >
                Home
              </p>
              <Row className="h-100 align-items-center">
                <Col>
                  <Survey
                    id={"surveyModel" + surveyID}
                    model={survey}
                    onComplete={sendDataToServer}
                  />
                </Col>
              </Row>
            </Container>
          )}
        </>
      )}
    </>
  );
}

export default SurveyJS;
