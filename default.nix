let
  holonixRev = "cb8eb67e55b4f291f0868bbd3439a5e6f006e49f";
  holonixPath = builtins.fetchTarball "https://github.com/holochain/holonix/archive/${holonixRev}.tar.gz";
  holonix = import (holonixPath) {
    holochainVersionId = "v0_0_127";
  };
  nixpkgs = holonix.pkgs;
in nixpkgs.mkShell {
  inputsFrom = [ holonix.main ];
  packages = with nixpkgs; [
    # Additional packages go here
    nodejs-16_x
  ];
}
