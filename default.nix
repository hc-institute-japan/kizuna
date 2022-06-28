let
  holonixPath = builtins.fetchTarball "https://github.com/holochain/holonix/archive/develop.tar.gz";
  holonix = import (holonixPath) {
    holochainVersionId = "v0_0_145";
  };
  nixpkgs = holonix.pkgs;
in nixpkgs.mkShell {
  inputsFrom = [ holonix.main ];
  packages = with nixpkgs; [
    # Additional packages go here
    nodejs-16_x
  ];
}
