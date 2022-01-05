let
  holonixPath = builtins.fetchTarball "https://github.com/holochain/holonix/archive/bcb7cbedfc06026181552a7d64db731c0398165c.tar.gz";
  holonix = import (holonixPath) {
    holochainVersionId = "v0_0_119";
  };
  nixpkgs = holonix.pkgs;
in nixpkgs.mkShell {
  inputsFrom = [ holonix.main ];
  packages = [
    # additional packages go here
  ];
}
