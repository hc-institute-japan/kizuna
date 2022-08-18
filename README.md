# Kizuna

![workflow](https://github.com/hc-institute-japan/kizuna/actions/workflows/main.yml/badge.svg)

[Kizuna](https://kizuna.foundation/en/) is a distributed, peer-to-peer, non-profit messaging application built on [Holochain](https://www.holochain.org/). We don't own, track or sell your data. You own your identity and information. As a distributed application, Kizuna is more private, secure, and censorship-resistant. It is completely open sourced. This means anyone can review and contribute to our development.

## Environment
Node version: 16.10.0

## Project Setup
This installation assumes that holochain is already configured on your local environment. Please check the [installation instruction for Holochain](https://developer.holochain.org/install/) for more infomration.

1. Open nix-shell. Navigate to the root folder of kizuna and run this command (This will take a few minutes):
```bash
nix-shell
```
2. Once nix-shell is open, Navigate to the `ui` folder inside of kizuna and install the required dependencies:
```bash
cd ui
npm install
```
3. Run holochain app on your local:
```bash
npm run build:happ
```
4. Run the app to the browser. This command will open the app in the browser:
```bash
npm run demo
```
## Lints and fixes files
```bash
npm run code:clean
```
## Contributing
Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

Please make sure to update tests as appropriate.
