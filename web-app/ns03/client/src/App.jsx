import { Route, Routes, useNavigate, useLocation } from "react-router-dom";
import SurveyJS from "./pages/SurveyJS";
import Hello from "./pages/Hello";
import Page404 from "./pages/Page404";
import Thanks from "./pages/Thanks";
import FurtherQuestions from "./pages/FurtherQuestions";
import Personal from "./pages/Personal";
import { useState, useEffect } from "react";
import LoggedRoute from "./components/LoggedRoute";
import ProtectedRoute from "./components/ProtectedRoute";
import Profile from "./pages/Profile";
import "./CSS/App.css";
import API from "./API/API";
import LoadingSpinner from "./components/LoadingSpinner";
import AnonymousRoute from "./components/AnonymousRoute";
import Cookies from "js-cookie";

function App() {
  const NO_DASH = false;

  const [logged, setLogged] = useState(false);
  const [ita, setIta] = useState(false);
  const [answers, setAnswers] = useState(null);
  const [anon, setAnon] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const location = useLocation();
  const navigate = useNavigate();

  const urlParams = new URLSearchParams(window.location.search);

  const setBoardIDInfo = () => {
    // const searchParams = new URLSearchParams(location.search);
    if (
      urlParams.get("boardID") == null &&
      localStorage.getItem("email") != null
    ) {
      API.getLatestBoardID(localStorage.getItem("email"))
        .then((m) => {
          if (m.boardID != null) localStorage.setItem("boardID", m.boardID);
        })
        .catch((e) => console.error(e));
    } else if (urlParams.get("boardID") != null) {
      localStorage.setItem("boardID", urlParams.get("boardID"));
    }
    navigate({ pathname: location.pathname, search: localStorage.getItem("boardID") && "boardID="+localStorage.getItem("boardID") });
  };

  const setLocalStorage = (res) => {
    localStorage.setItem("email", res.email);
    localStorage.setItem("role", res.realm_access.roles);
    localStorage.setItem("username", res.username);
    setLogged(true);
  };

  const deleteLocalStorage = () => {
    setLogged(false);
    localStorage.clear();
    setAnswers(null);
    API.logout();
  };

  // useEffect(() => {
  //   const searchParams = new URLSearchParams(location.search);
  //   navigate({ pathname: location.pathname, search: searchParams.toString() });
  // }, [location.search]);

  useEffect(() => {
    setIsLoading(true);
    API.getUserInfo()
      .then((res) => {
        if (res.active) {
          setLocalStorage(res);
          if ((Cookies.get("Role") === "Student" || Cookies.get("Role") === "Private") && anon == null) {
            let anonID =
              "anon" +
              Math.floor(10000000 + Math.random() * 90000000).toString();
            setAnon(anonID);
          }
        }
        else if (localStorage.getItem("email")) deleteLocalStorage();
        setIsLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setIsLoading(false);
      });
    setBoardIDInfo();
  }, [window.location.path, localStorage.getItem("email")]);
  // },[]);

  if (
    localStorage.getItem("noNavigation") === "true" &&
    window.location.pathname !== "/personal" &&
    window.location.pathname !== "/thanks"
  ) {
    return <Page404 noNavigation={true} />;
  }

  return (
    <>
      {isLoading ? (
        <LoadingSpinner />
      ) : (
        <Routes>
          <Route path="*" element={<Page404 ita={ita} />} />
          <Route
            exact
            path="/"
            element={
              <Hello
                doLogout={deleteLocalStorage}
                logged={logged}
                ita={ita}
                setIta={setIta}
                useNavigate={useNavigate}
                anon={anon}
              />
            }
          />
          <Route
            exact
            path="/profile"
            element={<LoggedRoute logged={logged} anon={anon} />}
          >
            <Route
              path="/profile"
              element={
                <Profile
                  logged={logged}
                  doLogout={deleteLocalStorage}
                  ita={ita}
                  NO_DASH={NO_DASH}
                />
              }
            />
          </Route>


          {/* <Route
            exact
            path="/dashboard"
            element={<ProtectedRoute logged={logged} anon={anon}/>}
          >
          {!NO_DASH && (
            <Route path="/dashboard" element={<Dashboard ita={ita} />} />
          )}
          </Route> */}

          <Route
            exact
            path="/personal"
            element={<AnonymousRoute logged={logged} anon={anon}/>}
          >
            <Route
              path="/personal"
              element={
                <Personal
                  doLogout={deleteLocalStorage}
                  logged={logged}
                  anon={anon}
                  ita={ita}
                />
              }
            />
          </Route>
          <Route
            exact
            path="/thanks"
            element={<AnonymousRoute logged={logged} anon={anon}/>}
          >
            <Route
              path="/thanks"
              element={
                <Thanks 
                  anon={anon}
                  answers={answers}
                  ita={ita}
                  logged={logged}
                  setAnswers={setAnswers}
                  NO_DASH={NO_DASH}
                />
              }
            />
          </Route>

          <Route path="/survey" element={<AnonymousRoute logged={logged} anon={anon}/>}>
            <Route
              path="/survey"
              element={
                <SurveyJS
                  anon={anon}
                  setAnon={setAnon}
                  setAnswers={setAnswers}
                  ita={ita}
                  logged={logged}
                />
              }
            />
          </Route>

          <Route
            exact
            path="/furtherQuestions"
            element={<AnonymousRoute logged={logged} anon={anon} />}
          >
            <Route
              path="/furtherQuestions"
              element={
                <FurtherQuestions
                  answers={answers}
                  ita={ita}
                  setAnswers={setAnswers}
                />
              }
            />
          </Route>
        </Routes>
      )}
      {localStorage.getItem("noNavigation") !== "true" &&
      location.pathname !== "/" &&
      location.pathname !== "/login" &&
      location.pathname !== "/thanks" &&
      location.pathname !== "/survey" &&
      location.pathname !== "/furtherQuestions" ? (
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
      ) 
      // : location.pathname === "/dashboard" ? (
      //   <p
      //     role="button"
      //     style={{
      //       position: "fixed",
      //       top: "4.5%",
      //       right: "1.5%",
      //       textDecoration: "underline",
      //       fontSize: "130%",
      //     }}
      //     onClick={() => navigate("/")}
      //   >
      //     Home
      //   </p>
      // ) 
      : null}
      {!location.pathname.startsWith("/dashboard") &&
        location.pathname !== "/" && (
          <div id="prometeoLogo">
            <p
              style={{
                fontSize: "200%",
                color: "#ff9724",
                fontFamily: "Ink Free",
              }}
            >
              PROMET&O
            </p>
          </div>
        )}
    </>
  );
}

export default App;
