class SubtextLangVM {
  constructor() {
    this.instruction=[];
    this.stack = [];
    this.heap={};
    this.labels = {};
    this.call_stack = [];
    this.pc = 0;
    this.InstDic=this.getInstDic();
    this.pause=false;
    
    this.inputFunc = () => {return prompt();};
    this.printFunc = (content) => {alert(content);};
  }

  // 建立指令映射字典
  getInstDic() {
    let InstDic={
      // Memory 操作
      MemoryManipulation:{
        push: (arg) => 
          {this.stack.push(arg);},
        copy: (arg) => 
          {this.stack.push(this.stack[this.stack.length - arg]);},
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
      // I/O 操作
      IOoperation:{
        printN: () => {this.printFunc(this.stack.pop());},
        printC: () => {this.printFunc(String.fromCharCode(this.stack.pop()));},
         readN: () => {this.stack.push(this.inputFunc()*1);},
         readC: () => {this.stack.push(this.inputFunc().charCodeAt(0));}
      },
      // 數學運算
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
      // 流程控制
      FlowControl:{
        label: () => {},
        func: (label) => {
          this.call_stack.push(this.pc + 1);
          this.pc = this.labels[label]-1;},
        jump: (label) => 
          {this.pc = this.labels[label]-1;},
        ifz: (label) => {
          if (this.stack.pop() === 0) 
          {this.pc = this.labels[label]-1;} },
        ifl: (label) => {
          if (this.stack.pop() < 0) 
          {this.pc = this.labels[label]-1;} },
        funcEnd: () => 
          {this.pc = this.call_stack.pop()-1;},
        end: () => 
          {this.pc = this.instruction.length+1;}  // 控制主迴圈中止
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
  numberAnalysis(numberCode) {
    let numberStr = numberCode.slice(0, -1);
    numberStr = numberStr.replace(/甲/g, "0").replace(/乙/g, "1");
    let number;
    if (numberStr[0] === "0")
    {number = -parseInt(numberStr, 2);}
    else
    {number = parseInt(numberStr, 2);}
    if (numberCode[numberCode.length - 1] === "丑")
    {number = this.heap[number];}

    return number;
  }

  // 將漢字指令轉換為機器可執行的形式
  translate(code) {
    const UnparamIns = {
      "一子子": "swap", "一子丑": "drop", "一丑子": "save",
      "一丑丑": "get", "一甲子": "printN", "一甲丑": "printC",
      "一乙子": "readN", "一乙丑": "readC", "二甲子": "add",
      "二甲丑": "sub", "二乙子": "mul", "二乙丑": "div", "二子子":
      "quot", "二子丑": "and", "二丑子": "or", "二丑丑": "not",
      "三子丑": "funcEnd", "三丑丑": "end"
    };
    const ParamIns = {
      "三甲子": "label", "三甲丑": "jump",
      "三乙子": "ifz", "三乙丑": "ifl",
      "三子子": "func", "一子": "push",
      "一丑": "copy"
    };
    let translated = [];
    if (UnparamIns[code.slice(0, 3)])
    {translated=[UnparamIns[code.slice(0, 3)], 0];}
    else if (ParamIns[code.slice(0, 3)])
    {translated=[ParamIns[code.slice(0, 3)], this.numberAnalysis(code.slice(3))];}
    else if (ParamIns[code.slice(0, 2)])
    {translated=[ParamIns[code.slice(0, 2)], this.numberAnalysis(code.slice(2))];}
    else
    {throw new Error("Unknown code: " + code);}
    return translated;
  }

  // 載入程式碼(指令表、標籤表)
  loadCode(instCode) {
    // 讀入指令
    this.instruction = instCode;
    // 建立標籤表
    for(let i=0;i<instCode.length;i++){
      if(instCode[i].slice(0, 3)=="三甲子"){
        let labelLine = this.translate(instCode[i]);
        this.labels[labelLine[1]] = i;
      }
    }
  }

  // 單步執行
  run_oneStep() {
    if(this.pc < this.instruction.length){
      let inst = this.translate(this.instruction[this.pc]);
      if(inst[0] in this.InstDic.MemoryManipulation)
        {this.InstDic.MemoryManipulation[inst[0]](inst[1]);}
      if(inst[0] in this.InstDic.IOoperation)
        {this.InstDic.IOoperation[inst[0]](inst[1]);}
      if(inst[0] in this.InstDic.Arithmetic)
        {this.InstDic.Arithmetic[inst[0]](inst[1]);}
      if(inst[0] in this.InstDic.FlowControl)
        {this.InstDic.FlowControl[inst[0]](inst[1]);}
      this.pc+=1;
    }
  }

  // 執行指令集主體
  async run() {
    while (this.pc < this.instruction.length) {
      this.run_oneStep();
      await Promise.resolve()
      if (this.pause) {
        break;
      }
    }
  }

  runCodeAuto(code) {
    let insts = this.processString(code);
    this.loadCode(insts);
    this.run();
  }
}

// 環境偵測並導出
if (typeof module !== 'undefined' && typeof module.exports !== 'undefined')
  {module.exports = SubtextLangVM;}// 如果在 Node.js 環境下，導出物件成 module
else 
  {window.SubtextLangVM = SubtextLangVM;}// 如果在瀏覽器中，掛載到全域 window 物件上

/*
let vm = new SubtextLangVM();

vm.printFunc = (content) => {console.log(content);};

vm.runCodeAuto("一乙子一乙子一丑乙甲子一丑乙甲子二子子二乙子二甲丑一甲子");
*/