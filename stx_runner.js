class Seven_charVM {
  constructor() {
    this.instruction=[];
    this.stack = [];
    this.heap={};
    this.labels = {};
    this.call_stack = [];
    this.pc = 0;
    this.InstDic=getInstDic();
  }

  // 建立指令映射dic
  getInstDic() {
    let InstDic={
      //指令映射 Memory 操作
      MemoryManipulation:{
        push: (arg) => 
          {this.stack.push(arg);},
        copy: (arg) => 
          {this.stack.push(this.stack[this.stack.length - 1 - arg]);},
        swap: () => {
          [this.stack[this.stack.length - 1], this.stack[this.stack.length - 2]] =
          [this.stack[this.stack.length - 2], this.stack[this.stack.length - 1]];},
        drop: () => 
          {this.stack.pop();},
        save: () => {
          const b = this.stack.pop();
          const a = this.stack.pop();
          this.heap[a] = b;},
        get: () => 
          {this.stack.push(this.heap[this.stack.pop()]);}
      },
      //指令映射 I/O 操作
      IOoperation:{
        printN: () => {print(this.stack.pop());},
        printC: () => {print(String.fromCharCode(this.stack.pop()));},
         readN: () => {this.stack.push(readInput());},
         readC: () => {this.stack.push(readInput().charCodeAt(0));}
      },
      //指令映射 數學運算
      Arithmetic:{
        add: () => 
          {this.stack.push(this.stack.pop() + this.stack.pop());},
        sub: () => {
          const b = this.stack.pop();
          const a = this.stack.pop();
          this.stack.push(a - b);},
        mul: () => 
          {this.stack.push(this.stack.pop() * this.stack.pop());},
        div: () => {
          const b = this.stack.pop();
          const a = this.stack.pop();
          this.stack.push(a / b);},
        quot: () => {
          const b = this.stack.pop();
          const a = this.stack.pop();
          this.stack.push(Math.floor(a / b));},
        and: () => 
          {this.stack.push(this.stack.pop() & this.stack.pop());},
        or: () => 
          {this.stack.push(this.stack.pop() | this.stack.pop());},
        not: () => {
          const a = this.stack.pop();
          const l = a.toString(2).length;
          this.stack.push((1 << l) - 1 - a);}
      },
      //指令映射 流程控制
      FlowControl:{
        label: () => {},
        func: (label) => {
          this.callStack.push(this.pc + 1);
          this.pc = this.labels[label];},
        jump: (label) => 
          {this.pc = this.labels[label];},
        ifz: (label) => {
          if (this.stack.pop() === 0) 
          {this.pc = this.labels[label];} },
        ifl: (label) => {
          if (this.stack.pop() < 0) 
          {this.pc = this.labels[label];} },
        funcEnd: () => 
          {this.pc = this.callStack.pop();},
        end: () => 
          {this.halt = true;}  // 控制主迴圈中止
      }
    }
    return InstDic
  }

  // 處理輸入字串，過濾合法字符與斷詞
  processString(inputString) {
    const allowedChars = new Set("一二三甲乙子丑");
    let filtered = [...inputString].filter(c => allowedChars.has(c)).join("");
    filtered = filtered.replace(/一/g, " 一").replace(/二/g, " 二").replace(/三/g, " 三");
    return filtered.trim().split(/\s+/);
  }

  // 將漢字數字格式轉成實際數值
  numberAnalysis(code) {
    let [numStr, denomStr] = code.split("子");
    let binary = numStr.replace(/甲/g, "0").replace(/乙/g, "1");
    let number = binary[0] === "0" ? -parseInt(binary, 2) : parseInt(binary, 2);

    if (denomStr) {
      denomStr = denomStr.slice(0, -1);
      let denomBinary = denomStr.replace(/甲/g, "0").replace(/乙/g, "1");
      let denom = denomBinary[0] === "0" ? -parseInt(denomBinary, 2) : parseInt(denomBinary, 2);
      number = number / denom;
    }

    return number;
  }

  // 將漢字指令轉換為機器可執行的形式
  translate(code) {
    const UnparamIns = {
      "一子子": "swap", "一子丑": "drop", "一丑子": "save", "一丑丑": "get",
      "一甲子": "printN", "一甲丑": "printC", "一乙子": "readN", "一乙丑": "readC",
      "二甲子": "add", "二甲丑": "sub", "二乙子": "mul", "二乙丑": "div",
      "二子子": "quot", "二子丑": "and", "二丑子": "or", "二丑丑": "not",
      "三子丑": "funcEnd", "三丑丑": "end"
    };
    const ParamIns = {
      "三甲子": "label", "三甲丑": "jump", "三乙子": "ifz",
      "三乙丑": "ifl", "三子子": "func", "一子": "push", "一丑": "copy"
    };

    const raw = this.processString(code);
    const translated = [];

    for (let instr of raw) {
      if (UnparamIns[instr.slice(0, 3)]) {
        translated.push([UnparamIns[instr.slice(0, 3)]]);
      } else if (ParamIns[instr.slice(0, 3)]) {
        translated.push([ParamIns[instr.slice(0, 3)], this.numberAnalysis(instr.slice(3))]);
      } else if (ParamIns[instr.slice(0, 2)]) {
        translated.push([ParamIns[instr.slice(0, 2)], this.numberAnalysis(instr.slice(2))]);
      } else {
        throw new Error("Unknown code: " + instr);
      }
    }

    return translated;
  }

  showStack()// 輸出 stack
  {return this.stack;}
  showHeap()// 輸出 heap
  {return this.heap;}

  // 單步執行
  run_oneStap() {
    
    this..pc+=1;
  }

  // 執行指令集主體
  run(code) {
    
  }
}

// 使用範例
let SC = new Seven_charVM();
SC.input = "10\n3";
let result = SC.run("一乙子一乙子一丑乙甲子一丑乙甲子二子子二乙子二甲丑一甲子");
console.log(result); // 應輸出：1
