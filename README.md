# Iron Atlas

## Install the Following

- Install [NodeJS](https://nodejs.org/en/download/prebuilt-installer).
  Select version `20`. As of Dec 10, the latest is `v20.18.1`
- Install [Android Studio](https://developer.android.com/studio)
- Install [Java 17](https://www.oracle.com/java/technologies/javase/jdk17-archive-downloads.html)

## If you're on Linux

### Installing Android Studio

Install the requried libraries

```bash
sudo apt-get install libc6:i386 libncurses5:i386 libstdc++6:i386 lib32z1 libbz2-1.0:i386
```

Install ninja-build

```bash
sudo apt install ninja-build
```

Once you install the `.tar.gz` follow the instructions or the video [here](https://developer.android.com/studio/install#64bit-libs)

### Create Desktop Entry

To make a desktop entry for Android Studio

- Projects > New Project > No Activity > Finish >
  "Press Hamburger Menu on Top Left" > Tools > Create Desktop Entry

To go back to Main Menu

- "Press Hamburger Menu on Top Left" > File > Close Project

## Open Android Emulator

Projects > More Actions > Virtual Device Manager >
"Select Device and Press Play button"

## Final Steps

Inside the root of the project run the following to install all dependencies

```bash
npm i && npx expo install
```

Then run

```bash
npx expo run:android
```

- If you get an error saying `Failed to resolve the Android SDK path. Default install location not found: /home/user/Android/sdk. Use ANDROID_HOME to set the Android SDK location`
  run this command

  ```bash
  export ANDROID_HOME="/home/user/Android/Sdk"
  npx expo run:android
  ```

**NOTE**: This may take a while, since its your first time creating this. If
this is your first time trying to run the application run the following.

```bash
cd android
./gradlew clean
cd ..
npx expo run:android
```

## Errors You May Encounter

### Android SDK Path

`Failed to resolve the Android SDK path. Default install location not found: /home/user/Android/sdk. Use ANDROID_HOME to set the Android SDK location`

Run the following command.

```bash
export ANDROID_HOME="/home/user/Android/Sdk"
```

### Insufficient Storage

`Error: adb: failed to install /home/user/Desktop/IronAtlas/android/app/build/outputs/apk/debug/app-debug.apk: Failure [INSTALL_FAILED_INSUFFICIENT_STORAGE: Failed to override installation location]`

Wipe the data like so.

![Android Studio](/imgs/androidStudioWiping.png)

Then run the following inside the root of the project.

```bash
cd android
./gradlew clean
cd ..
npx expo run:android
```
