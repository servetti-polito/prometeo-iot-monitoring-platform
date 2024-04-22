//Element button to set the time window. Displayed on the top of the dashboard
import measuresInfo from "../../assets/measures.json";

export default function ButtonCompareGraph(props) {

  return (
      <button
        // hidden={props.measure == ""}
        
        id="buttonCompare"
        type="button"
        onClick={() => {props.addCompareTopic(props.measure);}}
        disabled={props.compareTopics.includes(props.measure) ? false : props.disableTopics}
        className={ props.compareTopics.includes(props.measure) ? "btn btn-primary btn-topic" : "btn btn-white-border btn-topic"}
      >
        {measuresInfo[props.measure]["labelSymbol"]}
      </button>
  );
}
