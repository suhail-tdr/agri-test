"""
=============================================================
  HONEYPOT TEST SCRIPT — Simulate an Attacker Connection
=============================================================
  Run this in a SECOND terminal WHILE honeypot.py is running
  to simulate what an attacker would see and trigger logging.

  Usage:
    1. Open Terminal 1: python honeypot.py
    2. Open Terminal 2: python test_connection.py
=============================================================
"""

import socket

def simulate_attacker():
    TARGET_HOST = "127.0.0.1"  # Connect to our own machine
    TARGET_PORT = 8888

    print(f"[*] Simulating attacker connecting to {TARGET_HOST}:{TARGET_PORT}")

    try:
        # Create a client socket
        sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        sock.settimeout(5)

        # Connect to honeypot
        sock.connect((TARGET_HOST, TARGET_PORT))
        print("[+] Connected! Receiving response from honeypot...")

        # Receive the fake banner
        response = sock.recv(1024).decode("utf-8")
        print("\n--- ATTACKER SEES THIS ---")
        print(response)
        print("--- END OF RESPONSE ---\n")

    except ConnectionRefusedError:
        print("[!] Connection refused — is honeypot.py running?")
    except Exception as e:
        print(f"[!] Error: {e}")
    finally:
        sock.close()


if __name__ == "__main__":
    simulate_attacker()
