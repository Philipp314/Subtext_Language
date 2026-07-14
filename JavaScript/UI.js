// ==================== IDE UI Manipulation & Tab Logic ====================
// Initialize and verify if SubtextLangVM has been successfully loaded
if (typeof SubtextLangVM === 'undefined') {
  alert("SubtextLangVM class not detected. Please make sure stx_runner.js exists in the same directory.");
}

const vm = new SubtextLangVM();
let parsedInstructions = [];

// Re-wrap I/O functions
vm.printFunc = (content) => {
  // 1. Restore version 1: Output will be sent to the system log (with newline)
  appendLog("system-log", `[Output]: ${content}`, "output");
  
  // 2. Output to the I/O plain text terminal directly (no wrap, append as raw string)
  const ioTerminal = document.getElementById("io-log");
  ioTerminal.innerHTML += content;
  ioTerminal.scrollTop = ioTerminal.scrollHeight;
};

vm.inputFunc = () => {
  let val = prompt("[VM Input Request] Please enter a value:");
  appendLog("system-log", `[System Input]: ${val}`, "system");
  
  // Synchronously output to the I/O plain text terminal
  const ioTerminal = document.getElementById("io-log");
  ioTerminal.innerHTML += `<br>[IN]: ${val} <br>`;
  return val;
};

// Switch active tab
function switchTab(tabId) {
  document.querySelectorAll(".tab-btn").forEach(btn => btn.classList.remove("active"));
  document.querySelectorAll(".tab-content").forEach(content => content.classList.remove("active"));
  
  if(tabId === 'system-log') document.querySelectorAll(".tab-btn")[0].classList.add("active");
  if(tabId === 'io-log') document.querySelectorAll(".tab-btn")[1].classList.add("active");
  document.getElementById(tabId).classList.add("active");
}

function appendLog(tabId, text, type) {
  const target = document.getElementById(tabId);
  const div = document.createElement("div");
  div.className = `console-line ${type}`;
  div.innerText = text;
  target.appendChild(div);
  target.scrollTop = target.scrollHeight;
}

function clearCurrentTab() {
  const activeContent = document.querySelector(".tab-content.active");
  if(activeContent) {
    activeContent.innerHTML = activeContent.id === "io-log" ? "" : `<div class="console-line system">> Window content cleared.</div>`;
  }
}

// Compile
function compileCode(type) {
  const code = document.getElementById("codeInput").value.trim();
  if(!code) {
    appendLog("system-log", "Compilation failed: No code found.", "error");
    return false;
  }
  try {
    vm.clearVM();
    let tokens;
    if(type === "IS" || type === "SC"){
      tokens = (type == "IS") ? vm.processIS(code) : vm.processSC(code);
    } else {
      tokens = vm.processString(code);
    }
    vm.loadCode(tokens);
    parsedInstructions = [];
    for(let i = 0; i < tokens.length; i++) {
      parsedInstructions.push(vm.translate(tokens[i], true));
    }
    
    renderInstructionFlow();
    updateDebuggerUI();
    appendLog("system-log", "Source code compiled successfully! You can choose auto run or step execution.", "system");
    return true;
  } catch (err) {
    appendLog("system-log", `Compilation error: ${err.message}`, "error");
    return false;
  }
}

// Render instruction list
function renderInstructionFlow() {
  const container = document.getElementById("instructionFlow");
  container.innerHTML = "";
  
  vm.instruction.forEach((raw, index) => {
    const div = document.createElement("div");
    div.className = "inst-line";
    div.id = `inst-${index}`;
    
    const parsed = parsedInstructions[index];
    const parsedText = `${parsed[0]} ${parsed[1] !== undefined ? parsed[1] : ""}`;

    div.innerHTML = `
      <span class="inst-num">[${index}]</span>
      <span class="inst-raw">${raw}</span>
      <span class="inst-parsed">➔ ${parsedText}</span>
    `;
    container.appendChild(div);
  });
}

