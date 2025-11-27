{pkgs}: {
  deps = [
    pkgs.haskellPackages.wai-middleware-caching-redis
    pkgs.rPackages.dotenv
    pkgs.rPackages.tsxtreme
    pkgs.haskellPackages.network-data
  ];
}
