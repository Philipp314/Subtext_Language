import sys

class SubtextLangVM:
    def __init__(self):
        self.instruction = []
        self.stack = []
        self.heap = {}
        self.labels = {}
        self.call_stack = []
        self.pc = 0
        self.InstDic = self.get_inst_dic()
        self.pause = False

        self.input_func = lambda: input()
        self.print_func = lambda content: print(content,end="")

    def get_inst_dic(self):
        return {
            "MemoryManipulation": {
                "push": lambda arg: self.stack.append(arg),
                "copy": lambda arg: self.stack.append(self.stack[-arg]),
                "swap": lambda _: [None for (self.stack[-2], self.stack[-1]) in [(self.stack[-1], self.stack[-2])]][0],
                "drop": lambda _: self.stack.pop(),
                "save": lambda _: self._save(),
                "get": lambda _: self.stack.append(self.heap[self.stack.pop()])
            },
            "IOoperation": {
                "printN": lambda _: self.print_func(self.stack.pop()),
                "printC": lambda _: self.print_func(chr(self.stack.pop())),
                "readN": lambda _: self.stack.append(int(self.input_func())),
                "readC": lambda _: self.stack.append(ord(self.input_func()[0]))
            },
            "Arithmetic": {
                "add": lambda _: self.stack.append(self.stack.pop() + self.stack.pop()),
                "sub": lambda _: self._sub(),
                "mul": lambda _: self.stack.append(self.stack.pop() * self.stack.pop()),
                "div": lambda _: self._div(),
                "root": lambda _: self._root(),
                "and": lambda _: self.stack.append(self.stack.pop() & self.stack.pop()),
                "or": lambda _: self.stack.append(self.stack.pop() | self.stack.pop()),
                "not": lambda _: self._bitwise_not()
            },
            "FlowControl": {
                "label": lambda label: None,
                "func": lambda label: self._call_func(label),
                "jump": lambda label: self._jump(label),
                "ifz": lambda label: self._ifz(label),
                "ifl": lambda label: self._ifl(label),
                "funcEnd": lambda _: self._func_end(),
                "end": lambda _: self._end()
            }
        }

    def _save(self):
        b = self.stack.pop()
        a = self.stack.pop()
        self.heap[a] = b

    def _sub(self):
        b = self.stack.pop()
        a = self.stack.pop()
        self.stack.append(a - b)

    def _div(self):
        b = self.stack.pop()
        a = self.stack.pop()
        self.stack.append(a // b)

    def _root(self):
        b = self.stack.pop()
        a = self.stack.pop()
        self.stack.append(int(a ** (1/b)))

    def _bitwise_not(self):
        a = self.stack.pop()
        l = len(bin(a)[2:])
        self.stack.append((1 << l) - 1 - a)

    def _call_func(self, label):
        self.call_stack.append(self.pc + 1)
        self.pc = self.labels[label] - 1

    def _jump(self, label):
        self.pc = self.labels[label] - 1

    def _ifz(self, label):
        if self.stack.pop() == 0:
            self.pc = self.labels[label] - 1

    def _ifl(self, label):
        if self.stack.pop() < 0:
            self.pc = self.labels[label] - 1

    def _func_end(self):
        self.pc = self.call_stack.pop() - 1

    def _end(self):
        self.pc = len(self.instruction) + 1

    def process_string(self, input_string):
        allowed_chars = {"一", "二", "三", "甲", "乙", "子", "丑"}
        filtered = ''.join([c for c in input_string if c in allowed_chars])
        filtered = filtered.replace("一", " 一").replace("二", " 二").replace("三", " 三")
        return filtered.strip().split()

    def number_analysis(self, number_code):
        number_str = number_code[:-1].replace("甲", "0").replace("乙", "1")
        number = -int(number_str, 2) if number_str.startswith("0") else int(number_str, 2)
        if number_code[-1] == "丑":
            number = self.heap.get(number, 0)
        return number

    def translate(self, code):
        unparam_ins = {
            "一子子": "swap", "一子丑": "drop", "一丑子": "save",
            "一丑丑": "get", "一甲子": "printN", "一甲丑": "printC",
            "一乙子": "readN", "一乙丑": "readC", "二甲子": "add",
            "二甲丑": "sub", "二乙子": "mul", "二乙丑": "div",
            "二子子": "root", "二子丑": "and", "二丑子": "or",
            "二丑丑": "not", "三子丑": "funcEnd", "三丑丑": "end"
        }
        param_ins = {
            "三甲子": "label", "三甲丑": "jump", "三乙子": "ifz",
            "三乙丑": "ifl", "三子子": "func", "一子": "push", "一丑": "copy"
        }

        if code[:3] in unparam_ins:
            return [unparam_ins[code[:3]], 0]
        elif code[:3] in param_ins:
            return [param_ins[code[:3]], self.number_analysis(code[3:])]
        elif code[:2] in param_ins:
            return [param_ins[code[:2]], self.number_analysis(code[2:])]
        else:
            raise ValueError(f"Unknown code: {code}")

    def load_code(self, inst_code):
        self.instruction = inst_code
        for i, inst in enumerate(inst_code):
            if inst[:3] == "三甲子":
                label_line = self.translate(inst)
                self.labels[label_line[1]] = i

    def run_one_step(self):
        if self.pc < len(self.instruction):
            inst = self.translate(self.instruction[self.pc])
            for category in self.InstDic.values():
                if inst[0] in category:
                    category[inst[0]](inst[1])
                    break
            self.pc += 1

    def run(self):
        while self.pc < len(self.instruction):
            self.run_one_step()
            if self.pause:
                break

    def run_code_auto(self, code):
        insts = self.process_string(code)
        self.load_code(insts)
        self.run()



if __name__ == "__main__":
  with open(sys.argv[1],"r",encoding="utf8") as f:
    code=f.read()
  vm=SubtextLangVM()
  vm.run_code_auto(code)
  input()
  '''
  vm=SubtextLangVM()
  vm.run_code_auto("一乙子一乙子一丑乙甲子一丑乙甲子二子子二乙子二甲丑一甲子")
  # << 5
  # << 3
  # >> 2
  '''