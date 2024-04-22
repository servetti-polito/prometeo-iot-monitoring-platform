// Screen opened when user wants to compare graphs. Right side of screen is divided into four parts which can be 
// filled with measurements to compare
import GraphFrame from "./GraphFrames";

export default function CompareGraphs(props) {
  let graphs = [];
  let time = [];
  for (let i = 0; i < props.compareTopics.length; i++)
    for (let j = 0; j < props.compareTime.length; j++) {
      graphs.push(
        <GraphFrame
          measure={props.compareTopics[i]}
          time_span={props.compareTime[j]}
        />
      );
      time.push(props.compareTime[j]);
    }
  return (
    <div className="row" style={{ height: "100%", paddingLeft: "20px" }}>
      <div className="row" style={{ height: "50%"}}>
        <div
          className="col-6"
          style={{
            borderRight: "1px solid #bbbbbb",
            borderBottom: "1px solid #bbbbbb",
          }}
        >
          <div className="row">
            <p style={{ margin: 0, textAlign: "right" }}>
              {time.length >= 1 ? time[0] : null}
            </p>
          </div>
          <div className="row" style={{ height: "85%" }}>
            {graphs.length >= 1 ? graphs[0] : null}
          </div>
        </div>
        <div
          className="col-6"
          style={{
            borderLeft: "1px solid #bbbbbb",
            borderBottom: "1px solid #bbbbbb",
          }}
        >
          <div className="row">
            <p style={{ margin: 0, textAlign: "right" }}>
              {time.length >= 2 ? time[1] : null}
            </p>
          </div>
          <div className="row" style={{ height: "85%" }}>
            {graphs.length >= 2 ? graphs[1] : null}
          </div>
        </div>
      </div>
      <div className="row" style={{ height: "50%"}}>
        <div
          className="col-6"
          style={{
            borderRight: "1px solid #bbbbbb",
            borderTop: "1px solid #bbbbbb",
          }}
        >
          <div className="row">
            <p style={{ margin: 0, textAlign: "right" }}>
              {time.length >= 3 ? time[2] : null}
            </p>
          </div>
          <div className="row" style={{ height: "85%" }}>
            {graphs.length >= 3 ? graphs[2] : null}
          </div>
        </div>
        <div
          className="col-6"
          style={{
            borderLeft: "1px solid #bbbbbb",
            borderTop: "1px solid #bbbbbb",
          }}
        >
          <div className="row">
            <p style={{ margin: 0, textAlign: "right" }}>
              {time.length >= 4 ? time[3] : null}
            </p>
          </div>
          <div className="row" style={{ height: "85%" }}>
            {graphs.length >= 4 ? graphs[3] : null}
          </div>
        </div>
      </div>
    </div>
  );
}
