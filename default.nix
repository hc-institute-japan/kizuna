let
  holonixPath = builtins.fetchTarball "https://github.com/holochain/holonix/archive/ccbed64b383ba57cc716797669ce92df3905117c.tar.gz";
  holonix = import (holonixPath) {
    holochainVersionId = "v0_0_117";
  };
  nixpkgs = holonix.pkgs;
in nixpkgs.mkShell {
  inputsFrom = [ holonix.main ];
  packages = [
    # additional packages go here
  ];
}
