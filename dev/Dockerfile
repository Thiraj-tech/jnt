# Local stand-in for the cPanel host: Apache + PHP 8.3, .htaccess enabled,
# mail() delivered to Mailpit through msmtp.
FROM php:8.3-apache
RUN apt-get update && apt-get install -y --no-install-recommends msmtp-mta ca-certificates \
 && rm -rf /var/lib/apt/lists/* \
 && a2enmod rewrite headers deflate \
 && sed -i 's/AllowOverride None/AllowOverride All/' /etc/apache2/apache2.conf \
 && printf 'account default\nhost mailpit\nport 1025\nfrom website@jntsuppliers.com\n' > /etc/msmtprc \
 && printf 'sendmail_path = "/usr/bin/msmtp -t"\n' > /usr/local/etc/php/conf.d/mail.ini
