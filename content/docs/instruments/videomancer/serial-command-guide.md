---
draft: false
sidebar_position: 3
slug: /instruments/videomancer/serial-command-guide
title: 'Serial Port Guide'
image: /img/instruments/videomancer/videomancer_frontpanel.png
description: "Complete reference for Videomancer's text-based serial command interface over USB CDC, including program management, presets, settings, MIDI monitoring, and filesystem access."
---

# Serial Port Guide

Videomancer exposes a text-based command interface over its USB-C connection. Any serial terminal or scripting language with serial port support can send commands and receive responses. This opens the door to automation, preset management, integration with custom software, and deep system introspection — all from a simple terminal window.

---

## Connection Setup

1. Connect Videomancer to your computer via the **USB-C** port.
2. Videomancer enumerates as a **USB CDC ACM** virtual COM port.
3. Open the port at any baud rate — the baud rate setting is ignored for USB CDC. Common tools include:
   - **macOS / Linux**: `screen /dev/ttyACM0`, `picocom`, `minicom`, or Python's `pyserial`
   - **Windows**: PuTTY, Tera Term, or any COM port terminal

No login or authentication is needed — Videomancer accepts commands immediately.

---

## Wire Protocol

### Sending Commands

Send a newline-terminated (`\n`) ASCII string:

```
<command> [arguments]\n
```

- Lines are limited to **511 bytes** before the newline.
- A carriage return (`\r`) is treated as a newline.
- Non-printable characters below `0x20` (except Backspace and Delete) are silently dropped.
- Backspace (`0x08`) and Delete (`0x7F`) erase the most recent character.

### Receiving Responses

| Prefix   | Meaning    | Format                                   |
| -------- | ---------- | ---------------------------------------- |
| `@`      | Success    | `@<command>:<payload>\n`                 |
| `!`      | Error      | `!<code>:<message>\n`                    |
| _(none)_ | Log output | Plain text line (when logging is active) |

The **payload** is either a simple string (e.g., `ok`) or a JSON object. All responses are newline-terminated.

### Error Codes

| Code | Name                  | Description                             |
| ---- | --------------------- | --------------------------------------- |
| 1    | `unknown_command`     | Unrecognized command                    |
| 2    | `parse_error`         | Malformed arguments                     |
| 3    | `service_unavailable` | Required service not ready              |
| 4    | `buffer_overflow`     | Command exceeded 511-byte limit         |
| 5    | `not_connected`       | CDC port not connected                  |
| 6    | `file_not_found`      | File or directory not found             |
| 7    | `io_error`            | Filesystem I/O failure                  |
| 8    | `sd_not_mounted`      | SD card not mounted                     |
| 9    | `path_too_long`       | Path exceeds maximum length             |
| 10   | `invalid_path`        | Path is malformed (e.g., contains `..`) |

---

## Commands

### General

#### `version`

Returns the firmware version string.

```
> version
@version:2.1.0
```

Development builds include commit count and hash:

```
@version:2.1.0-rc.1+15.abc1234
```

#### `serial`

Returns the board's unique hardware ID as a hex string.

```
> serial
@serial:E6614104035B8F2F
```

#### `status`

Returns system status as JSON.

```
> status
@status:{"current_program":"cascade","video_standard":"hd_1080i","sd_mounted":true}
```

#### `help`

Lists all available commands, pipe-delimited.

```
> help
@help:version|serial|status|reboot bootloader|programs list|program load|...
```

#### `reboot bootloader`

Reboots Videomancer into USB mass-storage (BOOTSEL) mode for firmware update. The CDC connection drops immediately — reconnect after flashing new firmware.

```
> reboot bootloader
```

---

### FPGA Programs

#### `programs list [offset]`

Lists installed FPGA programs with paginated JSON output. Programs are listed in directory order.

```
> programs list
@programs:{"count":343,"programs":["afterdark","afterimage","alcove",...],"more":true,"next":40}
```

| Field      | Type    | Description                                                   |
| ---------- | ------- | ------------------------------------------------------------- |
| `count`    | number  | Total number of installed programs                            |
| `programs` | array   | Program names in this page                                    |
| `more`     | boolean | `true` if more pages remain                                   |
| `next`     | number  | Offset for the next page (present only when `more` is `true`) |

To retrieve all programs, page through until `more` is `false`:

```
> programs list
> programs list 40
> programs list 80
```

#### `program load <name>`

Loads an FPGA program by name. Matching is **case-insensitive**.

```
> program load cascade
@program:ok
```

This triggers the full program-load workflow: video sync suspension, loading screen, FPGA bitstream load, factory preset application, and video output resume.

:::tip
After sending `program load`, allow approximately 1–2 seconds for the full load workflow to complete before querying program state or presets.
:::

#### `program state`

Returns the current modulator state for all 12 parameter channels as JSON.

```
> program state
@program:{"ch":[512,512,512,512,512,512,0,0,0,0,0,512],"mod":[...]}
```

---

### Program Presets

Presets come in two types:

- **Factory presets** — bundled with the FPGA program, read-only.
- **User presets** — saved by the user, stored in flash.

#### `program presets list`

Lists all presets for the currently loaded program.

```
> program presets list
@program:{"factory":[{"n":"Default","m":[512,512,...]}],"user":[...],"flash_free":131072}
```

#### `program presets get <index> <type>`

Returns full preset data. Type is `factory` or `user`.

```
> program presets get 0 factory
@program:{"n":"Default","m":[512,512,512,512,512,512,0,0,0,0,0,512]}
```

User presets include additional modulation fields: `t` (time), `sp` (space), `sl` (slope), and `sr` (source).

#### `program presets apply <index> <type>`

Applies a preset by numeric index and type.

