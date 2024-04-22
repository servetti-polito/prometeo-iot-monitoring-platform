
import measures from "../../assets/measures.json"
import GaugeComponent from "../../lib/GaugeComponent";


export default function Gauge(props) {
  return (
    <>
    <GaugeComponent
      className="gauge-component-class"
      marginInPercent={{ left: 0.03, right: 0.03, top: 0.03, bottom: 0.03 }}
      arc={{
        width: 0.2,
        padding: 0.005,
        cornerRadius: 2,
        colorArray: [measures[props.measure]["colors"][1]],
         subArcs:[{limit: 0}, {limit: 100}]
        
      }}

      labels={{
        valueLabel: {
          style: { textShadow: "none", fontWeight: "bold", fontSize:"70px", paddingVertical:"35px", fill: measures[props.measure]["colors"][1] },
          formatTextValue: (value) => value + measures[props.measure]["unit"] + "   ",
        }
        ,
        tickLabels: {
          hideMinMax: true
        },
      }}
      // check isNan necessary for when API returns no datapoints
      value={!isNaN(props.value) ? props.value : 0 }
      minValue={0}
      maxValue={100}
    />
      </>
  );
}
