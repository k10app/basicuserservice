# DB
```
docker run -d -v C:\Users\Timothy\Documents\dev\userdb:/var/lib/mysql --name userdb --env MARIADB_DATABASE=userdb --env MARIADB_USER=userdblogin --env MARIADB_PASSWORD=userdbpassword --env MARIADB_ROOT_PASSWORD=userdbrootpass -p 3306:3306  mariadb:latest
```

```
docker container logs userdb
docker container stop userdb
docker container rm -f userdb && docker volume prune -f  
```

# jwt keys, you can use ubuntu on windows for example
```
openssl genrsa -out private.key 4096
openssl rsa -in private.key -pubout -outform PEM -out public.pub
```

# BUS
```
docker run -v <dirtokey>:/basicuserservice/certificates/ -e MARIADB_HOST=<ip> --name bus -p 80:80 --rm -it ghcr.io/k10app/basicuserservice
```