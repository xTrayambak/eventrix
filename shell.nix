with import <nixpkgs> { };

mkShell {
  nativeBuildInputs = [
    pkg-config
    python3
    python313Packages.flask
    python313Packages.simplesqlite
    sqlite
  ];

  shellHook = ''
    alias run-app="flask --app src.main run"
  '';

  LD_LIBRARY_PATH = lib.makeLibraryPath [
    sqlite.dev
  ];
}
