FROM atmoz/sftp

ARG SFTP_USER

RUN mkdir -p /home/${SFTP_USER}/upload/logs

COPY ./test.txt /home/${SFTP_USER}/upload/
COPY ./app.log /home/${SFTP_USER}/upload/logs/

RUN chown -R 1001:1001 /home/${SFTP_USER}/upload
