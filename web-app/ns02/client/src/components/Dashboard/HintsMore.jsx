// Modal opened clicking on the Hints button
import { useState } from "react";
import { Modal } from "react-bootstrap";
import measuresInfo from "../../assets/measures.json";

export default function HintsMore(props) {
    let topic = props.topic === "init" ? "IEQ" : props.topic;
    const [hint, setHint] = useState("");
    //HINTS///////////////////////////////////////////////////////
    const [showHints, setShowHints] = useState(false);
    const handleCloseHints = () => setShowHints(false);
    const handleShowHints = () => {
      // let random = Math.floor(Math.random() * hints[topic].length);
      setHint(measuresInfo[topic]["hints"][props.ita ? "it" : "en"]);
      setShowHints(true);
    };
    //MORE////////////////////////////////////////////////////////
    const [showMore, setShowMore] = useState(false);
    const handleCloseMore = () => setShowMore(false);
    const handleShowMore = () => setShowMore(true);
    return (
      <div className="row" id="hintsmore">
        <div className="col-6 text-end">
          <button
            className={
              showHints
                ? "btn btn-primary btn-hintsmore"
                : "btn btn-white-border btn-hintsmore"
            }
            onClick={handleShowHints}
          >
            Hints
          </button>
        </div>
        <div className="col-6">
          <button
            className={
              showMore
                ? "btn btn-primary btn-hintsmore"
                : "btn btn-white-border btn-hintsmore"
            }
            onClick={handleShowMore}
          >
            More
          </button>
        </div>
        <Modal id="HintsModal" show={showHints} onHide={handleCloseHints}>
          <Modal.Body style={{ position: "relative", overflowY: "hidden" }}>
            <Modal.Title style={{ color: "#ff9724", textAlign: "center" }}>
              Hints
            </Modal.Title>
            <div style={{ overflowY: "scroll", height: "30vh" }}>{hint}</div>
            <Modal.Footer>
              <div className="text-center" style={{ width: "100%" }}>
                <button className="btn btn-modalclose" onClick={handleCloseHints}>
                  Back
                </button>
              </div>
            </Modal.Footer>
          </Modal.Body>
        </Modal>
        <Modal id="MoreModal" show={showMore} onHide={handleCloseMore}>
          <Modal.Body style={{ position: "relative", overflowY: "hidden" }}>
            <Modal.Title style={{ color: "#ff9724", textAlign: "center" }}>
              More
            </Modal.Title>
            <div style={{ overflowY: "scroll", height: "30vh" }}>
              {measuresInfo[topic]["more"][props.ita ? "it" : "en"]}
            </div>
            <Modal.Footer>
              <div className="text-center" style={{ width: "100%" }}>
                <button className="btn btn-modalclose" onClick={handleCloseMore}>
                  Back
                </button>
              </div>
            </Modal.Footer>
          </Modal.Body>
        </Modal>
      </div>
    );
  }