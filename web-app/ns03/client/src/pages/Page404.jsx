import {Container, Row, Col} from "react-bootstrap"

function Page404(props)
{
    return (
        <Container>
            <Row className="h-75 align-items-center">
                <Col xs={12}>
                    <h1 class="text-center" id="err404"> {props.ita ? "404:Pagina non trovata" : "404: Page Not Found" } </h1><br/>
                    {props.noNavigation ? null : <h1 class="text-center" ><a id="err404" href="./">{props.ita ? "Torna alla home" : "Return to home"}</a></h1>}
                </Col>
            </Row>
        </Container>
    );
}

export default Page404;