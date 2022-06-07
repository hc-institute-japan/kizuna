let
  holonixPath = builtins.fetchTarball "https://github.com/holochain/holonix/archive/24ba68406233bdad96e27bd55e130148dfb0ff39.tar.gz";
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
