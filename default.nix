let
  holonixPath = builtins.fetchTarball "https://github.com/holochain/holonix/archive/dab6f0a3e9000f182957ca72521c9e88a4753fc6.tar.gz";
  holonix = import (holonixPath) {
    holochainVersionId = "v0_0_128";
  };
  nixpkgs = holonix.pkgs;
in nixpkgs.mkShell {
  inputsFrom = [ holonix.main ];
  packages = with nixpkgs; [
    # Additional packages go here
    nodejs-16_x
  ];
}
