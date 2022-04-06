import { encode } from "https://deno.land/std@0.133.0/encoding/base64.ts";
import {
  createBot,
  startBot,
  Bot,
  ScheduledEvent,
  DiscordScheduledEvent,
} from "https://deno.land/x/discordeno@13.0.0-rc34/mod.ts";

const tmdbApiKey = Deno.env.get("TMDB_API_TOKEN") || "";
const discordBotToken = Deno.env.get("DISCORD_BOT_TOKEN") || "";

async function fetchMovieDetail(query: string) {
  const url = `https://api.themoviedb.org/3/search/movie?api_key=${tmdbApiKey}&language=ja-jp&query=${query}`;
  const response = await fetch(url);
  return await response.json();
}

async function fetchMovieImage(path: string) {
  const thumbnailUrl = `https://image.tmdb.org/t/p/original${path}`;
  const response = await fetch(thumbnailUrl);
  const base64 = encode(await response.arrayBuffer());
  const type = response.headers.get("Content-Type");

  return "data:" + type + ";base64," + base64;
}

async function updateForMovieEvent(bot: Bot, e: ScheduledEvent) {
  const json = await fetchMovieDetail(e.name.split(" ").join("+"));

  if (json.results.length <= 0) {
    bot.helpers.editScheduledEvent(e.guildId, e.id, {
      description: "映画情報が見つかりませんでした",
    });
    return;
  }
  const title = json.results[0].title;
  const overview = json.results[0].overview;
  const image = await fetchMovieImage(json.results[0].backdrop_path);

  if (!e.description?.includes(overview)) {
    const event = await bot.rest.runMethod<DiscordScheduledEvent>(
      bot.rest,
      "patch",
      bot.constants.endpoints.GUILD_SCHEDULED_EVENT(e.guildId, e.id),
      {
        name: title,
        description: `${e.description}\n${overview}`,
        image: image,
      }
    );
    bot.transformers.scheduledEvent(bot, event);
  }
}

const bot = createBot({
  token: discordBotToken,
  intents: ["GuildScheduledEvents"],
  botId: BigInt(atob(discordBotToken.split(".")[0])),
  events: {
    ready() {
      console.log("Successfully connected to gateway");
    },
    scheduledEventCreate(bot, event) {
      if (!event.description?.includes("映画")) {
        return;
      }
      updateForMovieEvent(bot, event);
    },
  },
});

await startBot(bot);
