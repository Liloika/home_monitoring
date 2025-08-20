#Hhome infrastructure

##A local DNS is also configured

Nginx configuration:
```bash
server {
    listen 80;
    server_name <domain_name_grafana>;

    location / {
        proxy_pass http://<local_ip>:<grafana_port>;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}

server {
    listen 80;
    server_name <domain_name_keycloak>;

    location / {
        proxy_pass http://<local_ip>:<keycloak_port>;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

Bind9 configuration: 
```bash
$TTL    604800
@       IN      SOA     <local_domain_name> (
                        3           ; Serial
                        12h         ; Refresh
                        15m         ; Retry
                        3w          ; Expire
                        2h          ; Negative Cache TTL
)

        IN      NS      <local_damoin_name>

ns     IN      A       <local_ip>

grafana IN      A       <local_ip>
keycloak IN     A       <local_ip>
```
