# Dev Container のベースイメージ
#
# Microsoft 公式の TypeScript + Node イメージ。Node・npm・git・zsh などが
# 揃っており、amd64 と arm64 の両方に対応している（Apple Silicon でもそのまま動く）。
FROM mcr.microsoft.com/devcontainers/typescript-node:22

# コンテナ内の時刻を日本時間にする。
# ログや `date` の表示が JST になり、ローカルでの確認がしやすい。
#
# 補足: アプリの日時処理そのものはタイムゾーンに依存しない作りになっている
#      （src/lib/date-utils.ts を参照）。ここは表示上の都合。
ENV TZ=Asia/Tokyo
RUN ln -snf /usr/share/zoneinfo/${TZ} /etc/localtime && echo ${TZ} > /etc/timezone

# PostgreSQL のクライアント（psql）を入れておく。
# DB の中身を見たいときに、別途ツールを入れなくてもコンテナ内で完結できる。
RUN apt-get update \
    && apt-get install -y --no-install-recommends postgresql-client \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*
