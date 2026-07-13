import sys
from stx_runner import SubtextLangVM

# 檢查是否有傳入檔案路徑
if len(sys.argv) < 2:
    print("使用方式: python script.py <檔案路徑>")
    input()
    raise
file_path = sys.argv[1]
# 定義目標保留的字元
targets = {'\u180B', '\u180C', '\u180D', '\u180E', '\u202C', '\u202A', '\u202D'}
# 定義取代對照表
replace_map = {
    '\u180B': '一',
    '\u180C': '二',
    '\u180D': '三',
    '\u180E': '子',
    '\u202C': '丑',
    '\u202A': '甲',
    '\u202D': '乙'
}
try:
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    # 1. 篩選：只保留在目標清單中的字元
    filtered_chars = [char for char in content if char in targets]
    # 2. 取代：將篩選後的字元轉換為目標符號
    result = [replace_map[char] for char in filtered_chars]
except FileNotFoundError:
    print(f"錯誤：找不到檔案 '{file_path}'")
except Exception as e:
    print(f"發生錯誤：{e}")

vm=SubtextLangVM()
vm.run_code_auto("".join(result))
input()