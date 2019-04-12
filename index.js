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

app.get("/vaga", (req, res) => {
  res.render("vaga");
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
