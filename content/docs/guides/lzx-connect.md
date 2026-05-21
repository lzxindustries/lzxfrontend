---
draft: false
sidebar_position: 10
slug: /docs/guides/lzx-connect
title: 'LZX Connect Guide'
description: 'Install the LZX Connect desktop app, update Videomancer firmware, and manage program libraries over USB.'
---

# LZX Connect Guide

LZX Connect is the desktop companion app for LZX Industries instruments. It handles firmware updates and program library management over USB, without opening the instrument or handling SD cards.

**Current support:** Videomancer. Chromagnon support is in development.

---

## Installation

Download the latest release for your operating system from the [LZX Connect](/connect) page.

### Windows

Run the `.exe` or `.msi` installer. No additional drivers are required. If Windows SmartScreen warns about an unsigned publisher, click **More info → Run anyway**.

### macOS

Open the `.dmg`, drag LZX Connect to your Applications folder, and launch it. On first launch macOS will block it with a Gatekeeper dialog — go to **System Settings → Privacy & Security** and click **Open Anyway**.

### Linux

Use the `.deb` package on Debian/Ubuntu-based systems (`sudo dpkg -i lzx-connect_*.deb`), or run the `.AppImage` directly after making it executable (`chmod +x LZX-Connect*.AppImage`). To use LZX Connect without `sudo`, add your user to the `dialout` group:

```bash
sudo usermod -aG dialout $USER
```

Log out and back in for the group change to take effect.

---

## Connecting Videomancer

1. Power Videomancer on.
2. Connect the USB-C **Device** port on Videomancer (not the Host port) to your computer using a USB-C data cable. Charge-only cables will not work.
3. Open LZX Connect. The Videomancer device card appears showing the current firmware version.

:::note
LZX Connect requires Videomancer firmware **1.x.x or later**. If your device is running firmware 0.1.8, use the [manual BOOT button method](#firmware-update-manual-boot-button-method) to upgrade to 1.x.x first. LZX Connect cannot perform this initial upgrade.
:::

---

## Firmware Updates via LZX Connect

This method works for updates within the 1.x.x release series.

:::note Pre-release firmware
Firmware 1.x.x is currently **pre-release**. If no updates appear after clicking Check for Updates, enable **Show pre-releases** in LZX Connect settings and check again.
:::

1. Open LZX Connect and connect Videomancer via USB-C.
2. The device card shows the currently installed firmware version.
3. Click **Check for Updates**. LZX Connect downloads and installs the latest available release.
4. Videomancer reboots automatically when the update completes.

---

## Firmware Update: Manual BOOT Button Method

Use this method when:
- Upgrading from firmware **0.1.8** to 1.x.x (required — LZX Connect cannot do this)
- LZX Connect is unavailable or not detecting the device
- Recovering from a failed update

:::caution
Close LZX Connect and any other software that opens serial ports before entering BOOT mode. Having LZX Connect open while the device is in BOOT mode can interrupt the process.
:::

**Requirements:** USB-C data cable, Windows / macOS / Linux computer.

1. Download the firmware `.UF2` file from the [Videomancer Downloads](/instruments/videomancer/downloads) page.
2. Connect Videomancer to its power supply and switch power to **OFF**.
3. Connect the computer's USB port to Videomancer's USB-C **Device** port.
4. Hold down the **BOOT** button on Videomancer.
5. Switch Videomancer power to **ON**.
6. Release the **BOOT** button.
7. A USB storage device appears in the computer's file system (shown as a Raspberry Pi — this is the RP2040 that manages Videomancer's USB ports).
8. Copy the `.UF2` file to the detected drive.
9. Videomancer reboots automatically into the new firmware.

---

## Install Program Library

LZX Connect can install program library archives directly to Videomancer's microSD card over USB.

**Supported libraries:**
- **Official LZX Program Library** — available from the [Videomancer Downloads](/instruments/videomancer/downloads) page.
- **Community Programs Library** — available from [videomancer-community-programs releases](https://github.com/lzxindustries/videomancer-community-programs/releases). Signed releases load without Developer Mode on firmware 1.x.x.

**Steps:**

1. Download the library archive (`.zip` or folder of `.vmprog` files) to your computer.
2. Open LZX Connect and connect Videomancer via USB-C.
3. Select **Install Program Library** in the Videomancer device card.
4. Choose the library archive on your computer.
5. LZX Connect copies the `.vmprog` files to the `programs/` folder on the microSD card.
6. Videomancer triggers a rescan and the new programs appear in the program selector on next boot.

If the microSD card is not present or not detected, LZX Connect will show an error. Insert the card and power cycle Videomancer before retrying.

---

## Load VMPROG File (Development Sideload)

**Load VMPROG File** streams a single `.vmprog` directly to Videomancer's RAM over USB. The program runs immediately without writing to the SD card. It does not persist across reboots — Videomancer returns to the previously selected program on power cycle.

This feature is intended for developers testing programs under active development.

1. Open LZX Connect and connect Videomancer via USB-C.
2. Select **Load VMPROG File**.
3. Choose the `.vmprog` file on your computer.
4. The program loads and runs immediately.

See the [Videomancer SDK](https://github.com/lzxindustries/videomancer-sdk) for tools to build and sign `.vmprog` files.

---

## Troubleshooting

**Device not detected**
- Use a USB-C data cable, not a charge-only cable.
- Make sure Videomancer is powered on before opening LZX Connect.
- On Windows, try running LZX Connect as Administrator.
- On Linux, confirm your user is in the `dialout` group (see [Installation](#installation)).
- Firmware 0.1.8 cannot connect to LZX Connect — upgrade to 1.x.x using the [BOOT button method](#firmware-update-manual-boot-button-method) first.

**Firmware update fails midway**
Do not disconnect power or USB during a firmware update. If an update fails, power cycle Videomancer and retry in LZX Connect. If the device enters a fault state, consult the [Fault Codes Reference](/instruments/videomancer/manual/fault-codes-reference) or use the BOOT button method to reinstall firmware.

**Program library install stalls**
Power cycle Videomancer and retry. Ensure the microSD card is seated and formatted FAT32. As a fallback, copy `.vmprog` files directly to the `programs/` folder on the SD card using a card reader.
