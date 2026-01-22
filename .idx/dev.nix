{ pkgs, ... }: {
  # Add the Firebase CLI, Flutter SDK, and build tools to your environment
  packages = [
    pkgs.firebase-tools
    pkgs.flutter
    pkgs.cmake
    pkgs.ninja
    pkgs.gcc
    pkgs.clang
    pkgs.pkg-config
    # Add GTK and GLib for Flutter Linux desktop support
    pkgs.gtk3
    pkgs.glib
  ];

  # Set environment variables to help pkg-config find libraries
  env = {
    PKG_CONFIG_PATH = "${pkgs.gtk3}/lib/pkgconfig:${pkgs.glib}/lib/pkgconfig";
  };
}
