// export const SNIPPET_CATEGORIES = [
//     // ... PASTE THE ENTIRE SNIPPET_CATEGORIES ARRAY FROM THE ORIGINAL FILE HERE ...
//     // It starts with { name: "I/O & LEDs", items: [...] }
//     // and ends with the closing ] bracket.
// ];

// // Helper to get default code
// export const DEFAULT_CODE = SNIPPET_CATEGORIES[0]?.items[0]?.code || "";
export const SNIPPET_CATEGORIES = [
    {
        name: "I/O & LEDs",
        items: [
            {
                id: 'blink',
                title: "Blink LED (P1.0)",
                desc: "Basic toggle of Port 1.0 with delay.",
                code: `ORG 0000H
    SJMP MAIN

MAIN:
    CPL P1.0        ; Toggle LED pin
    ACALL DELAY     ; Wait
    SJMP MAIN       ; Repeat forever

DELAY:
    MOV R0, #255    ; Outer loop
D1: MOV R1, #255    ; Inner loop
D2: DJNZ R1, D2     ; Dec inner
    DJNZ R0, D1     ; Dec outer
    RET
END`
            },
            {
                id: 'switch_read',
                title: "Read Switch",
                desc: "Copy status of Switch at P1.0 to LED at P2.0.",
                code: `ORG 0000H
LOOP:
    MOV C, P1.0     ; Read P1.0 into Carry
    MOV P2.0, C     ; Move Carry to P2.0
    SJMP LOOP       ; Continuous poll
END`
            },
            {
                id: 'walking_led',
                title: "Walking LEDs",
                desc: "Rotate a single ON bit across Port 1.",
                code: `ORG 0000H
    MOV A, #01H     ; Start with bit 0

LOOP:
    MOV P1, A       ; Output to Port 1
    RL A            ; Rotate Left
    ACALL DELAY
    SJMP LOOP

DELAY:
    MOV R0, #200
D1: MOV R1, #100
D2: DJNZ R1, D2
    DJNZ R0, D1
    RET
END`
            }
        ]
    },
    {
        name: "Math & Logic",
        items: [
            {
                id: 'add_16',
                title: "16-bit Addition",
                desc: "Adds R0:R1 and R2:R3, stores in R4:R5.",
                code: `ORG 0000H
    ; Load sample values 1234H + 00FFH
    MOV R0, #12H    ; High byte 1
    MOV R1, #34H    ; Low byte 1
    MOV R2, #00H    ; High byte 2
    MOV R3, #0FFH   ; Low byte 2

    ; Add Low Bytes
    MOV A, R1
    ADD A, R3
    MOV R5, A       ; Store Low Result

    ; Add High Bytes with Carry
    MOV A, R0
    ADDC A, R2
    MOV R4, A       ; Store High Result

    SJMP $          ; Stop
END`
            },
            {
                id: 'mul_div',
                title: "Multiplication / Division",
                desc: "Demonstrates MUL AB and DIV AB.",
                code: `ORG 0000H
    MOV A, #05H
    MOV B, #03H
    
    MUL AB          ; A = 15 (0FH), B = 0
    MOV R0, A       ; Save result
    
    MOV A, #25      ; 25 decimal
    MOV B, #05H
    
    DIV AB          ; A = 5, B = 0 (Remainder)
    MOV R1, A       ; Save quotient
    
    SJMP $
END`
            },
            {
                id: 'logic_ops',
                title: "Logic Gates",
                desc: "AND, OR, XOR operations on Port 1.",
                code: `ORG 0000H
    MOV A, #0F0H    ; Mask Upper Nibble
    
    ANL P1, A       ; Bitwise AND
    ACALL DELAY
    
    ORL P1, #0FH    ; Bitwise OR
    ACALL DELAY
    
    XRL P1, #0FFH   ; Toggle all (XOR 1)
    
    SJMP $
    
DELAY: MOV R7, #10 : DJNZ R7, $ : RET
END`
            }
        ]
    },
    {
        name: "Memory & Stack",
        items: [
            {
                id: 'memmove',
                title: "Block Transfer",
                desc: "Moves 5 bytes from RAM 30H to 40H.",
                code: `ORG 0000H
    ; Setup Source Data
    MOV 30H, #0AAH
    MOV 31H, #0BBH
    
    MOV R0, #30H    ; Source Ptr
    MOV R1, #40H    ; Dest Ptr
    MOV R7, #05H    ; Count

COPY:
    MOV A, @R0      ; Read indirect
    MOV @R1, A      ; Write indirect
    INC R0
    INC R1
    DJNZ R7, COPY
    
    SJMP $
END`
            },
            {
                id: 'clear_ram',
                title: "Clear Memory",
                desc: "Zero out 10 bytes starting at 50H.",
                code: `ORG 0000H
    MOV R0, #50H    ; Start Address
    MOV R7, #10     ; Byte count

CLR_LOOP:
    MOV @R0, #00H   ; Clear
    INC R0
    DJNZ R7, CLR_LOOP
    
    SJMP $
END`
            },
            {
                id: 'stack_demo',
                title: "Stack Operations",
                desc: "Using PUSH and POP with Stack Pointer.",
                code: `ORG 0000H
    MOV SP, #60H    ; Move Stack to 60H
    
    MOV R0, #0AAH
    MOV R1, #0FFH
    
    PUSH 00H        ; Push R0 (Addr 00H)
    PUSH 01H        ; Push R1 (Addr 01H)
    
    CLR A
    MOV R0, A       ; Clear regs
    MOV R1, A
    
    POP 01H         ; Restore R1
    POP 00H         ; Restore R0
    
    SJMP $
END`
            }
        ]
    },
    {
        name: "Timing & Loops",
        items: [
            {
                id: 'square',
                title: "Square Wave (50%)",
                desc: "Generates square wave on P1.5.",
                code: `ORG 0000H
    CLR P1.5

LOOP:
    CPL P1.5        ; Toggle
    ACALL DELAY
    SJMP LOOP

DELAY:
    MOV R7, #50     ; Tune frequency
    DJNZ R7, $      ; Short wait
    RET
END`
            },
            {
                id: 'counter_bin',
                title: "8-bit Binary Counter",
                desc: "Count 00-FF on Port 2 LEDs.",
                code: `ORG 0000H
    MOV A, #00H

LOOP:
    MOV P2, A       ; Display
    ACALL DELAY
    INC A
    SJMP LOOP

DELAY:
    MOV R2, #50     ; Fast delay
    DJNZ R2, $
    RET
END`
            },
            {
                id: 'counter_bcd',
                title: "BCD Counter (0-9)",
                desc: "Counts 0-9 repeatedly on P1.",
                code: `ORG 0000H
    MOV R0, #00H

LOOP:
    MOV A, R0
    MOV P1, A
    ACALL DELAY
    
    INC R0
    CJNE R0, #10, LOOP ; Check if 10
    MOV R0, #00H       ; Reset
    SJMP LOOP

DELAY: MOV R7, #100 : DJNZ R7, $ : RET
END`
            }
        ]
    },
    {
        name: "Advanced",
        items: [
            {
                id: 'find_max',
                title: "Find Max Value",
                desc: "Find larger of R0 and R1.",
                code: `ORG 0000H
    MOV R0, #50H
    MOV R1, #30H
    
    MOV A, R0
    CLR C
    SUBB A, R1      ; A = R0 - R1
    JNC R0_BIGGER   ; No Borrow = R0 >= R1
    
    MOV A, R1       ; R1 is Max
    SJMP DONE

R0_BIGGER:
    MOV A, R0       ; R0 is Max

DONE:
    MOV P1, A       ; Show Max
    SJMP $
END`
            },
            {
                id: 'hex_asc',
                title: "Hex to ASCII",
                desc: "Convert hex nibble in A to ASCII char.",
                code: `ORG 0000H
    MOV A, #0BH     ; Value 'B' (11)
    
    ANL A, #0FH     ; Mask nibble
    CJNE A, #10, CHECK_NUM 

CHECK_NUM:
    JC IS_NUM       ; If < 10
    
    ADD A, #07H     ; Letter Offset
IS_NUM:
    ADD A, #30H     ; ASCII '0' base
    
    MOV P1, A       ; 'B' -> 42H ('B')
    SJMP $
END`
            },
            {
                id: 'factorial',
                title: "Factorial (N!)",
                desc: "Calculate 5! (120). Result in A.",
                code: `ORG 0000H
    MOV R0, #5      ; N = 5
    MOV A, #01H     ; Result = 1

FACT_LOOP:
    MOV B, R0       ; Load N
    MUL AB          ; A = A * N
    
    DJNZ R0, FACT_LOOP ; Dec N, Repeat
    
    MOV P1, A       ; Output 120 (78H)
    SJMP $
END`
            }
        ]
    }
];

export const DEFAULT_CODE = SNIPPET_CATEGORIES[0]?.items[0]?.code || "";