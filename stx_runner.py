import sys

class Seven_charVM:
  def __init__(self, instructions):
    self.instructions = instructions
    self.labels = self._find_labels()
    self.stack = []
    self.heap = {}
    self.call_stack = []
    self.pc = 0

  def _find_labels(self):
    labels = {}
    for idx, instr in enumerate(self.instructions):
      if instr[0] == "label":
        labels[instr[1]] = idx
    return labels

  def run(self):
    while self.pc < len(self.instructions):
      instr = self.instructions[self.pc]
      op = instr[0]
      args = instr[1:]
      
      # Memory Manipulation
      if op == "push":
        self.stack.append(args[0])
      elif op == "copy":
        self.stack.append(self.stack[0-args[0]])
      elif op == "swap":
        self.stack[-1], self.stack[-2] = self.stack[-2], self.stack[-1]
      elif op == "drop":
        self.stack.pop()
      elif op == "save":
        b, a = self.stack.pop(), self.stack.pop()
        self.heap[a] = b
      elif op == "get":
        self.stack.append(self.heap[self.stack.pop()])
      
      # I/O (basic)
      elif op == "printN":
        print(self.stack.pop(),end="")
      elif op == "printC":
        print(chr(self.stack.pop()),end="")
      elif op == "readN":
        self.stack.append(int(input()))
      elif op == "readC":
        self.stack.append(chr(int(input())))
      
      ### Arithmetic
      elif op == "add":
        b, a = self.stack.pop(), self.stack.pop()
        self.stack.append(a + b)
      elif op == "sub":
        b, a = self.stack.pop(), self.stack.pop()
        self.stack.append(a - b)
      elif op == "mul":
        b, a = self.stack.pop(), self.stack.pop()
        self.stack.append(a * b)
      elif op == "div":
        b, a = self.stack.pop(), self.stack.pop()
        self.stack.append(a / b)
      elif op == "quot":
        b, a = self.stack.pop(), self.stack.pop()
        self.stack.append(a // b)
      elif op == "and":
        b, a = self.stack.pop(), self.stack.pop()
        self.stack.append(a & b)
      elif op == "or":
        b, a = self.stack.pop(), self.stack.pop()
        self.stack.append(a | b)
      elif op == "not":
        a = self.stack.pop()
        l = len(bin(a)) - 2 #(1 << numbits) - 1 - n
        self.stack.append(2 ** l - a - 1)

      # Flow control
      elif op == "label":
        pass
      elif op == "func":
        self.call_stack.append(self.pc + 1)
        self.pc = self.labels[args[0]]
        continue
      elif op == "jump":
        self.pc = self.labels[args[0]]
        continue
      elif op == "ifz":
        if self.stack.pop() == 0:
          self.pc = self.labels[args[0]]
          continue
      elif op == "ifl":
        if self.stack.pop() < 0:
          self.pc = self.labels[args[0]]
          continue
      elif op == "return":
        self.pc = self.call_stack.pop()
        continue
      elif op == "end":
        break
      
      #Undefined instruction
      else:
        raise ValueError(f"Unknown instruction: {op}")
      
      self.pc += 1


def process_string(input_string):
    allowed_chars = set("一二三甲乙子丑")
    # 只保留指定字元
    filtered = ''.join(char for char in input_string if char in allowed_chars)
    # 在[一,二,三]前插入空格
    filtered=filtered.replace("一"," 一")
    filtered=filtered.replace("二"," 二")
    filtered=filtered.replace("三"," 三")
    # 分割為串列
    result_list = filtered.strip().split()
    return result_list

def numberAnalysis(numberCode):
  numberCode = numberCode.split("子")
  number = numberCode[0]
  number = number.replace("甲","0").replace("乙","1")
  if(number[0]=="0"):
    number = eval("0b"+number) * -1
  else:
    number = eval("0b"+number)
  try:
    Denominator = numberCode[1][:-1]
    Denominator = Denominator.replace("甲","0").replace("乙","1")
    if(Denominator[0]=="0"):
      Denominator = eval("0b"+Denominator) * -1
    else:
      Denominator = eval("0b"+Denominator)
    number/=Denominator
  except:
    pass
  return number

with open(sys.argv[1],"r",encoding="utf8") as f:
  code=f.read()
codeBeforPurification = process_string(code)

UnparamIns = {"一子子":"swap","一子丑":"drop","一丑子":"save","一丑丑":"get",
              "一甲子":"printN","一甲丑":"printC","一乙子":"readN",
              "一乙丑":"readC","二甲子":"add","二甲丑":"sub","二乙子":"mul",
              "二乙丑":"div","二子子":"quot","二子丑":"and","二丑子":"or",
              "二丑丑":"not","三子丑":"return","三丑丑":"end"}
ParamIns = {"三甲子":"label","三甲丑":"jump","三乙子":"ifz",
            "三乙丑":"ifl","三子子":"func","一子":"push","一丑":"copy"}
codeTranslate=[]

for i in codeBeforPurification:
  if(i[0:3] in UnparamIns):
    codeTranslate.append((UnparamIns[i[0:3]],))
  elif(i[0:3] in ParamIns):
    codeTranslate.append((ParamIns[i[0:3]],numberAnalysis(i[3:])))
  elif(i[0:2] in ParamIns):
    codeTranslate.append((ParamIns[i[0:2]],numberAnalysis(i[2:])))
  else:
    raise ValueError(f"Unknown code: {i}")

vm = Seven_charVM(codeTranslate)
vm.run()
input()