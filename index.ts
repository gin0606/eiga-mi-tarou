import { startBot } from "./src/bot.ts";

import { serve } from "https://deno.land/std@0.134.0/http/server.ts";
import { parse } from "https://deno.land/std@0.134.0/flags/mod.ts";

const parsedArgs = parse(Deno.args);

if (parsedArgs["with-server"]) {
  const argPort = parsedArgs.port || "8080";
  const port = Number(argPort);

  serve(
    () => {
      return new Response("たぶん生きてる");
    },
    { port },
  );
  console.log(
    `HTTP webserver running.  Access it at:  http://localhost:${port}/`,
  );
}

await startBot();
