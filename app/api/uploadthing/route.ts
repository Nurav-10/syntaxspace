import { createRouteHandler } from "uploadthing/next";
import { ourFileRouter } from "./core";

// Export the API route handlers for GET and POST requests
export const { GET, POST } = createRouteHandler({
  router: ourFileRouter,
  // config: { ... } - Optional configs
});
