import "survey-core/modern.min.css";
import { Survey, Model } from "survey-react-ui";
import { StylesManager } from "survey-core";
import * as surveyJSON from "../assets/surveys/personal.json";
import * as surveyCSS from "../assets/surveys/personal.scss";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import API from "../API/API";
import { Container } from "react-bootstrap";

StylesManager.applyTheme("modern");

function Personal(props) {
  let navigate = useNavigate();
  let user = localStorage.getItem("email");
  let oldValues = null;

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (!props.anon) {
          const res = await API.getOldValues(user);
          const oldValues = res.answers;
  
          if (oldValues && Object.keys(oldValues).length > 0) {
            Object.entries(oldValues)
              .filter(([key]) => !["personalID", "user", "timestamp"].includes(key))
              .forEach(([key, value]) => survey.setValue(key, value));
          }
        }
      } catch (err) {
        console.error(err);
      }
    };
  
    fetchData();
  }, []);
  
  function sendDataToServer(sur) {
    if (!user && props.anon === null) {
        return;
    }

    let answers = sur.data;
    let questions = sur.getAllQuestions().map(q => q.jsonObj.name).filter(q => q.match(/[p]\d/g));

    questions.forEach(q => {
        if (!answers.hasOwnProperty(q)) {
            answers[q] = null;
        }
    });

    let data = {
        answers: answers,
        userID: props.anon || user 
    };

    API.submitData(data)
        .then(() => {
            if (!localStorage.getItem("completedSurvey")) {
                localStorage.setItem("completedSurvey", true);
            }
            navigate("/thanks");
        })
        .catch((err) =>
            console.error("Post failed: " + JSON.stringify(err.response))
        );
}

  const survey = new Model(surveyJSON);
  if (props.ita) survey.locale = "it";
  survey.css = surveyCSS;
  return (
    <Container fluid>
      <Survey id="personal" model={survey} onComplete={sendDataToServer} />
    </Container>
  );
}

export default Personal;
