---
title: "I Built a KMP Library for In-App Updates (So You Don't Have To)"
excerpt: "Introducing kmp-app-updater — a Kotlin Multiplatform library that handles checking for updates, downloading them, and installing them on Android and Desktop. With pluggable update sources and Compose UI components."
publishDate: 2026-02-22
tags: ['kotlin', 'kmp', 'android', 'desktop', 'compose', 'open-source', 'github-releases']
quickLinks:
  - title: GitHub
    link: https://github.com/pavi2410/kmp-app-updater
  - title: Maven Central
    link: https://central.sonatype.com/namespace/com.pavi2410.kmp-app-updater
---

## The Problem

If you distribute your app outside the Play Store — say via GitHub Releases, your own server, or some internal distribution channel — there's no built-in mechanism for updates. Users are stuck on whatever version they installed unless they manually go check for a new one.

On Android, Google Play handles this silently. But what if you're sideloading? Or what if you're building a Desktop JVM app where there's no store at all?

I ran into this exact problem. I wanted a single library that works across Android and Desktop, checks GitHub Releases for new versions, downloads the right asset, and kicks off the installation. And I wanted it to be pluggable — not everyone uses GitHub.

So I built [kmp-app-updater](https://github.com/pavi2410/kmp-app-updater).

## What It Does

The core flow is simple:

```
Idle → Checking → UpdateAvailable → Downloading(progress) → ReadyToInstall
                → UpToDate
                → Error
```

You get a `StateFlow<UpdateState>` that drives your UI. No callbacks, no listeners, just reactive state. If you've used Jetpack Compose or any reactive framework, this should feel natural.

The library ships in two modules:

- **`core`** — the headless engine: update sources, downloader, installer, state machine
- **`compose-ui`** — optional Compose Multiplatform UI components (`UpdateCard`, `UpdateBanner`, `DownloadProgressIndicator`)

## Quick Start

### Android

```kotlin
val updater = AppUpdater.github(
    context = applicationContext,
    owner = "pavi2410",
    repo = "kmp-app-updater",
)
```

That's it. The library auto-detects your current version from `PackageManager`, picks the right `.apk` asset from the latest release, downloads it to cache, and uses `PackageInstaller` to prompt the user.

### Desktop

```kotlin
val updater = AppUpdater.github(
    owner = "pavi2410",
    repo = "kmp-app-updater",
    currentVersion = "1.0.0",
)
```

Same idea, but you pass the version explicitly (no `PackageManager` on Desktop). It'll match `.msi`, `.dmg`, or `.deb` based on the OS.

### With Compose UI

If you don't want to build your own update UI:

```kotlin
UpdateCard(updater = updater)
```

One line. It renders a card that shows the update state, a progress bar during download, and an install button when ready.

## The Architecture

I didn't want this to be a "GitHub-only" library. The key abstraction is `UpdateSource`:

```kotlin
interface UpdateSource {
    suspend fun fetchReleases(): List<ReleaseInfo>
}
```

`GitHubUpdateSource` implements this for GitHub Releases. But you can implement it for GitLab, your own REST API, an S3 bucket — whatever. The `AppUpdater` doesn't care where the releases come from.

```kotlin
val updater = AppUpdater(
    currentVersion = "1.0.0",
    source = MyCustomSource(),
    downloader = myDownloader,
    installer = myInstaller,
    assetMatcher = { it.endsWith(".msi") },
)
```

Everything is pluggable. The default implementations wire up OkHttp on Android and Java's HttpClient on Desktop, but you can swap any component.

## Pre-Release Support

Sometimes you want beta testers to get pre-releases. Just flip a flag:

```kotlin
val updater = AppUpdater.github(
    context = applicationContext,
    owner = "pavi2410",
    repo = "kmp-app-updater",
    includePreReleases = true,
)
```

Without this flag, the library hits `/releases/latest` which only returns stable releases. With it, it fetches the 10 most recent releases and picks the newest one, including pre-releases.

## Background Update Checks

Nobody opens an app just to check for updates. You want this to happen in the background.

### Android (WorkManager)

```kotlin
class UpdateCheckWorker(
    context: Context,
    params: WorkerParameters,
) : CoroutineWorker(context, params) {

    override suspend fun doWork(): Result {
        val updater = AppUpdater.github(
            context = applicationContext,
            owner = "your-org",
            repo = "your-app",
        )
        val release = updater.checkForUpdate()
        if (release != null) {
            // Show a notification
        }
        return Result.success()
    }
}

// Schedule it
val request = PeriodicWorkRequestBuilder<UpdateCheckWorker>(24, TimeUnit.HOURS)
    .setConstraints(
        Constraints.Builder()
            .setRequiredNetworkType(NetworkType.CONNECTED)
            .build()
    )
    .build()

WorkManager.getInstance(context).enqueueUniquePeriodicWork(
    "update_check",
    ExistingPeriodicWorkPolicy.KEEP,
    request,
)
```

### Desktop (Coroutine Timer)

```kotlin
scope.launch {
    while (isActive) {
        updater.checkForUpdate()
        delay(24.hours)
    }
}
```

## Setting Up Your Release Workflow

The library fetches releases from the GitHub Releases API, so you need your releases to be structured in a way it can understand. Here's what matters and how to automate it.

### What the Library Expects

When the library checks for updates, it looks at your GitHub releases and:

1. Parses the **tag name** as the version (e.g., `v1.2.0` → `1.2.0`)
2. Scans the **release assets** for a file matching the platform (`.apk` for Android, `.msi`/`.dmg`/`.deb` for Desktop)
3. Compares the release version against the app's current version

So your releases need two things: a semver tag and the right binary attached as an asset.

### A Minimal GitHub Actions Workflow

Here's a workflow that builds your app and attaches the binaries to a GitHub release whenever you create one:

```yaml
name: Release

on:
  release:
    types: [released, prereleased]

permissions:
  contents: write

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-java@v5
        with:
          java-version: 21
          distribution: temurin
      - uses: gradle/actions/setup-gradle@v5

      # Decode your release keystore (stored as a base64 GitHub secret)
      - name: Decode keystore
        run: echo "${{ secrets.KEYSTORE_BASE64 }}" | base64 -d > app/release.keystore

      - name: Build release APK
        run: ./gradlew :app:assembleRelease

      # Attach the APK to the GitHub release that triggered this workflow
      - uses: softprops/action-gh-release@v2
        with:
          files: app/build/outputs/apk/release/app-release.apk
```

Create a release on GitHub with a tag like `v1.2.0`, and this workflow builds your APK and attaches it. The library will find it on the next update check.

### Multi-Platform (Android + Desktop)

If you're shipping Desktop too, add parallel jobs using the appropriate runner for each OS:

```yaml
  build-desktop:
    strategy:
      matrix:
        include:
          - os: ubuntu-latest
          - os: windows-latest
          - os: macos-latest
    runs-on: ${{ matrix.os }}
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-java@v5
        with:
          java-version: 21
          distribution: temurin
      - uses: gradle/actions/setup-gradle@v5
      - run: ./gradlew packageDistributionForCurrentOS
      - uses: softprops/action-gh-release@v2
        with:
          files: |
            build/compose/binaries/main/**/*.deb
            build/compose/binaries/main/**/*.msi
            build/compose/binaries/main/**/*.dmg
```

The library's default asset matcher picks the right file based on the user's OS. You can also override it:

```kotlin
val updater = AppUpdater.github(
    // ...
    assetMatcher = { it.name.endsWith("-arm64.dmg") },
)
```

### Signing — The One Thing You Can't Skip

**This is the #1 gotcha.** Android refuses to install an update if the new APK is signed with a different key than the installed one. Your CI builds and local builds must use the same keystore.

The easiest setup:

1. Generate a release keystore
2. Base64-encode it and store it as a GitHub secret (`KEYSTORE_BASE64`)
3. Decode it in CI before building

```bash
# Generate
keytool -genkeypair -v -keystore release.keystore \
  -alias release -keyalg RSA -keysize 2048 -validity 36500 \
  -storepass yourpassword -keypass yourpassword \
  -dname "CN=Your App, O=Your Org"

# Upload to GitHub secrets
base64 release.keystore | gh secret set KEYSTORE_BASE64
```

Add the keystore to `.gitignore` so it never gets committed.

### Pre-Releases for Beta Testing

Mark a GitHub release as a "pre-release" and it won't show up via `/releases/latest`. Your stable users won't see it. But beta testers running with `includePreReleases = true` will. This gives you a clean way to do staged rollouts without any server-side infrastructure.

## Things to Watch Out For

**R8 + WorkManager** — If you enable `isMinifyEnabled = true`, add a ProGuard rule to keep WorkManager's Room internals. Otherwise R8 strips `WorkDatabase_Impl` and your app crashes on launch:

```proguard
-keep class androidx.work.impl.** { *; }
```

**`/releases/latest` skips pre-releases** — This is GitHub API behavior, not a bug. If your only release is a pre-release, the library won't find it unless `includePreReleases = true` is set.

**Signing key mismatch** — If an update download succeeds but installation fails with "package conflicts with an existing package", the signing keys don't match. Use the same keystore on local and CI.

## Get It

```kotlin
// build.gradle.kts
dependencies {
    implementation("com.pavi2410.kmp-app-updater:core:0.1.0")
    implementation("com.pavi2410.kmp-app-updater:compose-ui:0.1.0") // optional
}
```

The source is on [GitHub](https://github.com/pavi2410/kmp-app-updater), and it should show up on [klibs.io](https://klibs.io) shortly.

If you have feedback or ideas, open an issue. I'd love to hear what other update sources people want — GitLab, Bitbucket, custom HTTP, whatever.
