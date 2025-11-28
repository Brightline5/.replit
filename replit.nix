{pkgs}: {
  deps = [
    pkgs.openssh_gssapi
    pkgs.haskellPackages.wai-middleware-caching-redis
    pkgs.rPackages.dotenv
    pkgs.rPackages.tsxtreme
    pkgs.haskellPackages.network-data
  ];
}