```
> program presets apply 0 factory
@program:ok
```

#### `program presets apply <name>`

Applies a preset by name (case-insensitive). Factory presets are searched first, then user presets.

```
> program presets apply Default
@program:ok
```

#### `program presets save <index> <name> [data]`

Saves the current modulator state as a user preset at the given slot.

```
> program presets save 0 MyPreset
@program:ok
```

To save explicit values, append parameter data:

```
> program presets save 0 MyPreset m:512,512,512,512,512,512,0,0,0,0,0,512
```

Full modulation data fields: `m:` (manual), `t:` (time), `sp:` (space), `sl:` (slope), `sr:` (source).

#### `program presets delete <index>`

Deletes a user preset at the given index. Returns the updated preset list.

```
> program presets delete 2
@program:{"factory":[...],"user":[...],"flash_free":135168}
```

#### `program presets rename <index> <name>`

Renames a user preset.

```
> program presets rename 0 NewName
@program:ok
```

---

### Settings

#### `settings export`

Exports all settings as a JSON object.

```
> settings export
@settings:{"video_routing_mode":0,"analog_video_in_mode":1,...}
```

#### `settings import <json>`

Imports settings from a JSON object. Replaces all settings atomically.

```
> settings import {"video_routing_mode":0,"analog_video_in_mode":1}
@settings:ok
```

---

### MIDI Monitor

#### `midi monitor on`

Enables MIDI input monitoring. Incoming MIDI messages are printed as log lines.

```
> midi monitor on
@midi:ok
```

#### `midi monitor off`

Disables MIDI monitoring.

```
> midi monitor off
@midi:ok
```

#### `midi monitor verbose`

Enables verbose MIDI monitoring with hex dumps.

```
> midi monitor verbose
@midi:ok
```

---

### Filesystem

All filesystem commands operate on the SD card. Paths must begin with `sd:/`.

#### `fs info`

Returns filesystem mount status and capacity.

```
> fs info
@fs:{"sd_mounted":true,"sd_total":31914983424,"sd_free":31012864000}
```

#### `fs ls [path]`

Lists directory contents. Defaults to `sd:/` if no path is given. Output is paginated JSON.

```
> fs ls sd:/programs
@fs:{"path":"sd:/programs","entries":[{"n":"cascade.vmprog","s":45056,"d":false},...]}
```

#### `fs stat <path>`

Returns file or directory metadata.

```
> fs stat sd:/programs/cascade.vmprog
@fs:{"path":"sd:/programs/cascade.vmprog","size":45056,"is_dir":false}
```

#### `fs mkdir <path>`

Creates a directory, including parent directories.

```
> fs mkdir sd:/presets
@fs:ok
```

#### `fs rm <path>`

Removes a file or empty directory.

```
> fs rm sd:/presets/old.json
@fs:ok
```

#### `fs rename <old_path> <new_path>`

Renames or moves a file or directory.

```
> fs rename sd:/presets/a.json sd:/presets/b.json
@fs:ok
```

#### `fs read <path> <offset> <length>`

Reads a chunk of a file. The response payload is base64-encoded.

```
> fs read sd:/programs/cascade.vmprog 0 256
@fs:SGVsbG8gV29ybGQ=...
```

#### `fs write <path> <offset> <base64_data>`

Writes a base64-encoded chunk to a file.

```
> fs write sd:/test.txt 0 SGVsbG8=
@fs:ok
```

---

## Python Example

The following script demonstrates communicating with Videomancer using [pyserial](https://pypi.org/project/pyserial/). It covers connection, paginated program listing, program loading, preset application, and settings export.

```python
import serial
import json
import time

def open_videomancer(port="/dev/ttyACM0", timeout=2):
    """Open a serial connection to Videomancer."""
    return serial.Serial(port, timeout=timeout)

def send_command(ser, command):
    """Send a command and return the response line."""
    ser.reset_input_buffer()
    ser.write(f"{command}\n".encode("ascii"))
    line = ser.readline().decode("ascii").strip()
    return line

def parse_response(line):
    """Parse a response line into (prefix, key, payload)."""
    if line.startswith("@"):
        key, _, payload = line[1:].partition(":")
        return "ok", key, payload
    elif line.startswith("!"):
        code, _, message = line[1:].partition(":")
        return "error", code, message
    return "log", "", line

def get_json_response(ser, command):
    """Send a command and parse the JSON payload."""
    line = send_command(ser, command)
    status, key, payload = parse_response(line)
    if status == "error":
        raise RuntimeError(f"Error {key}: {payload}")
    return json.loads(payload)

# --- Usage ---

ser = open_videomancer()

# Get firmware version
print("Version:", send_command(ser, "version"))

# List all programs (paginated)
all_programs = []
offset = 0
while True:
    data = get_json_response(
        ser, f"programs list {offset}" if offset else "programs list"
    )
    all_programs.extend(data["programs"])
    if not data.get("more", False):
        break
    offset = data["next"]
print(f"Found {len(all_programs)} programs")

# Load a program
print(send_command(ser, "program load cascade"))

# Wait for load to complete
time.sleep(2)

# Apply a factory preset by name
print(send_command(ser, "program presets apply Default"))

# Export settings
settings = get_json_response(ser, "settings export")
print("Settings:", json.dumps(settings, indent=2))

ser.close()
```

---

## Notes

- **Response buffer**: Videomancer has a 768-byte response buffer. Commands that produce large output (e.g., `programs list`, `fs ls`) use pagination to stay within this limit.
- **Concurrent access**: Only one serial terminal should be connected at a time. The shell service is single-threaded and does not support concurrent sessions.
- **SD card paths**: All filesystem commands require paths prefixed with `sd:/`. The internal flash filesystem is not accessible via the serial shell.
