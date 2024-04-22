// Modal opened clicking on the Legenda button
export default function Legenda(props) {
    return (
      <div id="legenda" style={{ paddingLeft: 50 }}>

        { ["Sound", "Air", "Temp", "Light", "IEQ"].includes(props.topic) &&
          <div className="row">
          <div className="col-1 text-center" style={{ padding: 0 }}>
            <div
              style={{
                marginLeft: 20,
                height: 30,
                width: 30,
                borderRadius: "50%",
                backgroundColor: "rgb(255,217,102)",
              }}
              />
          </div>
          <div className="col" style={{ lineHeight: 1.5 }}>
            {props.ita ? "Comfort soggettivo" : "Subjective comfort"}
          </div>
        </div>
          }
        <div className="row">
          <div className="col-1 text-center" style={{ padding: 0 }}>
            <div
              style={{
                height: 30,
                width: 70,
                backgroundColor: "rgb(228,242,227)",
              }}
            />
          </div>
          <div className="col">
            {props.ita ? "Range di riferimento" : "Reference range"}
          </div>
        </div>
      </div>
    );
  }