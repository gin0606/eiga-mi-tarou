# eiga-mi-tarou

Discord のイベントの「イベントのトピック」に映画タイトル、「概要」に `映画` と入れると The Movie Database から映画情報を取ってきてイベントを編集してくれるボット

## 必要な環境変数

- `DISCORD_BOT_TOKEN`: Discord のボットのトークン
- `TMDB_API_TOKEN`: The Movie Database の API トークン

## 動かしかた

```
deno run --allow-env --allow-net index.ts
```

```
docker run -it --init --name eiga-mi-tarou -e TMDB_API_TOKEN=$TMDB_API_TOKEN -e DISCORD_BOT_TOKEN=$DISCORD_BOT_TOKEN -v $PWD:/app denoland/deno:1.20.4 run --allow-env --allow-net app/index.ts
```
