{
 # extend the shell with buildInputs specific to this project
 buildInputs = [ ];

 # configure holonix itself
 holonix = {
  
  # true = use a github repository as the holonix base (recommended)
  # false = use a local copy of holonix (useful for debugging)
  use-github = true;

  # configure the remote holonix github when use-github = true
  github = {

   # can be any github ref
   # branch, tag, commit, etc.
   ref = "love";

   # the sha of what is downloaded from the above ref
   # note: even if you change the above ref it will not be redownloaded until
   #       the sha here changes (the sha is the cache key for downloads)
   # note: to get a new sha, get nix to try and download a bad sha
   #       it will complain and tell you the right sha
   sha256 = "1v5n7vkgb1j6k5nzrdlby5fi1a34g165vksp7dv8w5q4wb6h72m1";

   # the github owner of the holonix repo
   owner = "holochain";

   # the name of the holonix repo
   repo = "holonix";
  };

  # configuration for when use-github = false
  local = {
   # the path to the local holonix copy
   path = ./.;
  };

 };

 release = {
  commit = "________________________________________";
  version = {
   current = "_._._";
   previous = "_._._";
  };

  hook = {
   preflight = ''
echo "<your preflight script here>"
   '';
   version = ''
echo "<your versioning script here>"
   '';
   publish = ''
echo "<your publishing script here>"
   '';
  };

  github = {
   owner = "<your github owner here>";
   repo = "<your repo name here>";
   template = ''
   {{ changelog }}
   <your release template markdown here>
   '';
  };
 };

 holo-nixpkgs = rec {
  use-github = true;

  github = rec {
   # can be any github ref
   # branch, tag, commit, etc.
   ref = "95bbba1f4618216814fdbda1d0077beda8b58942";

   # the sha of what is downloaded from the above ref
   # note: even if you change the above ref it will not be redownloaded until
   #       the sha here changes (the sha is the cache key for downloads)
   # note: to get a new sha, get nix to try and download a bad sha
   #       it will complain and tell you the right sha
   sha256 = "1nrp4466dvk8crz1xsal77ycsbd4hr6a6ah1al9n9j2kjz5a5w7v";

   # the github owner of the holonix repo
   owner = "Holo-Host";

   # the name of the holonix repo
   repo = "holo-nixpkgs";

  };

  # configuration for when use-github = false
  local = {
   # the path to the local holonix copy
   path = ../holo-nixpkgs;
  };

  importFn = _: import (
     if use-github
     then builtins.fetchTarball (with github; {
        url = "https://github.com/${owner}/${repo}/archive/${ref}.tar.gz";
        inherit sha256; }
       )
     else local.path
    ) {}
    ;
 };
}
