let 
  holonixPath = builtins.fetchTarball {
    url = "https://github.com/holochain/holonix/archive/cdf1d199d5489ebc943b88e552507f1063e3e571.tar.gz";
    sha256 = "1b5pdlxj91syg1qqf42f49sxlq9qd3qnz7ccgdncjvhdfyricagh";
  };
  holonix = import (holonixPath) {
    includeHolochainBinaries = true;
    holochainVersionId = "custom";
    
    holochainVersion = { 
     rev = "d92678918b1b85f7ef40b866bdec0ea52cba77c4";  
     sha256 = "1shjdsr822qmwbifpm8vs5p7g2gs0s74ipbqq30g223dgqxlq6wa";  
     cargoSha256 = "19faydkxid1d2s0k4jks6y6plgchdhidcckacrcs841my6dvy131";
     bins = {
       holochain = "holochain";
       hc = "hc";
     };
    };
  };
in holonix.main
