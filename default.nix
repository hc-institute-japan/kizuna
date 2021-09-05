let
  holonixPath = builtins.fetchTarball {
    url = "https://github.com/holochain/holonix/archive/55a5eef58979fb6bc476d8c3e0c028cdeb1b5421.tar.gz";
    sha256 = "sha256:0q6d0rql1pyy93xw1c8s28jjjcgk1zgwxwixsp9z5r4w2ihaz3zg";
  };
  holonix = import (holonixPath) {
    includeHolochainBinaries = true;
    holochainVersionId = "custom";

    holochainVersion = {
     rev = "ce56118245b88f41e9a1ce246108fa03f718533e";
     sha256 = "sha256:0mcakgva42m5nrmznjax6xd8cvy99l7hdn7zh4yf589z59kiv4nq";
     cargoSha256 = "sha256:1ghrwrcwwlvhbzmjzm0kd8ab98376glszan35a5dwlh1pgc6s656";
     bins = {
       holochain = "holochain";
       hc = "hc";
       kitsune-p2p-proxy = "kitsune_p2p/proxy";
     };
     lairKeystoreHashes = {
       sha256 = "0khg5w5fgdp1sg22vqyzsb2ri7znbxiwl7vr2zx6bwn744wy2cyv";
       cargoSha256 = "1lm8vrxh7fw7gcir9lq85frfd0rdcca9p7883nikjfbn21ac4sn4";
     };
    };
  };
in holonix.main
