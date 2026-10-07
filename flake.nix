{
  description = "bridget";
  inputs.nixpkgs.url = "github:nixos/nixpkgs?ref=nixos-unstable";
  outputs =
    { self, ... }@inputs:
    let
      supportedSystems = [
        "x86_64-linux"
        "aarch64-linux"
        "aarch64-darwin"
      ];
      forEachSupportedSystem =
        f:
        inputs.nixpkgs.lib.genAttrs supportedSystems (
          system:
          f {
            pkgs = import inputs.nixpkgs { inherit system; };
          }
        );
    in
    {
      devShells = forEachSupportedSystem (
        { pkgs }:
        {
          default = pkgs.mkShellNoCC {
            packages = with pkgs; [
              nodejs_24
              pnpm_11
              hugo
              go
            ];
          };
        }
      );
    };
}
