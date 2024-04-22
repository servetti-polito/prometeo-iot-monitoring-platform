# Promet&o Application Layer

This software is part of the Promet&o project and it contains the code of the application layer.

## Code overview

Each folder contains a Docker based application:

- [ingress](./ingress) is the ingress proxy that manages access to the web applications by means of the [NGINX](https://www.nginx.com/) software

- [ns01](./ns01) as well as the other nsXX folders contain the web applications themselves plus additional software, mainly [Keycloack](https://www.keycloak.org/) and [Grafana](https://grafana.com/)

## Usage

Each folder contains a `docker-compose.yml` file that can be used to build the Docker container with the command

```
docker compose up -d
```