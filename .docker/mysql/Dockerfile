FROM mysql:8.4

ENV TZ=Asia/Tokyo
COPY my.cnf /etc/mysql/conf.d/my.cnf

COPY initdb/ /docker-entrypoint-initdb.d/
