FROM nginx:alpine

RUN rm /etc/nginx/conf.d/default.conf

COPY nginx.conf /nginx.conf
COPY nginx-ssl.conf /nginx-ssl.conf
COPY run.sh /run.sh

RUN apk add --no-cache openssl bash

RUN chmod +x /run.sh

CMD [ "/run.sh" ]
