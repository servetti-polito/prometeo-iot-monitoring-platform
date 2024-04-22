import { Row, Col, Card } from "react-bootstrap";
import ButtonCompareGraph from "./ButtonCompareTopic";

export default function CompareGraphsList(props) {
  const ButtonCompareGraphWrapper = (p) => {
    return (
      <ButtonCompareGraph
        measure={p.measure}
        addCompareTopic={props.addCompareTopic}
        compareTopics={props.compareTopics}
        disableTopics={props.disableTopics}
      />
    );
  };

  return (
    <>
      <Card
        style={{ background: "transparent", border: "none" }}
        className="px-2"
      >
        <ButtonCompareGraphWrapper measure={"IEQ"} />
      </Card>
      <Card
        style={{ background: "transparent", border: "none" }}
        className="px-2 pt-2"
      >
        <Row>
          <Col md={6}>
            <ButtonCompareGraphWrapper measure={"Temp"} />
          </Col>
          <Col md={6}>
            <ButtonCompareGraphWrapper measure={"RH"} />
            <ButtonCompareGraphWrapper measure={"T"} />
          </Col>
        </Row>
      </Card>
      <Card
        style={{ background: "transparent", border: "none" }}
        className="px-2 pt-2"
      >
        <Row>
          <Col md={6}>
            <ButtonCompareGraphWrapper measure={"Light"} />
          </Col>
          <Col md={6}>
            <ButtonCompareGraphWrapper measure={"E"} />
          </Col>
        </Row>
      </Card>
      <Card
        style={{ background: "transparent", border: "none" }}
        className="px-2 pt-2"
      >
        <Row>
          <Col md={6}>
            <ButtonCompareGraphWrapper measure={"Sound"} />
          </Col>
          <Col md={6}>
            <ButtonCompareGraphWrapper measure={"SPL"} />
          </Col>
        </Row>
      </Card>

      <Card
        style={{ background: "transparent", border: "none" }}
        className="px-2 pt-2"
      >
        <Row>
          <Col md={6}>
            <ButtonCompareGraphWrapper measure={"Air"} />
          </Col>
          <Col md={6}>
            <ButtonCompareGraphWrapper measure={"VOC"} />
            <ButtonCompareGraphWrapper measure={"CO2"} />
            <ButtonCompareGraphWrapper measure={"PM2.5"} />
            <ButtonCompareGraphWrapper measure={"PM10"} />
          </Col>
        </Row>
      </Card>
    </>
  );
}
