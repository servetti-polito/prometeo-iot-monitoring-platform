# Production stage
FROM nginx:1.22-alpine


#  default conf for proxy service
COPY ./default.conf /etc/nginx/conf.d/default.conf
# COPY ./site* /etc/nginx/sites-enabled/

# NOT FOUND response
# COPY ./backend-not-found.html /var/www/html/backend-not-found.html

# Proxy configurations
COPY ./includes/* /etc/nginx/includes/

# COPY ./nginx-selfsigned.* /etc/ssl/certs/
COPY ./prometeo*.pem /etc/ssl/certs/
COPY ./dhparam.pem /etc/nginx/

# Create app directory
WORKDIR /usr/share/nginx/html
# Remove files
RUN rm *
# Copy build files
# COPY <quello che devi copiare> .
COPY index.html .

# /path/to/dhparam
# RUN mkdir -p /path/to
# RUN curl https://ssl-config.mozilla.org/ffdhe2048.txt > /path/to/dhparam

EXPOSE 80
EXPOSE 443
CMD ["nginx", "-g", "daemon off;"]
