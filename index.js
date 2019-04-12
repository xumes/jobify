const express = require("express");
const app = express();

const sqlite = require("sqlite");
const dbConnection = sqlite.open("jobify.sqlite", { Promise });

app.set("view engine", "ejs");
app.use(express.static("public"));

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

app.get("/admin/vagas/editar/:id", async (req, res) => {
  console.log("ediatndo a vaga", req.params.id);
  res.render("admin/home");
});

app.get("/admin/vagas/nova", (req, res) => {
  res.render("admin/vaga/nova");
});

const init = async () => {
  const db = await dbConnection;
  await db.run(
    "create table if not exists categorias (id INTEGER PRIMARY KEY, categoria TEXT);"
  );
  await db.run(
    "create table if not exists vagas (id INTEGER PRIMARY KEY, categoria INTEGER, titulo TEXT, descricao TEXT);"
  );
  //const categoria = 'Marketing team';
  // const cat = 2
  // const vagaTitulo = 'Digital Marketing (San Francisco)'
  // const vagaDescr = 'excelent benefits'
  // await db.run(`INSERT INTO vagas(categoria, titulo, descricao) values(${cat}, '${vagaTitulo}', '${vagaDescr}')`)
};

init();

app.listen(3000, err => {
  if (err) {
    console.log("não foi possível iniciar o servidor");
  } else {
    console.log("Jobify server running");
  }
});
