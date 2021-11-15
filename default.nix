{
  holonixPath ?  builtins.fetchTarball { url = "https://github.com/holochain/holonix/archive/develop.tar.gz"; }
}:

let
  holonix = import (holonixPath) {
    include = {
        # making this explicit even though it's the default
        holochainBinaries = true;
    };

    holochainVersionId = "custom";

    holochainVersion = {
      rev = "efd47955adbf381bf9a886b0e0f9146dfd6be46c";
      sha256 = "0krgdv6a01c484a7hy9q5mnzx8vi3jwccb3qwmysnw1mwdykd9a0";
      cargoSha256 = "1nmyk14d1v8y3wipjlff7bn38ay7zkp5fkzr7qbgm28kbai4ji3v";
      bins = {
        holochain = "holochain";
        hc = "hc";
        kitsune-p2p-proxy = "kitsune_p2p/proxy";
      };

      lairKeystoreHashes = {
        sha256 = "06vd1147323yhznf8qyhachcn6fs206h0c0bsx4npdc63p3a4m42";
        cargoSha256 = "0brgy77kx797pjnjhvxhzjv9cjywdi4l4i3mdpqx3kyrklavggcy";
      };
    };
  };
  nixpkgs = holonix.pkgs;
in nixpkgs.mkShell {
  inputsFrom = [ holonix.main ];
  buildInputs = with nixpkgs; [
    binaryen
    nodejs-16_x
  ];
}