import { Col, Spinner } from "react-bootstrap";

export default function TimeButton(props){
    return (
        <Col id="timecol">
        <button
          id="timeButton"
          disabled={
            props.compareGraph && props.disableTime && !props.compareTime.includes(props.time)
          }
          className={
            (!props.compareGraph && props.timeWindow === props.time) ||
            (props.compareGraph && props.compareTime.includes(props.time))
              ? "btn btn-primary btn-dash"
              : "btn btn-white-border btn-dash"
          }
          onClick={() => {
            if (props.compareGraph) props.addCompareTime(props.time);
            else {
              if(props.topic == "init")
                props.setTopic("IEQ")
              props.setTimeWindow(props.time);
            }
          }}
        >
          {/* {props.time == "RT" ? props.time : props.time} */}
          {props.time == props.timeWindow && props.loading && <Spinner size = "sm"/>  }
          {props.time}
        </button>
      </Col>
    );
}