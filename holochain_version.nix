# This file was generated with the following command:
# update-holochain-versions --git-src=revision:holochain-0.0.115 --output-file=holochain_version.nix --lair-version-req=~0.1 
# For usage instructions please visit https://github.com/holochain/holochain-nixpkgs/#readme

{
    url = "https://github.com/holochain/holochain";
    rev = "efd47955adbf381bf9a886b0e0f9146dfd6be46c";
    sha256 = "0krgdv6a01c484a7hy9q5mnzx8vi3jwccb3qwmysnw1mwdykd9a0";
    cargoLock = {
        outputHashes = {
            "cargo-test-macro-0.1.0" = "1yy1y1d523xdzwg1gc77pigbcwsbawmy4b7vw8v21m7q957sk0c4";
        };
    };

    binsFilter = [
        "holochain"
        "hc"
        "kitsune-p2p-proxy"
    ];

    lair = {
        url = "https://github.com/holochain/lair";
        rev = "v0.1.0";
        sha256 = "0jvk4dd42axwp5pawxayg2jnjx05ic0f6k8f793z8dwwwbvmqsqi";

        binsFilter = [
            "lair-keystore"
        ];

        cargoLock = {
            outputHashes = {
            };
        };
    };
}