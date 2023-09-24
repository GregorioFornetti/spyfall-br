FROM postgres:latest
COPY ../backup.sql /backup.sql
CMD ["postgres"]