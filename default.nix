let
  holonixPath = builtins.fetchTarball "https://github.com/holochain/holonix/archive/92205ee74b7d9288f0b3d0baac4c90fc10cdedb7.tar.gz";
  holonix = import (holonixPath) {
    holochainVersionId = "v0_0_131";
  };
  nixpkgs = holonix.pkgs;
in nixpkgs.mkShell {
  inputsFrom = [ holonix.main ];
  packages = with nixpkgs; [
    # Additional packages go here
    nodejs-16_x
  ];
}
