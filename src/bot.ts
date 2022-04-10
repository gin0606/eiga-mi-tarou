import { encode } from "https://deno.land/std@0.133.0/encoding/base64.ts";
import {
  Bot,
  createBot,
  DiscordScheduledEvent,
  ScheduledEvent,
  startBot as startDiscordBot,
} from "https://deno.land/x/discordeno@13.0.0-rc34/mod.ts";

const tmdbApiKey = Deno.env.get("TMDB_API_TOKEN") || "";
const discordBotToken = Deno.env.get("DISCORD_BOT_TOKEN") || "";

async function fetchMovieDetail(query: string) {
  const url =
    `https://api.themoviedb.org/3/search/movie?api_key=${tmdbApiKey}&language=ja-jp&query=${query}`;
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
  if (!e.description?.includes("映画")) {
    return;
  }
  const json = await fetchMovieDetail(e.name.split(" ").join("+"));

  if (json.results.length <= 0) {
    bot.helpers.editScheduledEvent(e.guildId, e.id, {
      description: "映画情報が見つかりませんでした",
    });
    return;
  }
  const popularResult = json.results.sort((a: any, b: any) => {
    return b.popularity - a.popularity;
  })[0];

  const title = popularResult.title;
  const overview = popularResult.overview;
  const image = await fetchMovieImage(popularResult.backdrop_path);

  if (!e.description?.includes(overview)) {
    const event = await bot.rest.runMethod<DiscordScheduledEvent>(
      bot.rest,
      "patch",
      bot.constants.endpoints.GUILD_SCHEDULED_EVENT(e.guildId, e.id),
      {
        name: title,
        description: `${e.description}\n${overview}`,
        image: image,
      },
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
      updateForMovieEvent(bot, event);
    },
    scheduledEventUpdate(bot, event) {
      updateForMovieEvent(bot, event);
    },
  },
});

export const startBot = () => startDiscordBot(bot);
