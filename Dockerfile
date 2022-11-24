FROM node:current-alpine
RUN mkdir /basicuserservice
WORKDIR /basicuserservice
COPY ["server.js","package.json","/basicuserservice/"]
RUN npm install
VOLUME /basicuserservice/certificates
ENV PRIVATE_KEY /basicuserservice/certificates/private.key
ENV PUBLIC_KEY /basicuserservice/certificates/public.pub
ENV SERVER_PORT=80
ENV JWT_TOKEN_LIFETIME=120m
ENV MARIADB_HOST=localhost
ENV MARIADB_PORT=3306
ENV MARIADB_DATABASE=userdb
ENV MARIADB_USER=userdblogin
ENV MARIADB_PASSWORD=userdbpassword
ENV MARIADB_ROOT_PASSWORD=userdbrootpass

EXPOSE ${SERVER_PORT}
CMD ["node","/basicuserservice/server.js"]