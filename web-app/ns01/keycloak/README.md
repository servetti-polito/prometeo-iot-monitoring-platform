## How to export realm
When some changes are made through the user interface, it is required to export the realm so that the changes won't be lost when the container is rebuilt from scratch.
To do so it is necessary to connect to the container shell using the following command:

```bash
docker exec -it <containername> bash
```

Inside the container shell:

```bash
cd /opt/keycloak/bin/
./kc.sh export --file myrealm
cat myrealm
```

Copy and paste the cat output inside the local folder

```console
./realm/realm.json
```
