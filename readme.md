# LeiCoin-Node

## Installation

### Method 1: Using Docker

```bash
docker run -it \
  --name leicoin-node \
  -p 12200:12200/tcp \
  -p 12280:12280/tcp \
  ghcr.io/leicoin-official/leicoin-node:latest
```

### Method 2: Using GitHub Releases

1. Go to the [LeiCoin-Node GitHub Releases page](https://github.com/leicoin-official/leicoin-node/releases).
2. Download the latest release for your operating system.
3. Extract the downloaded archive.
4. Navigate to the extracted directory.
5. Run the following command to start the node:

```bash
./leicoin-node run
```