import {Container, Row, Col} from "react-bootstrap"

function BoardIDNotFound(props)
{
    return (
        <Container>
            <Row className="h-75 align-items-center">
                <Col xs={12}>
                    <h1 className="text-center" id="err404"> {props.ita ? "404: Impossibile trovare Board ID" : "404: Board ID Not Found" } </h1><br/>
                    {props.noNavigation ? null : <h1 className="text-center" ><a id="err404" href="./">{props.ita ? "Torna alla home" : "Return to home"}</a></h1>}
                </Col>
            </Row>
        </Container>
    );
}

export default BoardIDNotFound;