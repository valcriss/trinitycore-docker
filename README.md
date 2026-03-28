# TrinityCore Docker

![Build Status](https://github.com/valcriss/trinitycore-docker/actions/workflows/docker-build-push.yml/badge.svg)

Run a TrinityCore server stack with a web interface, automated bootstrap, and a setup flow that is much closer to "start it and watch it come alive" than "assemble everything by hand".

This project packages TrinityCore, MySQL, the bootstrap logic, and an operational web UI into a Docker-based environment for learning, experimentation, and private server research.

## Why This Project

Getting a TrinityCore environment running locally usually means juggling database dumps, configuration files, extraction tools, and long initialization phases with very little feedback.

This repository smooths that out by giving you:

- a ready-to-run Docker environment
- automatic database creation and bootstrap
- client data extraction from your own WoW client files
- a web interface available as soon as the container starts
- live visibility into initialization progress
- runtime monitoring for the Auth/Bnet and World processes

## Supported Profiles

| Profile | TrinityCore Branch | Compose File | Docker Tag |
| --- | --- | --- | --- |
| `3.3.5` | `3.3.5` | `docker-compose.335.yml` | `3.3.5` |
| `4.4.2` | `cata_classic` | `docker-compose.442.yml` | `4.4.2` |
| `master` | `master` | `docker-compose.master.yml` | `master` |

The `master` profile is intentionally treated as a moving channel. It tracks the current TrinityCore `master` branch instead of pinning the application logic to a specific retail version number.

## What You Get

- TrinityCore server binaries built inside Docker
- MySQL database service
- bootstrap logic for schema setup, seed download, updates, and realm configuration
- extraction scripts for client data
- a browser UI on port `3000`
- runtime command access for `worldserver`

## Requirements

- [Docker](https://docs.docker.com/get-docker/)
- [Docker Compose](https://docs.docker.com/compose/install/)
- a compatible World of Warcraft client for the profile you want to run

## Quick Start

Choose the profile you want, create a working directory, and fetch the matching compose file.

### TrinityCore 3.3.5

```bash
mkdir trinitycore-docker
cd trinitycore-docker
curl -o docker-compose.yml https://raw.githubusercontent.com/valcriss/trinitycore-docker/refs/heads/main/docker-compose.335.yml
mkdir client
```

### TrinityCore 4.4.2

```bash
mkdir trinitycore-docker
cd trinitycore-docker
curl -o docker-compose.yml https://raw.githubusercontent.com/valcriss/trinitycore-docker/refs/heads/main/docker-compose.442.yml
mkdir client
```

### TrinityCore master

```bash
mkdir trinitycore-docker
cd trinitycore-docker
curl -o docker-compose.yml https://raw.githubusercontent.com/valcriss/trinitycore-docker/refs/heads/main/docker-compose.master.yml
mkdir client
```

Then:

1. Place your WoW client files in the `client/` directory.
2. Edit the `environment` section in `docker-compose.yml` if needed.
3. Start the stack:

```bash
docker compose up -d
```

## What Happens On First Start

The application bootstraps itself automatically:

- waits for MySQL to become available
- creates the required databases
- downloads the initial TrinityCore data dump
- runs TrinityCore database updates
- updates realm information
- extracts client maps and related data
- starts the Auth/Bnet and World processes

The web interface is available immediately and shows the initialization progress live, so you do not have to guess whether the environment is stuck or still working.

## Web Interface

Once the stack is running, open:

```text
http://localhost:3000
```

The UI gives you:

- a dedicated initialization view with live step tracking
- detailed logs for the current bootstrap step
- a runtime view after bootstrap completes
- separate tabs for Auth/Bnet and World
- quick actions and command input for `worldserver`

## Development Mode

If you want bind mounts for local data and logs, use the dev compose files from the repository:

- `docker-compose.dev.335.yml`
- `docker-compose.dev.442.yml`
- `docker-compose.dev.master.yml`

Typical launch command:

```bash
docker compose -f docker-compose.dev.master.yml up --build
```

For dev mode, you will usually want:

- `client/` with the correct WoW client data
- `server/data/` as the extraction target
- `server/logs/` for TrinityCore logs

## Authentication

The web UI can be protected with credentials.

Set these environment variables in your compose file:

```yaml
environment:
  - ACCESS_USERNAME=admin
  - ACCESS_PASSWORD=change-me
```

If credentials are defined, the UI requires login before allowing runtime interaction.

## TrinityCore Configuration Overrides

You can override TrinityCore `.conf` values at container startup using environment variables.

- Worldserver prefix: `TC_WORLD__`
- Auth/Bnet prefix: `TC_AUTH__`
- Replace `.` with `__`

Example:

```yaml
environment:
  - TC_WORLD__Rate__XP__Kill=3
  - TC_WORLD__PlayerLimit=200
  - TC_WORLD__Motd=Welcome to my realm
  - TC_AUTH__Battlenet__PasswordChangeSecurity=0
```

That becomes:

- `Rate.XP.Kill = 3` in `worldserver.conf`
- `PlayerLimit = 200` in `worldserver.conf`
- `Motd = Welcome to my realm` in `worldserver.conf`
- `Battlenet.PasswordChangeSecurity = 0` in the auth config

If a key already exists, it is replaced. If it does not exist, it is appended to the end of the file.

## Notes

- WoW client files are required but are not provided by this repository.
- The first bootstrap can take time, especially during extraction.
- The `master` profile follows TrinityCore `master`, so its supported client version can evolve over time.
- This project is not affiliated with or endorsed by Blizzard Entertainment or TrinityCore.

## Troubleshooting

- Make sure the WoW client version matches the selected profile.
- If extraction fails, verify that the `client/` directory contains a complete client installation.
- If bootstrap fails, check the web UI first, then container logs.
- If you are hosting the server and client on the same machine, `PUBLIC_IP_ADDRESS=127.0.0.1` is usually the simplest choice.

## Contributing

Issues and pull requests are welcome. If you improve bootstrap reliability, the UI, or profile support, that is especially valuable for the project.

## License

This project is open source and distributed under the MIT License.
