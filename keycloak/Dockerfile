FROM quay.io/keycloak/keycloak:latest

ENV KEYCLOAK_ADMIN=admin
ENV KEYCLOAK_ADMIN_PASSWORD=admin

EXPOSE 8080

CMD ["start-dev", "--hostname-strict=false", "--hostname-strict-https=false"]