// Update all dynamic variables in the right-side debugger panel
function updateDebuggerUI() {
  document.getElementById("val-pc").innerText = vm.pc;
  document.getElementById("pc-status").innerText = `PC: ${vm.pc}`;
  document.getElementById("val-stack-size").innerText = vm.stack.length;
  document.getElementById("val-callstack-size").innerText = vm.call_stack.length;
  document.getElementById("val-heap-size").innerText = Object.keys(vm.heap).length;

  // Track and highlight current instruction line
  document.querySelectorAll(".inst-line").forEach(el => el.classList.remove("active"));
  const currentLine = document.getElementById(`inst-${vm.pc}`);
  if(currentLine) {
    currentLine.classList.add("active");
    currentLine.scrollIntoView({ block: "nearest", behavior: "smooth" });
  }

  // Render Stack
  const stackCon = document.getElementById("stackContainer");
  stackCon.innerHTML = "";
  if(vm.stack.length === 0) {
    stackCon.innerHTML = '<div style="color: var(--text-muted); font-size: 0.8rem; text-align: center;">(Stack Empty)</div>';
  } else {
    for(let i = vm.stack.length - 1; i >= 0; i--) {
      const div = document.createElement("div");
      div.className = `stack-item ${i === vm.stack.length - 1 ? 'top' : ''}`;
      div.innerHTML = `<span>Stack Unit  [${i}]</span> <span>${vm.stack[i]}</span>`;
      stackCon.appendChild(div);
    }
  }

  // Render Heap
  const heapBody = document.getElementById("heapTableBody");
  heapBody.innerHTML = "";
  const heapKeys = Object.keys(vm.heap);
  if(heapKeys.length === 0) {
    heapBody.innerHTML = '<tr><td colspan="2" style="color: var(--text-muted); text-align: center;">(Heap Empty)</td></tr>';
  } else {
    heapKeys.forEach(key => {
      const tr = document.createElement("tr");
      tr.innerHTML = `<td>${key}</td><td>${vm.heap[key]}</td>`;
      heapBody.appendChild(tr);
    });
  }

  // Render Labels mapping
  const labelCon = document.getElementById("labelsContainer");
  labelCon.innerHTML = "";
  const labelKeys = Object.keys(vm.labels);
  if(labelKeys.length === 0) {
    labelCon.innerHTML = '<span style="color: var(--text-muted); font-size: 0.8rem;">No Labels</span>';
  } else {
    labelKeys.forEach(key => {
      const span = document.createElement("span");
      span.className = "label-tag";
      span.innerText = `L${key} ➔ Line ${vm.labels[key]}`;
      labelCon.appendChild(span);
    });
  }
}

// Run
async function startRun() {
  if (vm.instruction.length === 0) {
    if (!compileCode()) return;
  }
  vm.pause = false;
  appendLog("system-log", "▶ Core started, execution begins...", "system");
  
  vm.run();
  
  if (vm.pc >= vm.instruction.length) {
    appendLog("system-log", "VM Execution Terminated", "system");
  }
}

// Continuous auto step-execution
async function autoStep() {
  if (vm.instruction.length === 0) {
    if (!compileCode()) return;
  }
  vm.pause = false;
  appendLog("system-log", "▶ Core started, auto execution running...", "system");
  
  while (vm.pc < vm.instruction.length && !vm.pause) {
    vm.run_oneStep();
    updateDebuggerUI();
    await new Promise(resolve => setTimeout(resolve, 80));
  }
  
  if (vm.pc >= vm.instruction.length) {
    appendLog("system-log", "VM Execution Terminated", "system");
  }
}

// Pause
function pauseRun() {
  vm.pause = true;
  appendLog("system-log", "Execution paused", "system");
}

// Single step execution
function stepRun() {
  if (vm.instruction.length === 0) {
    if (!compileCode()) return;
  }
  if (vm.pc < vm.instruction.length) {
    const next = parsedInstructions[vm.pc];
    appendLog("system-log", `Step ➔ [PC: ${vm.pc}] Execute ${next[0]} ${next[1] || ''}`, "system");
    vm.run_oneStep();
    updateDebuggerUI();
  } else {
    appendLog("system-log", "Reached the end of the instruction set. No more instructions.", "system");
  }
}

// Global reset
function resetVM() {
  vm.clearVM();
  updateDebuggerUI();
  document.getElementById("instructionFlow").innerHTML = '<div style="color: var(--text-muted); padding: 10px;">Not compiled yet.</div>';
  document.getElementById("system-log").innerHTML = '<div class="console-line system">> System initialized, cache cleared.</div>';
  document.getElementById("io-log").innerText = "";
  switchTab('system-log');
}