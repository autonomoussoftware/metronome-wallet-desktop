# Building for Launchpad PPA

Launchpad pacakges need to be signed by someone who has signed the Ubuntu Code of Conduct so they cannot be done by an automated build system.

To post a `.deb` on Launchpad for Ubuntu a debian source package needs to be made and uploaded which is then built into a binary `.deb` by Launchpad.  Since this wallet is made with Electron this is complicated since the normal Electron build process download node packages (including electron) from the internet which is not possible for a source deb to do.  Since we are providing code, as a comprimise, we will generate a source deb that contains the mostly prebuilt files for amd64.

For compatibility purposes it is best to do this on Ubuntu 16.04/Xenial (the oldest system we are distributing for).

If this is a new version of the wallet you will need to update the changelog for the new version with `dch -ir xenail` before the first `debuild` run.

```
yarn install
yarn dist
VER=0.6.0
TARFILE=metronome-desktop-wallet_$VER.orig.tar.gz
DEBFILE=metronome-desktop-wallet_v$VER.deb
mkdir -p dist/app
dpkg -x dist/$DEBFILE ./dist/app/
rm -r dist/app/opt/Metronome\ Wallet/resources/app.asar.unpacked/node_modules/7zip-bin-linux/arm*
tar -czf ppa/$TARFILE -C dist/ app/
rm -r dist/app/
cd ppa/
tar -xzf $TARFILE
cd app
debuild -us -uc
debsign
cd ..
dput ppa:metronome/metronome-desktop-wallet metronome-desktop-wallet_$VER-1xenial_source.changes
cd app
dch -ir artful
debuild -us -uc
debsign
cd ..
dput ppa:metronome/metronome-desktop-wallet metronome-desktop-wallet_$VER-1artful_source.changes
cd app
dch -ir bionic
debuild -us -uc
debsign
cd ..
dput ppa:metronome/metronome-desktop-wallet metronome-desktop-wallet_$VER-1bionic_source.changes
```

