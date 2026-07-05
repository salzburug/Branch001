# -*- coding: utf-8 -*-
import os

# ルートフォルダ名（全角数字で表示）
root_name = "２００５年実績"
# カレントディレクトリ配下のフルパスを作成
root_path = os.path.join(os.getcwd(), root_name)
# フォルダが存在しなくても作成（既存の場合は何もしない）
os.makedirs(root_path, exist_ok=True)

# 半角数字→全角数字への変換テーブルを作成
fw = str.maketrans("0123456789", "０１２３４５６７８９")

# 1月〜12月のフォルダを順に作成
for i in range(1, 13):
    # 月名を全角数字＋「月」で作る（例: "１月"）
    month_name = str(i).translate(fw) + "月"
    # ルートフォルダ配下に月フォルダのパスを作成
    month_path = os.path.join(root_path, month_name)
    # 月フォルダを作成（既存なら何もしない）
    os.makedirs(month_path, exist_ok=True)
    # 作成または既存を確認するログを出力
    print("作成済み／存在:", month_path)

# 完了メッセージ
print("完了:", root_path)