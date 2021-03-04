# This is an example of what downstream consumers of holonix should do
# This is also used to dogfood as many commands as possible for holonix
# For example the release process for holonix uses this file
let

 # point this to your local config.nix file for this project
 # example.config.nix shows and documents a lot of the options
 config = import ./config.nix;

 # START HOLONIX IMPORT BOILERPLATE
 holonix = import (
  if ! config.holonix.use-github
  then config.holonix.local.path
  else fetchTarball {
   url = "https://github.com/${config.holonix.github.owner}/${config.holonix.github.repo}/tarball/${config.holonix.github.ref}";
   sha256 = config.holonix.github.sha256;
  }
 ) { 
   config = config;

   holochainVersionId = "custom";
   
   holochainVersion = { 
    rev = "3675b588de0aaf7eb9dc852b4012f3cfa5a27df7";  
    sha256 = "0l1f0lyc1y630m44ip04ls2y13mlkm8kh48j7i3b5qnw5lwsmbsq";  
    cargoSha256 = "171ciff7jny8x3kmv5zmnzm1zrxrj7d86mi77li7hq65kz4m7ykk";
   };
 };
 # END HOLONIX IMPORT BOILERPLATE

in
with holonix.pkgs;
{
 dev-shell = stdenv.mkDerivation (holonix.shell // {
  name = "dev-shell";

  buildInputs = [ ]
   ++ holonix.shell.buildInputs
   ++ config.buildInputs
  ;
 });
}
