import { Button, Modal } from "react-bootstrap";
import PrivacyNotice from "./PrivacyNotice";
import { useState } from "react";

export function PrivacyModal(props) {
    const [show, setShow] = useState(props.show)
    return (
        <Modal show={show} onHide={() => {props.setShowModal(false); setShow(false)}}>
            <Modal.Header closeButton>
                <Modal.Title>Privacy</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <PrivacyNotice />
            </Modal.Body>
            <Modal.Footer>
                <Button style={{ fontSize: "110% !important" }} variant="secondary" onClick={() => {props.setShowModal(false); setShow(false)}}>
                    I understand
                </Button>
            </Modal.Footer>
        </Modal>
    );
}