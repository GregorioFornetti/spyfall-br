FROM postgres:latest

ENV POSTGRES_USER=postgres
ENV POSTGRES_PASSWORD=postgres
ENV POSTGRES_DB=spyfall

CMD ["postgres"]