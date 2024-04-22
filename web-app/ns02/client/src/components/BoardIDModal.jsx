import { Button, Modal, Form, Alert } from "react-bootstrap";
import { useState } from "react";
import bToS from "../assets/boardIDtoSurvey.json";

export function BoardIDModal(props) {
    const [show, setShow] = useState(props.showModal)
    const [showAlert, setShowAlert] = useState(false)
    const [boardID, setBoardID] = useState()
    const handleSubmit = () => {
        if(bToS.some(
            (b) => b["boardID"] == boardID)){
                props.setShowModal(false)
                localStorage.setItem("boardID", boardID)
            } else {
            console.log(boardID)
            setShowAlert(true)
        }
    }
    return (
        <Modal show={show} backdrop="static">
            <Modal.Header closeButton>
                <Modal.Title>{props.ita ? "Identificativo del sensore non specificato" : "Sensor identifier not specified"}</Modal.Title>
            </Modal.Header>
            <Modal.Body>
            {props.ita ? "Inserire il valore del boardID" : "Please insert the boardID value"} 
                <Form.Control size="sm" type="text" value={boardID} onChange={ e => setBoardID(e.target.value)}placeholder="boardID" />
            {showAlert && <Alert className="mt-3" variant="danger"> {props.ita ? "Errore: boardID non valido" : "Error: invalid boardID" }</Alert>}
            </Modal.Body>
            <Modal.Footer>
                <Button style={{ fontSize: "110% !important" }} variant="secondary" onClick={() => {handleSubmit()}}>
                {props.ita ? "Invio" : "Submit"} 
                </Button>
            </Modal.Footer>
        </Modal>
    );
}