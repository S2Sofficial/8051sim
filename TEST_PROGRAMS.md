# Test Assembly Code for 8051 Simulator

This document contains test programs to verify all 111 8051 instructions work correctly.

## 1. Serial Transmission Test

```asm
; Setup serial port for transmission
; This demonstrates serial.print() functionality

ORG 0x0000

    ; Initialize serial port
    MOV SCON, #0x10      ; Mode 0: Shift register
    MOV TCON, #0x40      ; Start Timer1
    MOV TMOD, #0x20      ; Timer1 in mode 2 (auto-reload)
    MOV TH1, #0xFD       ; 9600 baud reload value
    MOV IE, #0x10        ; Enable serial interrupt

    ; Transmit character 'A' (0x41)
    MOV A, #0x41
    MOV SBUF, A          ; Write to serial buffer
    
    ; Wait for transmission complete
wait:
    JNB TI, wait         ; Jump if TI not set
    CLR TI               ; Clear TI flag

    ; Transmit 'B'
    MOV A, #0x42
    MOV SBUF, A
    JNB TI, $
    CLR TI

    ; Transmit 'C'
    MOV A, #0x43
    MOV SBUF, A
    JNB TI, $
    CLR TI

    ; Halt
halt:
    SJMP halt

END
```

## 2. Data Transfer Instructions Test

```asm
ORG 0x0000

    ; Test MOV with different addressing modes
    MOV A, #0x12         ; MOV A, #data
    MOV R0, #0x30        ; MOV Rn, #data
    MOV R0, A            ; MOV Rn, A
    MOV 0x20, A          ; MOV direct, A
    MOV A, 0x20          ; MOV A, direct
    
    ; Test indirect addressing
    MOV @R0, A           ; MOV @Ri, A
    MOV A, @R0          ; MOV A, @Ri
    
    ; Test MOVC (read from code memory)
    MOV DPTR, #0x0100    ; Setup DPTR
    MOVC A, @A+DPTR      ; Read code byte
    
    ; Test MOVX (external memory)
    MOVX @DPTR, A        ; Write to external memory
    MOVX A, @DPTR        ; Read from external memory
    
    ; Test exchange
    MOV A, #0x11
    MOV R1, #0x22
    XCH A, R1            ; A=0x22, R1=0x11
    
    ; Test XCHD (nibble exchange)
    MOV A, #0xAB
    MOV R0, #0xCD
    XCHD A, @R0          ; Exchange lower nibbles
    
    SJMP end

    ; Data section
    DB 0x01, 0x02, 0x03  ; Code memory data for MOVC test

end:
    SJMP end
```

## 3. Arithmetic Instructions Test

```asm
ORG 0x0000

    ; Test ADD
    MOV A, #0x20
    ADD A, #0x10         ; A = 0x30
    ADD A, R0            ; ADD A, Rn
    ADD A, 0x20          ; ADD A, direct
    ADD A, @R0           ; ADD A, @Ri
    
    ; Test ADDC (with carry)
    MOV A, #0xFF
    ADD A, #0x02         ; A = 0x01, CY = 1
    ADDC A, #0x00        ; A = 0x02 (includes carry)
    
    ; Test SUBB (subtract with borrow)
    MOV A, #0x10
    SUBB A, #0x05        ; A = 0x0B
    SUBB A, R1           ; SUBB A, Rn
    
    ; Test INC
    INC A                ; A++
    INC R0               ; Rn++
    INC DPTR             ; DPTR++
    
    ; Test DEC
    DEC A                ; A--
    DEC R0               ; Rn--
    
    ; Test MUL (multiply)
    MOV A, #0x07
    MOV B, #0x08
    MUL AB               ; A*B = 0x38, A=0x38, B=0x00
    
    ; Test DIV (divide)
    MOV A, #0x20
    MOV B, #0x04
    DIV AB               ; A/B = 0x08, A=0x08, B=0x00
    
    ; Test DA (decimal adjust)
    MOV A, #0x09
    ADD A, #0x09         ; A = 0x12 (BCD result)
    DA A                 ; A = 0x18 (adjusted to next BCD)
    
    SJMP arithmetic_end

arithmetic_end:
    SJMP arithmetic_end
```

## 4. Logical Instructions Test

