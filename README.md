# 8051.sim

Browser-based 8051 microcontroller simulator for learning and instruction.

Live demo: https://8051sim.vercel.app/

## What It Does

- Simulates core 8051 execution flow in the browser
- Visualizes register state, internal RAM, GPIO, trace, and hex output
- Supports step/run workflows for classroom and self-learning use
- Includes Clerk-based authentication for user access flows

## Quick Start

```bash
git clone https://github.com/S2Sofficial/8051sim.git
cd 8051sim
npm install
npm run dev
```

Open the URL shown by Vite (usually http://localhost:5173 or http://localhost:5174).

## Environment

Copy and configure environment values:

```bash
cp .env.example .env.local
```

Required variable:

- `VITE_CLERK_PUBLISHABLE_KEY`

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
