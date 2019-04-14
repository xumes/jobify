const express = require("express");
const bodyParser = require("body-parser");
const app = express();

const path = require("path");

const sqlite = require("sqlite");
const dbConnection = sqlite.open(path.resolve(__dirname, "jobify.sqlite"), {
  Promise
});

app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: true }));

app.get("/", async (req, res) => {
  const db = await dbConnection;
  const categoriasDb = await db.all("SELECT * from categorias;");
  const vagas = await db.all("SELECT * from vagas;");

  const categorias = categoriasDb.map(cat => {
    return {
      ...cat,
      vagas: vagas.filter(vaga => vaga.categoria === cat.id)
    };
  });

  res.render("home", {
    categorias
  });
});

app.get("/vaga/:id", async (req, res) => {
  const vagaId = req.params.id;
  const db = await dbConnection;
  const vaga = await db.get(`SELECT * from vagas where id=${vagaId};`);
  res.render("vaga", {
    vaga
  });
});

app.get("/admin", (req, res) => {
  res.render("admin/home");
});

app.get("/admin/vagas", async (req, res) => {
  const db = await dbConnection;
  const vagas = await db.all("SELECT * from vagas;");
  res.render("admin/vagas", {
    vagas
  });
});

app.get("/admin/vagas/delete/:id", async (req, res) => {
  const db = await dbConnection;
  const id = req.params.id;
  console.log("apagando a vaga", id);
  await db.run(`DELETE from vagas where id = ${id};`);
  res.redirect("/admin/vagas");
});

app.get("/admin/vagas/nova", async (req, res) => {
  const db = await dbConnection;
  const categoriasDb = await db.all("SELECT * from categorias;");
  console.log("categorias do banco", categoriasDb);
  res.render("admin/vaga/nova", {
    categorias: categoriasDb
  });
});

app.post("/admin/vagas/nova", async (req, res) => {
  const db = await dbConnection;
  const { titulo, descricao, categoria } = req.body;
  await db.run(
    `INSERT INTO vagas(categoria, titulo, descricao) values(${categoria}, '${titulo}', '${descricao}')`
  );
  res.redirect("/admin/vagas");
});

app.get("/admin/vagas/editar/:id", async (req, res) => {
  const db = await dbConnection;
  const categoriasDb = await db.all("SELECT * from categorias;");
  const id = req.params.id;
  const vaga = await db.get(`SELECT * from vagas where id=${id};`);
  console.log("categorias do banco", categoriasDb);
  res.render("admin/vaga/editar", {
    categorias: categoriasDb,
    vaga
  });
});

app.post("/admin/vagas/editar/:id", async (req, res) => {
  const db = await dbConnection;
  const { id } = req.params;
  const { titulo, descricao, categoria } = req.body;
  await db.run(
    `UPDATE vagas SET categoria=${categoria}, titulo="${titulo}", descricao="${descricao}" WHERE id=${id}`
  );
  res.redirect("/admin/vagas");
});

const init = async () => {
  const db = await dbConnection;
  await db.run(
    "create table if not exists categorias (id INTEGER PRIMARY KEY, categoria TEXT);"
  );
  await db.run(
    "create table if not exists vagas (id INTEGER PRIMARY KEY, categoria INTEGER, titulo TEXT, descricao TEXT);"
  );
};

init();

app.listen(3000, err => {
  if (err) {
    console.log("não foi possível iniciar o servidor");
  } else {
    console.log("Jobify server running");
  }
});
