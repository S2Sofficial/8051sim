# 8051.sim

Browser-based 8051 microcontroller simulator for learning and instruction.

<a href="https://8051sim.vercel.app/"><img width="1611" height="1011" alt="image" src="https://github.com/user-attachments/assets/0e973622-9172-4b6b-ba34-9d4944d91d4e" />
</a>

Live demo: https://8051sim.vercel.app/

## What It Does

- Simulates core 8051 execution flow in the browser
- Visualizes register state, internal RAM, GPIO, trace, and hex output
- Supports step/run workflows for classroom and self-learning use
- Accumulator and general-purpose registers (A, R0–R7)
- Program Counter (PC) and Stack Pointer (SP)
- Internal RAM read/write (direct and indirect addressing)
- GPIO simulation (Ports P0–P3)
- Bit-level port operations
- Step-friendly execution model
- Fully browser-based (no installation required)

## Quick Start

```bash
git clone https://github.com/S2Sofficial/8051sim.git
cd 8051sim
npm install
npm run dev
```

## Documentation

All maintained docs are listed below.

- [SETUP_QUICK.md](SETUP_QUICK.md): local setup and run commands
- [AUTHENTICATION.md](AUTHENTICATION.md): Clerk auth integration and troubleshooting
- [QUICK_REFERENCE.md](QUICK_REFERENCE.md): frequently used commands and file map
- [TEST_PROGRAMS.md](TEST_PROGRAMS.md): assembly test programs for simulator validation
- [CONTRIBUTING.md](CONTRIBUTING.md): contribution process and coding expectations

## Roadmap

- Expand instruction coverage and verification
- Improve PSW/flags visualization
- Continue timer/interrupt/peripheral behavior improvements
- Add more test suites and validation scenarios

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md).

## License

MIT
