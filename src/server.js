import { dirname } from "path";
import { fileURLToPath } from "url";
import * as http from "http";
import express from "express";
import { Server } from "socket.io";
import { Contenedor } from "./Contenedor.js";
import { engine } from "express-handlebars";

const app = express();
const server = http.createServer(app);
const io = new Server(server);
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const PORT = 8080;
const products = new Contenedor("./products.json");
const chatMessages = new Contenedor("./message-log.json");

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.set("views", "./src/views");
app.set("view engine", "hbs");

app.engine(
  "hbs",
  engine({
    extname: ".hbs",
    defaultLayout: "index.hbs",
    layoutsDir: __dirname + "/views/layouts",
    partialsDir: __dirname + "/views/partials",
  })
);

io.on("connection", async (socket) => {
  console.log("Usuario conectado");

  const productsList = await products.getAll();
  socket.emit("startedProductList", productsList);

  const messagesList = await chatMessages.getAll();
  socket.emit("startedMessagesList", messagesList);

  socket.on("newMessage", async (data) => {
    await chatMessages.save(data);

    const messages = await chatMessages.getAll();
    io.sockets.emit("updateMessages", messages);
  });

  socket.on("addNewProduct", async (data) => {
    console.log("Usuario hizo click");

    await products.save(data);

    const productsList = await products.getAll();
    io.sockets.emit("updateProducts", productsList);
  });

  socket.on("disconnect", () => {
    console.log("Usuario desconectado");
  });
});

app.get("/", (req, res) => {
  res.render("pages/add-product", {});
});

app.get("/products-list", async (req, res) => {
  const productList = await products.getAll();
  res.render("pages/products-list", { productList });
});

app.post("/products", async (req, res) => {
  const product = req.body;
  let newId = 0;
  const allProducts = await products.getAll();

  if (allProducts.length > 0) {
    newId = allProducts[allProducts.length - 1].id + 1;
  }

  const newProduct = { id: newId, ...product };
  await products.save(newProduct);
  res.redirect("/products-list");
});

server.listen(PORT, () => {
  console.log(`Servidor escuchando puerto ${PORT}`);
});

server.on("error", (err) => console.error(err));
