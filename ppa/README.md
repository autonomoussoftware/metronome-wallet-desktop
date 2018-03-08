# Building for Launchpad PPA

Launchpad pacakges need to be signed by someone who has signed the Ubuntu Code of Conduct so they cannot be completely done by an automated build system.

To post a `.deb` on Launchpad for Ubuntu a debian source package needs to be made and uploaded which is then built into a binary `.deb` by Launchpad.  Since this wallet is made with Electron this is complicated since the normal Electron build process download node packages (including electron) from the internet which is not possible for a source deb to do.  Since we are providing code, as a comprimise, we will generate a source deb that contains the mostly prebuilt files for amd64.

For compatibility purposes it is best to do this on Ubuntu 16.04/Xenial (the oldest system we are distributing for).

```
yarn install
yarn dist
yarn ppa
VER=0.6.0
cd ppa/app
dch -i --distribution xenial
debuild -us -uc
dch -i --distribution artful
debuild -us -uc
dch -i --distribution bionic
debuild -us -uc
cd ..
debsign *.changes *.dsc
dput ppa:metronome/metronome-desktop-wallet metronome-desktop-wallet_$VER-1xenial_source.changes
dput ppa:metronome/metronome-desktop-wallet metronome-desktop-wallet_$VER-1artful_source.changes
dput ppa:metronome/metronome-desktop-wallet metronome-desktop-wallet_$VER-1bionic_source.changes
```