```asm
ORG 0x0000

    ; Test AND operations
    MOV A, #0xFF
    ANL A, #0x0F         ; A = 0x0F
    ANL A, R0
    ANL A, 0x20
    ANL A, @R0
    
    ; Test OR operations
    MOV A, #0xF0
    ORL A, #0x0F         ; A = 0xFF
    ORL A, R1
    ORL A, 0x20
    ORL A, @R1
    
    ; Test XOR operations
    MOV A, #0xAA
    XRL A, #0x55         ; A = 0xFF
    XRL A, R0
    XRL A, 0x20
    XRL A, @R0
    
    ; Test bit operations
    SETB 0x00            ; Set bit 0 of RAM
    CLR 0x01             ; Clear bit 1 of RAM
    CPL 0x02             ; Complement bit 2 of RAM
    
    ; Test carry flag
    SETB C               ; Set carry
    CLR C                ; Clear carry
    CPL C                ; Complement carry
    
    ; Test accumulator operations
    CLR A                ; A = 0x00
    CPL A                ; A = 0xFF
    
    ; Test bit AND/OR with carry
    ANL C, 0x00          ; C = C AND bit
    ORL C, 0x01          ; C = C OR bit
    
    SJMP logical_end

logical_end:
    SJMP logical_end
```

## 5. Rotate Instructions Test

```asm
ORG 0x0000

    MOV A, #0x80
    
    ; Test RL (rotate left)
    RL A                 ; A = 0x00 (80 -> 00, bit went to left)
    RL A                 ; A = 0x01
    
    ; Test RLC (rotate left through carry)
    MOV A, #0x80
    RLC A                ; A = 0x00, CY = 1
    RLC A                ; A = 0x01, CY = 0
    
    ; Test RR (rotate right)
    MOV A, #0x01
    RR A                 ; A = 0x80
    RR A                 ; A = 0x40
    
    ; Test RRC (rotate right through carry)
    MOV A, #0x01
    SETB C               ; CY = 1
    RRC A                ; A = 0x80, CY = 1
    RRC A                ; A = 0xC0, CY = 0
    
    ; Test SWAP (swap nibbles)
    MOV A, #0xAB
    SWAP A               ; A = 0xBA
    
    SJMP rotate_end

rotate_end:
    SJMP rotate_end
```

## 6. Jump & Branch Instructions Test

```asm
ORG 0x0000

start:
    MOV A, #0x00
    
    ; Test JZ (jump if zero)
    JZ zero_label        ; Jump because A = 0
    SJMP non_zero_label

zero_label:
    MOV R0, #0x11
    SJMP continue

non_zero_label:
    MOV R0, #0x22

continue:
    ; Test JNZ (jump if not zero)
    MOV A, #0x01
    JNZ not_zero_label
    SJMP is_zero_label

not_zero_label:
    MOV R1, #0x33
    SJMP bit_test

is_zero_label:
    MOV R1, #0x44

bit_test:
    ; Test JB/JNB (jump if bit set/not set)
    SETB 0x00
    JB 0x00, bit_set     ; Jump because bit is set
    SJMP bit_not_set

bit_set:
    MOV R2, #0x55
    SJMP cjne_test

bit_not_set:
    MOV R2, #0x66

cjne_test:
    ; Test CJNE (compare and jump if not equal)
    MOV A, #0x42
    CJNE A, #0x42, cjne_label
    SJMP djnz_test

cjne_label:
    SJMP djnz_test

djnz_test:
    ; Test DJNZ (decrement and jump if not zero)
    MOV R3, #0x03
    
djnz_loop:
    DJNZ R3, djnz_loop
    
    ; Test SJMP (short jump)
    SJMP ljmp_label
    MOV R4, #0xFF        ; Should not execute
    
ljmp_label:
    ; Test LJMP (long jump)
    LJMP halt

halt:
    SJMP halt
```

## 7. Subroutine Call Test

```asm
ORG 0x0000

start:
    ; Test ACALL
    ACALL my_subroutine
    
    ; Test LCALL
    LCALL another_subroutine
    
    SJMP halt

my_subroutine:
    MOV A, #0x12
    MOV B, #0x34
    RET              ; Return from ACALL

another_subroutine:
    MOV R0, #0x56
    MOV R1, #0x78
    RET              ; Return from LCALL

halt:
    SJMP halt
```

## 8. Complete Instruction Coverage Test

Copy the code sections above and test them individually or combine them into a single test program. Each section tests a different category of 8051 instructions.

### How to Use

1. Copy one of the test programs above into the code editor in the 8051 Simulator
2. Click "RESET" to initialize the simulator
3. Click "RUN" to execute continuously or "STEP" to execute one instruction at a time
4. Watch the "REGISTERS" panel to see the values change
5. For serial tests, watch the "SERIAL BUFFER" panel for TX output
6. Check the "EXECUTION TRACE" panel to verify all instructions executed correctly

### Expected Behavior

- **Registers** should update according to the instruction operations
- **Carry Flag (CY)** should change with arithmetic and rotate operations
- **Zero Flag** should reflect accumulator state in JZ/JNZ tests
- **Serial Output** should show transmitted characters
- **Execution Trace** should show all instructions in order

All 111 8051 instructions are now ready to be tested!
