# Contributing to 8051.sim

This project is an educational, accuracy-first 8051 microcontroller simulator.  
Contributions must preserve technical correctness, clarity, and maintainability.

---

## Scope of Contributions

Valid contribution areas:

- 8051 instruction implementation or correction  
- CPU state modeling (registers, RAM, stack, PC, SP)  
- PSW / flag logic and visualization  
- GPIO and bit-addressable behavior  
- Timers, interrupts, serial, peripherals (planned roadmap items)  
- UI improvements **only if** they improve learning clarity  
- Bug fixes, refactoring, performance improvements  
- Documentation, examples, and test programs

Out-of-scope without prior discussion:

- Non-8051 microcontrollers  
- Game-like abstractions  
- Visual effects not tied to learning value  
- Hardware-agnostic simplifications that break 8051 behavior

---

## Technical Expectations

- Follow **Intel 8051 architecture specifications**  
- Do not approximate instruction behavior  
- One instruction = one deterministic state transition  
- No silent side effects  
- No UI-driven logic inside the CPU core  
- Clear separation between:
  - CPU core logic
  - Execution engine
  - UI/state visualization

If correctness and convenience conflict, correctness wins.

---

## Coding Guidelines

- Use clear, explicit variable and function names  
- Prefer readability over cleverness  
- Avoid premature optimization  
- Keep functions small and single-purpose  
- Comment **why**, not **what**, when logic is non-obvious  
- No dead code or commented-out blocks in PRs

---

## Commit Guidelines

- Atomic commits only  
- One logical change per commit  
- Meaningful commit messages

Examples:
- `Implement ADD instruction with flag handling`
- `Fix indirect RAM addressing bug`
- `Refactor execution step logic`

Avoid:
- `update`
- `fix bug`
- `changes`

---

## Pull Request Process

1. Fork the repository  
2. Create a feature or fix branch  
3. Ensure the simulator runs locally  
4. Add or update documentation if behavior changes  
5. Submit a pull request with:
   - Clear description of the problem
   - Explanation of the solution
   - Reference to 8051 behavior if applicable

Incomplete or speculative PRs may be closed.

---

## Bug Reports

When reporting a bug, include:

- Assembly code that reproduces the issue  
- Expected 8051 behavior  
- Actual simulator behavior  
- Screenshots or logs if relevant

Vague reports without reproducible steps will not be prioritized.

---

## Feature Requests

Feature requests must include:

- Clear educational value  
- Relevance to 8051 learning  
- Reference to architecture or syllabus use-case

Requests like “add more visuals” or “make it cooler” without justification will be ignored.

---

## Discussion and Design

- Use GitHub Issues for bugs and features  
- Use Discussions (if enabled) for architectural or long-term ideas  
- Major changes should be discussed **before** implementation

---

## License

By contributing, you agree that your code will be released under the MIT License.

---

## Philosophy

This is not a toy simulator.

The goal is to help students **think like the CPU**, step by step, bit by bit.  
Every contribution should move the project closer to that goal.
