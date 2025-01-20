# Jellyview

Jellyview is a user-facing dashboard for Jellyfin statistics. This project aims to provide an intuitive and comprehensive interface to monitor and analyze your media server's performance and usage.

## Integrations

### Jellyfin
Shows all-time and monthly statistics of your movies, tv series and users.

### Jellyseerr
Shows amount of requests made by each user

### Radarr and Sonarr
Shows total size on disk of each users requests.

## Getting Started

Copy `compose.yml` and `.env.example` to a folder on your server. Input your env vars and run
```
mv env.example .env
docker compose up -d # or podman compose up -d
```

## Project Goals

- **User-Friendly Interface**: Provide an easy-to-use dashboard for viewing Jellyfin statistics.
- **Comprehensive Analytics**: Offer detailed insights into server performance, media consumption, and user activity.
- **Real-Time Updates**: Ensure that the dashboard reflects the latest data from your Jellyfin server.
- **Customization**: Allow users to customize the dashboard to fit their specific needs.