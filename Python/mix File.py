import random

def merge_files_randomly(file1_path, file2_path, output_path):
    # 讀取兩個檔案的內容（此處以 UTF-8 編碼讀取文字）
    try:
        with open(file1_path, "r", encoding="utf-8") as f1, open(
            file2_path, "r", encoding="utf-8"
        ) as f2:
            content1 = list(f1.read())
            content2 = list(f2.read())
    except FileNotFoundError as e:
        print(f"錯誤：找不到檔案 - {e.filename}")
        return
    except Exception as e:
        print(f"讀取檔案時發生錯誤：{e}")
        return

    result = []

    # 當兩個檔案都還有剩餘字元時，動態計算機率並隨機穿插
    while content1 and content2:
        len1 = len(content1)
        len2 = len(content2)

        # 根據剩餘長度決定選取 file1 的機率
        # 例如：content1 剩 10 字，content2 剩 90 字，選 content1 的機率就是 10%
        if random.random() < (len1 / (len1 + len2)):
            result.append(content1.pop(0))
        else:
            result.append(content2.pop(0))

    # 當其中一個檔案抽光後，將另一個檔案剩餘的內容全部接上
    if content1:
        result.extend(content1)
    if content2:
        result.extend(content2)

    # 將結果寫入新檔案
    try:
        with open(output_path, "w", encoding="utf-8") as out_f:
            out_f.write("".join(result))
        print(f"成功！檔案已隨機穿插並儲存至：{output_path}")
    except Exception as e:
        print(f"寫入檔案時發生錯誤：{e}")

# --- 使用範例 ---
# 請替換成你的檔案路徑
file_a = '../example/Fibonacci sequence.cstx'
file_b = '../example/hello.istx'
output_file = '../BistabilityExample'

# 執行函式
merge_files_randomly(file_a, file_b, output_file)
