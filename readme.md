# LeiCoin-Node

## Installation

### Method 1: Using Docker

```bash
docker run -it \
  --name leicoin-node \
  -p 12200:12200/tcp \
  -p 12280:12280/tcp \
  -v /path/to/local/data:/data \
  ghcr.io/leicoin-official/leicoin-node:latest \
  run
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

### Method 3: Using Pterodactyl
1. <a href="https://raw.githubusercontent.com/LeiCoin-official/LeiCoin-Node/refs/heads/main/docker/ptero/egg-lei-coin-node.json" download="leicoin-node-egg.json">Download</a> the Pterodactyl-Egg from Github
2. Put The File On your Pterodactyl Panel and create a Server with it
3. Start the created Server

## Configuration

### Main Config
The configuration file for LeiCoin-Node is located at `./config/config.json`. Below is an explanation of the sample configuration:

```json
{
  "api": {
    "active": false,
    "host": "0.0.0.0",
    "port": 12280
  },
  "leicoin_net": {
    "host": "0.0.0.0",
    "port": 12200
  },
  "minter": {
    "active": true,
    "credentials": [
      {
        "privateKey": "",
        "address": ""
      }
    ]
  },
  "experimental": false
}
```

- `api`: Configuration for the API server.
  - `active`: Boolean to enable or disable the API server.
  - `host`: The host address for the API server.
  - `port`: The port on which the API server listens.

- `leicoin_net`: Configuration for the LeiCoin network.
  - `host`: The host address for the LeiCoin network.
  - `port`: The port on which the LeiCoin network listens.

- `minter`: Configuration for the minter.
  - `active`: Boolean to enable or disable the minter.
  - `credentials`: List of credentials for the minter.
    - `privateKey`: The private key for the minter.
    - `address`: The address associated with the private key.

- `experimental`: Boolean to enable or disable experimental features.

### Peers Config
The peers configuration file for LeiCoin-Node is located at `./config/peers.json`. Below is an example of the peers configuration:

```json
[
  "example.com:12200",
  "192.168.1.1:12200",
  "[2001:0db8:85a3:0000:0000:8a2e:0370:7334]:12200",
  "node.example.org:12200",
  "10.0.0.2:12200",
  "[fe80::1ff:fe23:4567:890a]:12200"
]
```


