# 8051.sim — Online 8051 Microcontroller Simulator

![Vercel](https://img.shields.io/badge/deployed%20on-Vercel-black?logo=vercel)
![License](https://img.shields.io/github/license/S2Sofficial/8051sim)
![Issues](https://img.shields.io/github/issues/s2sofficial/8051sim)
![Stars](https://img.shields.io/github/stars/s2sofficial/8051sim?style=social)
![Contributors](https://img.shields.io/github/contributors/s2sofficial/8051sim)
![Visitors](https://visitor-badge.laobi.icu/badge?page_id=s2sofficial.8051sim)

Live demo: https://8051sim.vercel.app/

<img width="1919" height="998" alt="image" src="https://github.com/user-attachments/assets/f90f5a27-ae00-475f-8fa8-4b58836a7d53" />


8051.sim is a browser-based 8051 microcontroller simulator intended for Electronics and Communication Engineering students, educators, and embedded systems learners.  
It allows users to write, execute, and observe 8051 assembly programs directly in the browser, with visibility into registers, internal RAM, and GPIO behavior.

The project prioritizes educational clarity, technical correctness, and accessibility.

---

## Features

- 8051 assembly program execution
- Accumulator and general-purpose registers (A, R0–R7)
- Program Counter (PC) and Stack Pointer (SP)
- Internal RAM read/write (direct and indirect addressing)
- GPIO simulation (Ports P0–P3)
- Bit-level port operations
- Step-friendly execution model
- Fully browser-based (no installation required)

---

## Current Limitations

The simulator is under active development. The following features are not yet implemented:

- Flag Register (PSW) visualization  
  Individual flags such as Carry, Auxiliary Carry, Overflow, and Parity are not currently displayed as a dedicated flag register in the user interface.

- External component and peripheral support  
  There is no support yet for simulating or connecting external hardware components, including but not limited to:
  - 7-segment displays
  - ADC and DAC modules
  - Sensors or actuators
  - Real-time peripheral interaction

At this stage, the simulator focuses on core CPU behavior and GPIO operations.

---

## Validation Status

The simulator has been manually tested using custom 8051 assembly programs covering:

- Arithmetic and logic instructions
- Register manipulation
- Internal RAM read/write
- GPIO toggling and bit addressing
- Control flow (loops and jumps)

Timers, interrupts, serial communication, and advanced peripherals are planned for future releases.

---

## Getting Started (Local Development)

```bash
https://github.com/S2Sofficial/8051sim.git
cd 8051sim
npm install
npm run dev
````

Open `http://localhost:5173` in a browser.

---

## Roadmap

Planned future work includes:

* Full PSW / flag register implementation and visualization
* Improved instruction-set coverage
* Timer (Timer 0 / Timer 1) support
* Interrupt handling
* External component simulation (7-segment display, ADC, DAC)
* Pluggable peripheral architecture
* Built-in example and test programs

---

## Contributing

Contributions, feedback, and suggestions are welcome.

Please refer to the contribution guidelines before submitting issues or pull requests:

[`CONTRIBUTING.md`](/CONTRIBUTING.md) (located in the project root)

This document describes:

* How to report bugs
* How to propose features
* Coding and commit guidelines
* Suggested areas for contribution

---

## Feedback and Discussion

Feedback directly influences the direction of the project.

* Use GitHub Issues for bug reports and feature requests
* Use Discussions (if enabled) for design or architectural ideas
* Academic and lab-oriented use-case suggestions are especially welcome

---

## Motivation

Many existing 8051 simulators are desktop-only, outdated, or difficult for beginners to understand.
8051.sim was built to provide a modern, visual, and accessible way to understand 8051 microcontroller behavior at a fundamental level.

---

## License

This project is released under the MIT License.
