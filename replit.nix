{pkgs}: {
  deps = [
    pkgs.haskellPackages.trhsx
    pkgs.sbclPackages.parse-float
    pkgs.nodePackages_latest.dotenv-cli 
  ];
}
