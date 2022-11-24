# basicuserservice
Basic user service returning JWT 


# Getting started
## Setting Up DB

Replace $datapathonhost with a path where you want to store persistent data 
```
docker run -d -v $datapathonhost:/var/lib/mysql --name userdb --env MARIADB_DATABASE=userdb --env MARIADB_USER=userdblogin --env MARIADB_PASSWORD=userdbpassword --env MARIADB_ROOT_PASSWORD=userdbrootpass -p 3306:3306  mariadb:latest
```

You can control the database with
```
docker container logs userdb
docker container stop userdb
docker container rm -f userdb && docker volume prune -f  
```

## Setting up your jwt keys, you can use ubuntu on windows for example
```
openssl genrsa -out private.key 4096
openssl rsa -in private.key -pubout -outform PEM -out public.pub
```

Store private.key and public.pub in $dirtokey

## Setting up BUS (BasicUserService)
```
docker run -v $dirtokey:/basicuserservice/certificates/ -e MARIADB_HOST=<ip> --name bus -p 80:80 --rm -it ghcr.io/k10app/basicuserservice
```

# Custom building
```
docker build -t ghcr.io/k10app/basicuserservice .
```