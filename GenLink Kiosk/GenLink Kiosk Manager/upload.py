#!/usr/bin/env python3
"""
REMOVED: This helper is deprecated and intentionally left empty. Delete the file if not needed.
"""

import sys
import time

try:
    import serial
except Exception:
    print("Missing dependency 'pyserial'. Install with: pip install pyserial")
    sys.exit(0)
    sys.exit(1)


def main():
    if len(sys.argv) > 1:
        port = sys.argv[1]
    else:
        port = input("Enter COM port (eg: COM3): ").strip()

    if not port:
        print("Nie podano portu. Kończę.")
        return

    try:
        # timeout=1 ensures reads block up to 1 second
        with serial.Serial(port, 115200, timeout=1) as ser:
            # small delay to allow device to be ready (USB-serial)
            time.sleep(0.1)
            ser.reset_input_buffer()
            ser.reset_output_buffer()

            print("This helper is deprecated; please use other tools.")

    except serial.SerialException as e:
        print(f"Failed to open serial port: {e}")
    except Exception as e:
        print(f"Unexpected error: {e}")


if __name__ == '__main__':
    main()
