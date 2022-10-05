# DB
```
docker run -d -v C:\Users\Timothy\Documents\dev\userdb:/var/lib/mysql --name userdb --env MARIADB_DATABASE=userdb --env MARIADB_USER=userdblogin --env MARIADB_PASSWORD=userdbpassword --env MARIADB_ROOT_PASSWORD=userdbrootpass -p 3306:3306  mariadb:latest
```

```
docker container logs userdb
docker container stop userdb
docker container rm -f userdb && docker volume prune -f  
```

# jwt keys
```
ssh-keygen -t rsa -b 4096 -m PEM -f jwtRS256.key
openssl rsa -in jwtRS256.key -pubout -outform PEM -out jwtRS256.key.pub
cat jwtRS256.key
cat jwtRS256.key.pub
```