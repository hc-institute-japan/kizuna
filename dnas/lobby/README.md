
# Zome Developer Setup

To change the code, you can work either opening VSCode inside the root folder of the repo or in this folder, you should have rust intellisense either way.

All the instructions here assume you are running them inside the nix-shell at the lobby folder of the repository.

## Building

for building you have to excute the following commands in order, the firts time will take a long time downloading and compiling the holochain version in your machine then the process will be faster 

```bash
   CARGO_TARGET_DIR=target cargo build --release --target wasm32-unknown-unknown
   hc dna pack workdir/dna
   hc app pack workdir/happ
```

This should create a `workdir/dna/Kizuna.dna && workdir/dna/Kizuna.happ` file.

## Testing

After having built the DNA:

```bash
cd tests
npm install
npm test
```

## Running

After having built the DNA:

```bash

   hc sandbox generate workdir/happ/ --run=8888
   or the smaller version:
   hc s generate workdir/happ/ -r=8888 

```
Now `holochain` will be listening at port `8888`;


