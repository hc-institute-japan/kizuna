let 
  holonixPath = builtins.fetchTarball {
    url = "https://github.com/holochain/holonix/archive/3e94163765975f35f7d8ec509b33c3da52661bd1.tar.gz";
    sha256 = "07sl281r29ygh54dxys1qpjvlvmnh7iv1ppf79fbki96dj9ip7d2";
  };
  holonix = import (holonixPath) {
    includeHolochainBinaries = true;
    holochainVersionId = "custom";
    
    holochainVersion = { 
     rev = "a6ac0439670ba367c723a80d3b8bc7c419aa5f6e";
     sha256 = "16a9mjq8g40mp5120714ff5wpks74n3n39liswikqqf1sxabza9c";
     cargoSha256 = "0sbr6ag5dyv7gdchpp5zjwzbsr1ggvxnmik21wm71gjd8hhwcdy6";
     bins = {
       holochain = "holochain";
       hc = "hc";
     };
    };
    holochainOtherDepsNames = ["lair-keystore"];
  };
in holonix.main