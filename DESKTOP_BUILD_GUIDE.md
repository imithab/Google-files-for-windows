# Files Studio - Windows Desktop Executable (.exe) Build Guide

Files Studio is fully architected and ready to be compiled into a standalone Windows `.exe` desktop application (both portable executable and NSIS installer).

## Architecture Highlights
- **Frameless Window**: Custom Google Material Design title bar with minimize, maximize, and close controls connected via secure Electron IPC (`electron/preload.cjs`).
- **Unified Engine**: Direct filesystem simulation and management or local Express engine serving files.
- **Relative Asset Resolution**: Configured with `base: './'` in `vite.config.ts` for native offline `file://` execution.

---

## 🚀 How to Build the `.exe` Executable

### 1. Build Production Assets
Run the Vite build command:
```bash
npm run build
```
This produces optimized production bundles in the `dist/` directory.

### 2. Generate the Windows `.exe`
You can produce the Windows executable using either of the two standard tools:

#### Option 1: Using `electron-builder` (Recommended for NSIS installer or Portable .exe)
```bash
npx electron-builder --win --x64
```
Output will be placed in the `release/` directory:
- `Files Studio Setup.exe` (Installer)
- `Files Studio.exe` (Standalone portable executable)

#### Option 2: Using `electron-packager` (Instant unpackaged folder with .exe)
```bash
npx electron-packager . "Files Studio" --platform=win32 --arch=x64 --out=release-builds --overwrite
```
Output will be in `release-builds/Files Studio-win32-x64/Files Studio.exe`.

### 3. Test Running Desktop Window Locally
```bash
npx electron electron/main.cjs
```
