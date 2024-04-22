//Element that displays current date and time in the left orange column, under PROMET&O title
import { useState } from "react";
import { Col, Row } from "react-bootstrap";
import { format } from "date-fns";
import { it, enGB } from 'date-fns/locale'

export default function Clock(props) {
    let [date, setDate] = useState("");
    let [time, setTime] = useState("");
    setInterval(() => {
      let dateTime = new Date();
      let timeString = dateTime.toTimeString().split(" ")[0].slice(0, -3);
      let dateString = format(dateTime, "d MMM yyyy", {locale: props.ita ? it: enGB});
      setDate(dateString);
      setTime(timeString);
    }, 1000);
    return (
      <Row style={{height: "4%"}}>
        <Col md={6} style={{ padding: 2.5, backgroundColor: "white" }}>
          <p
            id="clock"
            style={{
              textAlign: "center",
              margin: "0px",
              letterSpacing: "-1px",
              color: "#FF9724",
            }}
          >
            {date}
          </p>
        </Col>
        <Col md={6} style={{ padding: 2.5, backgroundColor: "white" }}>
          <p
            id="clock"
            style={{ textAlign: "center", margin: "0px", color: "#FF9724" }}
          >
            {time}
          </p>
        </Col>
      </Row>
    );
  }