# LeiCoin-Node

## Installation

### With docker

```bash
docker run -d \
  --name leicoin-node \
  -p 12200:12200/tcp \
  -p 12280:12280/tcp \
  ghcr.io/leicoin-official/leicoin-node:latest
```