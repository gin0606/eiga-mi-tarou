import { startBot } from "./src/bot.ts";

import { serve } from "https://deno.land/std@0.134.0/http/server.ts";
import { parse } from "https://deno.land/std@0.134.0/flags/mod.ts";

const parsedArgs = parse(Deno.args);

if (parsedArgs["keepalive"]) {
  const argPort = parsedArgs.port || "8080";
  const port = Number(argPort);

  serve(
    () => {
      return new Response("たぶん生きてる");
    },
    { port },
  );

  const keepaliveURL = Deno.env.get("HEROKU_KEEPALIVE_URL") ||
    Deno.env.get("HEROKU_URL") || "";
  const keepaliveInterval = Deno.env.get("KEEPALIVE_INTERVAL")
    ? Number(Deno.env.get("KEEPALIVE_INTERVAL"))
    : 10;

  if (keepaliveURL.length > 0 && keepaliveInterval > 0) {
    setInterval(async () => {
      console.log("keepalive ping");

      try {
        const response = await fetch(keepaliveURL);
        const body = response.text();
        console.log(`keepalive pong: ${response.status} ${body}`);
      } catch (error) {
        console.log(`keepalive pong: ${error}`);
      }
    }, keepaliveInterval * 60 * 1000);
  }
}

await startBot();
