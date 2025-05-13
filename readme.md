# Project 《潛文 SubtextLang》 Specification

## Overview

**SubtextLang** is an esoteric programming language inspired by the minimalist philosophy of languages like *Whitespace*. It operates exclusively with a set of seven carefully selected characters, which are grouped into three semantic categories. Despite this extreme constraint, SubtextLang enables the creation of well-structured and expressive programs, showcasing the creative potential of minimal syntax design.

The language is available in two distinct versions:

1. **Invisible Subtext** — This variant uses zero-width and formatting control characters such as U+180B (Mongolian Free Variation Selector) and U+202D (Left-to-Right Override). Programs written in this version are effectively hidden within ordinary text, as the characters are generally not rendered by standard text viewers, making the code virtually invisible in most contexts.

2. **Semantic Camouflage** — This version employs common yet innocuous Chinese characters like “也” or “之”. These characters can be seamlessly substituted into existing text without altering its apparent meaning or tone. The result is a syntactically valid program that blends into natural language content, making it both functional and difficult to detect.

SubtextLang explores the boundary between language, code, and concealment—inviting programmers and language enthusiasts alike to experiment with how meaning can be encoded, obfuscated, or embedded within plain text.

### Character Substitution Notice

To improve the readability and formatting of this document, we use visible placeholder characters `一 (Yi), 二 (Er), 三 (San), 子 (Zi), 丑 (Chou), 甲 (Jia), 乙 (Yi)` to represent the actual characters used in SubtextLang source code. These substitutes are used solely for documentation purposes. When writing real programs, they should be replaced with their corresponding Unicode characters.

Below is the substitution table, along with suggested alternative Chinese characters that can be used for the visible version of the language:

| Placeholder | Unicode | Suggested Character | Substitutions Options |
| ----------- | ------- | ------------------- | --------------------- |
| 一          | U+180B  | 也                  | 亦, 仍, 還            |
| 二          | U+180C  | 如                  | 像, 似                |
| 三          | U+180D  | 是                  | 即, 乃, 為            |
| 子          | U+180E  | 之                  | 的, 所                |
| 丑          | U+202C  | 與                  | 和, 以及, 跟          |
| 甲          | U+202D  | 其                  | 那個, 該              |
| 乙          | U+202A  | 言                  | 說, 語, 講            |

These substitutions help maintain both the appearance and semantic neutrality of the surrounding text while embedding valid SubtextLang code.

### Characters Used

| Category | Characters     | Description                             |
|----------|----------------|-----------------------------------------|
| Type A   | `一` `二` `三` | Instruction type (stack, math, control) |
| Type B   | `子` `丑`      | Sub-instruction modifier                |
| Type C   | `甲` `乙`      | Data encoding                           |

### Instruction Format
```
<Type A> <Type B/Type C> [<Type B>] [Data/Label using 甲/乙 <子>]
```
Examples:
- `一 子 乙甲乙子` → Push the value 5 onto the stack
- `三 甲 子 乙乙甲乙子` → Define a label 13

---

## Data Encoding
- Uses only `甲` and `乙`
- `甲 = 0`, `乙 = 1`
- Binary values terminated by `子`
- Negative values start with `甲`
- Floating numbers are expressed as fractional `<Numerator>子<Denominator>丑`

### Examples
| Code                  | Meaning                |
|-----------------------|------------------------|
| `乙甲子`              | 2 (binary 10)          |
| `甲乙甲乙子`          | -5 (binary 101)        |
| `乙乙甲乙子乙甲乙丑`  | 2.6 (binary 1101/101)  |

---

## Instruction Set

### Memory Manipulation (`一 <Type B>`)
| Code        | Operation   | Description            |
|-------------|-------------|------------------------|
| `一 子[n]`  | push VALUE  | Push number to stack   |
| `一 丑[n]`  | copy N      | Copy Nst of stack      |
| `一 子 子`  | swap        | Swap top two items     |
| `一 子 丑`  | drop        | Remove top item        |
| `一 丑 子`  | save        | Store into heap        |
| `一 丑 丑`  | get         | Reading ​​from the heap  |

### I/O Operations (`一 <Type B>`)
| Code        | Operation | Description       |
|-------------|-----------|-------------------|
| `一 甲 子`  | printN    | Output number     |
| `一 甲 丑`  | printC    | Output character  |
| `一 乙 子`  | readN     | Read number       |
| `一 乙 丑`  | readC     | Read character    |

### Arithmetic (`二 <Type C>`)
| Code        | Operation | Description       |
|-------------|-----------|-------------------|
| `二 甲 子`  | add       | Addition          |
| `二 甲 丑`  | sub       | Subtraction       |
| `二 乙 子`  | mul       | Multiplication    |
| `二 乙 丑`  | div       | Integer Division  |
| `二 子 子`  | quot      | Floor Division    |
| `二 子 丑`  | and       | Bitwise AND       |
| `二 丑 子`  | or        | Bitwise OR        |
| `二 丑 丑`  | not       | Bitwise NOT       |

### Flow Control (`三`)
| Code               | Operation   | Description         |
|--------------------|-------------|---------------------|
| `三 甲 子[label]`  | label LABEL | Define a label      |
| `三 甲 丑[label]`  | jump LABEL  | Unconditional jump  |
| `三 乙 子[label]`  | ifz  LABEL  | Jump if top = 0     |
| `三 乙 丑[label]`  | ifl  LABEL  | Jump if top < 0     |
| `三 子 子[label]`  | func LABEL  | Call the function   |
| `三 子 丑`         | return      | End of function     |
| `三 丑 丑`         | end         | End program         |

---

## Comments and Ignored Characters
- Any characters outside the seven allowed (`一`, `二`, `三`, `子`, `丑`, `甲`, `乙`) are ignored.

---

## Execution Model
- Stack-based
- Optional labels for flow control
- Values are binary literals encoded with 甲/乙 and terminated with `三`

## Future Extensions
- Reserve `一 一`, `一 二`, `三 三`, ... for future use
- Support metadata or version headers (e.g. using leading comment)

---

## Sample Code
```
Take the remainder of the first two items in the stack
三 甲 子 乙子   # function star        >>[7,3]
  一 丑 乙甲子    # Duplicate 2nd itn  >>[7,3,7]
  一 丑 乙甲子    # Duplicate 2nd itn  >>[7,3,7,3]
  二 子 子        # Floor Division     >>[7,3,2]
  二 乙 子        # Multiplication     >>[7,6]
  二 甲 丑        # Subtraction        >>[1]
三 子 丑        # Function End         >>[1]
```

(Coming soon)


