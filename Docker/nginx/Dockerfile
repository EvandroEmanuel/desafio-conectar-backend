FROM nginx:alpine

# Remove configuração padrão
RUN rm /etc/nginx/conf.d/default.conf

# Copia arquivos de configuração para diretórios apropriados
COPY nginx.conf /nginx.conf
COPY nginx-ssl.conf /nginx-ssl.conf
COPY run.sh /run.sh

# Instala dependências
RUN apk add --no-cache openssl bash

# Torna o script executável
RUN chmod +x /run.sh

# Define o comando padrão
CMD [ "/run.sh" ]
