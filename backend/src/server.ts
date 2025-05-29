import app from "./app";
import { HOST_PORT } from "./config/env";

app.listen(HOST_PORT, () => {
  console.log(`Server is running on http://localhost:${HOST_PORT}`);
});
