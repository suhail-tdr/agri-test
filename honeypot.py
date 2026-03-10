"""
=============================================================
  HONEYPOT NETWORK FOR AGRICULTURE THREAT INTELLIGENCE
=============================================================
  Project   : Agriculture Honeypot Port Listener
  Programme : Cloud Computing, Cyber Security & Ethical Hacking
  Technology: Python, Socket Library
  Author    : [Your Name]
  Date      : 2024
=============================================================

WHAT IS A HONEYPOT?
  A honeypot is a deliberately exposed system/service that
  acts as a TRAP for attackers. It logs all connection
  attempts so security teams can analyse threat patterns.

IN AGRICULTURE CONTEXT:
  Modern farms use IoT sensors, SCADA systems, and remote
  monitoring tools. Attackers target these systems to:
  - Steal crop/yield data
  - Disrupt irrigation systems
  - Manipulate environmental controls
  This honeypot simulates an Agriculture IoT management
  portal on port 8888 to detect and log such attackers.
"""

import socket       # Core library for network connections
import datetime     # For timestamping log entries
import threading    # For handling multiple connections at once
import os           # For file path operations


# ─────────────────────────────────────────────
#  CONFIGURATION  (change these as needed)
# ─────────────────────────────────────────────
HOST = "0.0.0.0"      # Listen on ALL network interfaces
PORT = 8888           # Honeypot port (simulating Agri-IoT portal)
LOG_FILE = "honeypot_log.txt"  # Where logs are saved


# ─────────────────────────────────────────────
#  FAKE BANNER (what attackers see when they connect)
# ─────────────────────────────────────────────
FAKE_BANNER = """
╔══════════════════════════════════════════════════╗
║   AGRITECH SMART FARM MANAGEMENT SYSTEM v2.1     ║
║   IoT Sensor Dashboard | Crop Monitoring Portal  ║
║   Powered by AgriCloud™ Infrastructure           ║
╚══════════════════════════════════════════════════╝

[!] ALERT: Unauthorized access attempt detected.
[!] ACCESS DENIED — This incident has been logged.
[!] Your IP address and timestamp have been recorded.
[!] Authorities have been notified.

"""


def log_connection(ip_address, port, timestamp):
    """
    LOG CONNECTION ATTEMPT
    ─────────────────────
    This function saves connection details to a log file.
    
    Parameters:
      ip_address : The attacker's IP address (string)
      port       : The port they connected to (int)
      timestamp  : When the connection occurred (datetime)
    
    LEARNING NOTE:
      In real honeypots, logs are sent to SIEM tools like
      Splunk or ELK Stack for threat analysis dashboards.
    """
    log_entry = (
        f"[{timestamp}] "
        f"CONNECTION ATTEMPT | "
        f"IP: {ip_address:20s} | "
        f"Port: {port} | "
        f"Status: LOGGED & DENIED\n"
    )

    # Print to terminal (so you can watch live)
    print(log_entry.strip())

    # Save to log file
    with open(LOG_FILE, "a") as f:
        f.write(log_entry)


def handle_connection(client_socket, client_address):
    """
    HANDLE ONE CONNECTION
    ─────────────────────
    Called for EACH incoming connection in its own thread.
    Sends the fake banner, logs the attempt, then closes.
    
    Parameters:
      client_socket  : The socket object for this connection
      client_address : Tuple of (ip_address, port_number)
    
    LEARNING NOTE:
      Using threads means the honeypot handles many attackers
      simultaneously — just like a real production server.
    """
    ip_address = client_address[0]
    timestamp = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")

    try:
        # Step 1: Send fake "Agriculture System" banner
        client_socket.send(FAKE_BANNER.encode("utf-8"))

        # Step 2: Log the connection attempt
        log_connection(ip_address, PORT, timestamp)

    except Exception as e:
        print(f"[ERROR] Problem handling connection from {ip_address}: {e}")

    finally:
        # Step 3: Always close the connection cleanly
        client_socket.close()


def start_honeypot():
    """
    START THE HONEYPOT SERVER
    ─────────────────────────
    Creates a TCP socket, binds it to HOST:PORT,
    and waits forever for incoming connections.
    
    SOCKET CONCEPTS EXPLAINED:
      socket.AF_INET    → Use IPv4 addressing
      socket.SOCK_STREAM → Use TCP (reliable, connection-based)
      SO_REUSEADDR      → Allow port reuse after restart
      bind()            → Attach socket to our IP + port
      listen(5)         → Queue up to 5 pending connections
      accept()          → Block and wait for a new connection
    """
    print("=" * 60)
    print("  AGRICULTURE HONEYPOT — THREAT INTELLIGENCE SYSTEM")
    print("=" * 60)
    print(f"  [*] Listening on  : {HOST}:{PORT}")
    print(f"  [*] Logging to    : {os.path.abspath(LOG_FILE)}")
    print(f"  [*] Started at    : {datetime.datetime.now()}")
    print("=" * 60)
    print("  [*] Waiting for connections... (Press Ctrl+C to stop)\n")

    # Write log file header
    with open(LOG_FILE, "a") as f:
        f.write(f"\n{'='*60}\n")
        f.write(f"  HONEYPOT SESSION STARTED: {datetime.datetime.now()}\n")
        f.write(f"  Listening on {HOST}:{PORT}\n")
        f.write(f"{'='*60}\n")

    # Create the TCP socket
    server_socket = socket.socket(socket.AF_INET, socket.SOCK_STREAM)

    # Allow port reuse immediately after script restart
    server_socket.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)

    # Bind to our chosen address and port
    server_socket.bind((HOST, PORT))

    # Start listening for connections (queue up to 5)
    server_socket.listen(5)

    try:
        while True:
            # Wait for a connection — this BLOCKS until someone connects
            client_socket, client_address = server_socket.accept()

            # Handle each connection in a separate thread
            # This way, many attackers can connect at the same time
            thread = threading.Thread(
                target=handle_connection,
                args=(client_socket, client_address),
                daemon=True
            )
            thread.start()

    except KeyboardInterrupt:
        print("\n\n[!] Honeypot stopped by user.")
        print(f"[*] All logs saved to: {os.path.abspath(LOG_FILE)}")

    finally:
        server_socket.close()


# ─────────────────────────────────────────────
#  ENTRY POINT
# ─────────────────────────────────────────────
if __name__ == "__main__":
    start_honeypot()
