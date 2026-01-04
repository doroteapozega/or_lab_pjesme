// import potrebnih paketa
const express = require("express");
const { Pool } = require("pg");

// osnovna konfiguracija aplikacije za rad
const app = express();
app.use(express.json()); // za parsiranje JSON tijela zahtjeva
app.set("view engine", "ejs");

// spajanje s bazom
const pool = new Pool({
  user: "postgres",
  host: "localhost",
  database: "otvoreno_baza",
  password: "G26XFCXW",
  port: 5432,
});

// response wrapper fja
function responseWrapper(status, message, response = null) {
  return {
    status: status,
    message: message,
    response: response,
  };
}

// funkcija koja gradi SQL i parametre
function buildSql(q, field) {
  const params = [];
  let where = "TRUE";
  if (q && q.trim() !== "") {
    const p = `%${q}%`;
    params.push(p);
    if (field === "izvodaci") {
      where = `EXISTS (SELECT 1 FROM izvodaci i WHERE i.pjesma = p.naslov AND i.imena ILIKE $1)`;
    } else if (field === "zanrovi") {
      where = `EXISTS (SELECT 1 FROM zanrovi z WHERE z.pjesma = p.naslov AND z.zanr ILIKE $1)`;
    } else if (field === "autori") {
      where = `EXISTS (SELECT 1 FROM autori a WHERE a.pjesma = p.naslov AND (a.ime || ' ' || a.prezime) ILIKE $1)`;
    } else if (field === "producenti") {
      where = `EXISTS (SELECT 1 FROM producenti pr WHERE pr.pjesma = p.naslov AND (pr.ime || ' ' || pr.prezime) ILIKE $1)`;
    } else if (field === "godina_objavljivanja") {
      where = `p.godina_objavljivanja::text ILIKE $1`;
    } else if (field === "trajanje_s") {
      where = `p.trajanje_s::text ILIKE $1`;
    } else if (
      field === "naslov" ||
      field === "album" ||
      field === "izdavacka_kuca" ||
      field === "jezik"
    ) {
      where = `p.${field} ILIKE $1`;
    } else {
      where = `(
        p.naslov ILIKE $1 OR
        p.album ILIKE $1 OR
        p.izdavacka_kuca ILIKE $1 OR
        p.jezik ILIKE $1 OR
        p.godina_objavljivanja::text ILIKE $1 OR
        EXISTS (SELECT 1 FROM izvodaci i WHERE i.pjesma = p.naslov AND i.imena ILIKE $1) OR
        EXISTS (SELECT 1 FROM zanrovi z WHERE z.pjesma = p.naslov AND z.zanr ILIKE $1) OR
        EXISTS (SELECT 1 FROM autori a WHERE a.pjesma = p.naslov AND (a.ime || ' ' || a.prezime) ILIKE $1) OR
        EXISTS (SELECT 1 FROM producenti pr WHERE pr.pjesma = p.naslov AND (pr.ime || ' ' || pr.prezime) ILIKE $1)
      )`;
    }
  }
  const sql = `
    SELECT
      p.naslov AS "Naslov",
      p.album AS "Album",
      (SELECT array_agg(i.imena) FROM izvodaci i WHERE i.pjesma = p.naslov) AS "Izvođači",
      p.godina_objavljivanja::text AS "Godina_objavljivanja",
      (SELECT array_agg(z.zanr) FROM zanrovi z WHERE z.pjesma = p.naslov) AS "Žanrovi",
      p.trajanje_s AS "Trajanje_(s)",
      p.izdavacka_kuca AS "Izdavačka_kuća",
      p.jezik AS "Jezik",
      (SELECT json_agg(json_build_object('Ime', a.ime, 'Prezime', a.prezime)) FROM autori a WHERE a.pjesma = p.naslov) AS "Autori",
      (SELECT json_agg(json_build_object('Ime', pr.ime, 'Prezime', pr.prezime)) FROM producenti pr WHERE pr.pjesma = p.naslov) AS "Producenti"
    FROM pjesme p
    WHERE ${where}
    ORDER BY p.naslov;
  `;
  return { sql, params };
}

// REST API ENDPOINTOVI (sada dio za 3. lab)

// dohvacanje cijele kolekcije pjesama
app.get("/api/v1/pjesme", async (req, res) => {
  try {
    const sql = `
      SELECT
        p.naslov AS "Naslov",
        p.album AS "Album",
        (SELECT array_agg(i.imena) FROM izvodaci i WHERE i.pjesma = p.naslov) AS "Izvođači",
        p.godina_objavljivanja::text AS "Godina_objavljivanja",
        (SELECT array_agg(z.zanr) FROM zanrovi z WHERE z.pjesma = p.naslov) AS "Žanrovi",
        p.trajanje_s AS "Trajanje_(s)",
        p.izdavacka_kuca AS "Izdavačka_kuća",
        p.jezik AS "Jezik",
        (SELECT json_agg(json_build_object('Ime', a.ime, 'Prezime', a.prezime)) FROM autori a WHERE a.pjesma = p.naslov) AS "Autori",
        (SELECT json_agg(json_build_object('Ime', pr.ime, 'Prezime', pr.prezime)) FROM producenti pr WHERE pr.pjesma = p.naslov) AS "Producenti"
      FROM pjesme p
      ORDER BY p.naslov;
    `;
    const result = await pool.query(sql);
    res
      .status(200)
      .json(
        responseWrapper("OK", "Fetched all songs successfully", result.rows)
      );
  } catch (error) {
    console.error(error);
    res.status(500).json(responseWrapper("Error", "Server error", null));
  }
});

// dohvacanje pojedinacne pjesme po jedinstvenom identifikatoru (naslovu)
app.get("/api/v1/pjesme/:naslov", async (req, res) => {
  try {
    const naslov = req.params.naslov;
    const sql = `
      SELECT
        p.naslov AS "Naslov",
        p.album AS "Album",
        (SELECT array_agg(i.imena) FROM izvodaci i WHERE i.pjesma = p.naslov) AS "Izvođači",
        p.godina_objavljivanja::text AS "Godina_objavljivanja",
        (SELECT array_agg(z.zanr) FROM zanrovi z WHERE z.pjesma = p.naslov) AS "Žanrovi",
        p.trajanje_s AS "Trajanje_(s)",
        p.izdavacka_kuca AS "Izdavačka_kuća",
        p.jezik AS "Jezik",
        (SELECT json_agg(json_build_object('Ime', a.ime, 'Prezime', a.prezime)) FROM autori a WHERE a.pjesma = p.naslov) AS "Autori",
        (SELECT json_agg(json_build_object('Ime', pr.ime, 'Prezime', pr.prezime)) FROM producenti pr WHERE pr.pjesma = p.naslov) AS "Producenti"
      FROM pjesme p
      WHERE p.naslov = $1;
    `;
    const result = await pool.query(sql, [naslov]);
    if (result.rows.length === 0) {
      res
        .status(404)
        .json(
          responseWrapper(
            "Not Found",
            `Song with the name '${naslov}' doesn't exist`,
            null
          )
        );
    } else {
      res
        .status(200)
        .json(
          responseWrapper("OK", "Song fetched successfully", result.rows[0])
        );
    }
  } catch (error) {
    console.error(error);
    res.status(500).json(responseWrapper("Error", "Server error", null));
  }
});

// dohvacanje pjesama po godini
app.get("/api/v1/pjesme/godina/:godina", async (req, res) => {
  try {
    const godina = req.params.godina;
    const sql = `
      SELECT
        p.naslov AS "Naslov",
        p.album AS "Album",
        (SELECT array_agg(i.imena) FROM izvodaci i WHERE i.pjesma = p.naslov) AS "Izvođači",
        p.godina_objavljivanja::text AS "Godina_objavljivanja",
        (SELECT array_agg(z.zanr) FROM zanrovi z WHERE z.pjesma = p.naslov) AS "Žanrovi",
        p.trajanje_s AS "Trajanje_(s)",
        p.izdavacka_kuca AS "Izdavačka_kuća",
        p.jezik AS "Jezik",
        (SELECT json_agg(json_build_object('Ime', a.ime, 'Prezime', a.prezime)) FROM autori a WHERE a.pjesma = p.naslov) AS "Autori",
        (SELECT json_agg(json_build_object('Ime', pr.ime, 'Prezime', pr.prezime)) FROM producenti pr WHERE pr.pjesma = p.naslov) AS "Producenti"
      FROM pjesme p
      WHERE p.godina_objavljivanja = $1
      ORDER BY p.naslov;
    `;
    const result = await pool.query(sql, [godina]);
    if (result.rows.length === 0) {
      res
        .status(404)
        .json(
          responseWrapper(
            "Not Found",
            `There are no songs released in ${godina}`,
            null
          )
        );
    } else {
      res
        .status(200)
        .json(
          responseWrapper("OK", "Fetched all songs successfully", result.rows)
        );
    }
  } catch (error) {
    console.error(error);
    res.status(500).json(responseWrapper("Error", "Server error", null));
  }
});

// dohvacanje pjesama po zanru
app.get("/api/v1/pjesme/zanr/:zanr", async (req, res) => {
  try {
    const zanr = req.params.zanr;
    const sql = `
      SELECT
        p.naslov AS "Naslov",
        p.album AS "Album",
        (SELECT array_agg(i.imena) FROM izvodaci i WHERE i.pjesma = p.naslov) AS "Izvođači",
        p.godina_objavljivanja::text AS "Godina_objavljivanja",
        (SELECT array_agg(z.zanr) FROM zanrovi z WHERE z.pjesma = p.naslov) AS "Žanrovi",
        p.trajanje_s AS "Trajanje_(s)",
        p.izdavacka_kuca AS "Izdavačka_kuća",
        p.jezik AS "Jezik",
        (SELECT json_agg(json_build_object('Ime', a.ime, 'Prezime', a.prezime)) FROM autori a WHERE a.pjesma = p.naslov) AS "Autori",
        (SELECT json_agg(json_build_object('Ime', pr.ime, 'Prezime', pr.prezime)) FROM producenti pr WHERE pr.pjesma = p.naslov) AS "Producenti"
      FROM pjesme p
      JOIN zanrovi z ON p.naslov = z.pjesma
      WHERE z.zanr = $1
      ORDER BY p.naslov;
    `;
    const result = await pool.query(sql, [zanr]);
    if (result.rows.length === 0) {
      res
        .status(404)
        .json(
          responseWrapper("Not Found", `No songs in the '${zanr}' genre`, null)
        );
    } else {
      res
        .status(200)
        .json(
          responseWrapper("OK", "Fetched all songs successfully", result.rows)
        );
    }
  } catch (error) {
    console.error(error);
    res.status(500).json(responseWrapper("Error", "Server error", null));
  }
});

// dohvacanje pjesama po izdavackoj kuci
app.get("/api/v1/pjesme/izdavacka_kuca/:izdavacka_kuca", async (req, res) => {
  try {
    const kuca = req.params.izdavacka_kuca;
    const sql = `
      SELECT
        p.naslov AS "Naslov",
        p.album AS "Album",
        (SELECT array_agg(i.imena) FROM izvodaci i WHERE i.pjesma = p.naslov) AS "Izvođači",
        p.godina_objavljivanja::text AS "Godina_objavljivanja",
        (SELECT array_agg(z.zanr) FROM zanrovi z WHERE z.pjesma = p.naslov) AS "Žanrovi",
        p.trajanje_s AS "Trajanje_(s)",
        p.izdavacka_kuca AS "Izdavačka_kuća",
        p.jezik AS "Jezik",
        (SELECT json_agg(json_build_object('Ime', a.ime, 'Prezime', a.prezime)) FROM autori a WHERE a.pjesma = p.naslov) AS "Autori",
        (SELECT json_agg(json_build_object('Ime', pr.ime, 'Prezime', pr.prezime)) FROM producenti pr WHERE pr.pjesma = p.naslov) AS "Producenti"
      FROM pjesme p
      WHERE p.izdavacka_kuca = $1
      ORDER BY p.naslov;
    `;
    const result = await pool.query(sql, [kuca]);
    if (result.rows.length === 0) {
      res
        .status(404)
        .json(
          responseWrapper("Not Found", `No songs released by '${kuca}'`, null)
        );
    } else {
      res
        .status(200)
        .json(
          responseWrapper("OK", "Fetched all songs successfully", result.rows)
        );
    }
  } catch (error) {
    console.error(error);
    res.status(500).json(responseWrapper("Error", "Server error", null));
  }
});

// dodavanje nove pjesme
app.post("/api/v1/pjesme", async (req, res) => {
  try {
    // citanje polja iz req.body
    const Naslov = req.body.Naslov;
    const Album = req.body.Album;
    const Godina_objavljivanja = req.body["Godina_objavljivanja"];
    const Trajanje_s = req.body["Trajanje_(s)"];
    const Izdavačka_kuća = req.body["Izdavačka_kuća"];
    const Jezik = req.body.Jezik;
    const Izvođači = req.body.Izvođači;
    const Žanrovi = req.body.Žanrovi;
    const Autori = req.body.Autori;
    const Producenti = req.body.Producenti;
    // provjera jesu li sva polja ispunjena
    if (
      !Naslov ||
      !Album ||
      !Godina_objavljivanja ||
      Trajanje_s === undefined ||
      !Izdavačka_kuća ||
      !Jezik ||
      !Izvođači ||
      !Žanrovi ||
      !Autori ||
      !Producenti
    ) {
      return res
        .status(400)
        .json(responseWrapper("Bad Request", "All fields are required", null));
    }
    // provjera postoji li vec pjesma s tim naslovom (posto to sluzi kao ID)
    const checkSql = "SELECT naslov FROM pjesme WHERE naslov = $1";
    const checkResult = await pool.query(checkSql, [Naslov]);
    if (checkResult.rows.length > 0) {
      return res
        .status(409)
        .json(
          responseWrapper(
            "Conflict",
            `Song by the name '${Naslov}' already exists`,
            null
          )
        );
    }
    await pool.query("BEGIN");
    // dodaj pjesmu u glavnu tablicu
    const insertPjesmaSql = `
      INSERT INTO pjesme (naslov, album, godina_objavljivanja, trajanje_s, izdavacka_kuca, jezik)
      VALUES ($1, $2, $3, $4, $5, $6)
    `;
    await pool.query(insertPjesmaSql, [
      Naslov,
      Album,
      Godina_objavljivanja,
      Trajanje_s,
      Izdavačka_kuća,
      Jezik,
    ]);
    // onda izvodace
    if (Izvođači && Array.isArray(Izvođači)) {
      for (const izvodac of Izvođači) {
        const insertIzvodacSql = `
          INSERT INTO izvodaci (imena, pjesma)
          VALUES ($1, $2)
        `;
        await pool.query(insertIzvodacSql, [izvodac, Naslov]);
      }
    }
    // pa zanrove
    if (Žanrovi && Array.isArray(Žanrovi)) {
      for (const zanr of Žanrovi) {
        const insertZanrSql = `
          INSERT INTO zanrovi (zanr, pjesma)
          VALUES ($1, $2)
        `;
        await pool.query(insertZanrSql, [zanr, Naslov]);
      }
    }
    // i autore
    if (Autori && Array.isArray(Autori)) {
      for (const autor of Autori) {
        const insertAutorSql = `
          INSERT INTO autori (ime, prezime, pjesma)
          VALUES ($1, $2, $3)
        `;
        await pool.query(insertAutorSql, [autor.Ime, autor.Prezime, Naslov]);
      }
    }
    // te producente
    if (Producenti && Array.isArray(Producenti)) {
      for (const producent of Producenti) {
        const insertProducentSql = `
          INSERT INTO producenti (ime, prezime, pjesma)
          VALUES ($1, $2, $3)
        `;
        await pool.query(insertProducentSql, [
          producent.Ime,
          producent.Prezime,
          Naslov,
        ]);
      }
    }
    await pool.query("COMMIT");
    // vrati kreiranu pjesmu
    const getPjesmaSql = `
      SELECT
        p.naslov AS "Naslov",
        p.album AS "Album",
        (SELECT array_agg(i.imena) FROM izvodaci i WHERE i.pjesma = p.naslov) AS "Izvođači",
        p.godina_objavljivanja::text AS "Godina_objavljivanja",
        (SELECT array_agg(z.zanr) FROM zanrovi z WHERE z.pjesma = p.naslov) AS "Žanrovi",
        p.trajanje_s AS "Trajanje_(s)",
        p.izdavacka_kuca AS "Izdavačka_kuća",
        p.jezik AS "Jezik",
        (SELECT json_agg(json_build_object('Ime', a.ime, 'Prezime', a.prezime)) FROM autori a WHERE a.pjesma = p.naslov) AS "Autori",
        (SELECT json_agg(json_build_object('Ime', pr.ime, 'Prezime', pr.prezime)) FROM producenti pr WHERE pr.pjesma = p.naslov) AS "Producenti"
      FROM pjesme p
      WHERE p.naslov = $1;
    `;
    const created = await pool.query(getPjesmaSql, [Naslov]);
    res
      .status(201)
      .json(
        responseWrapper("Created", "Song added successfully", created.rows[0])
      );
  } catch (error) {
    await pool.query("ROLLBACK");
    console.error(error);
    res
      .status(500)
      .json(responseWrapper("Error", "Failed to add the song", null));
  }
});

// azuriranje postojece pjesme
app.put("/api/v1/pjesme/:naslov", async (req, res) => {
  try {
    const stariNaslov = req.params.naslov; // jer nam je to kao ID (nazalost)
    // citanje polja iz req.body
    const noviNaslov = req.body.Naslov;
    const Album = req.body.Album;
    const Godina_objavljivanja = req.body["Godina_objavljivanja"];
    const Trajanje_s = req.body["Trajanje_(s)"];
    const Izdavačka_kuća = req.body["Izdavačka_kuća"];
    const Jezik = req.body.Jezik;
    // provjera postoji li pjesma
    const checkSql = "SELECT naslov FROM pjesme WHERE naslov = $1";
    const checkResult = await pool.query(checkSql, [stariNaslov]);
    if (checkResult.rows.length === 0) {
      return res
        .status(404)
        .json(
          responseWrapper(
            "Not Found",
            `Song by the name '${stariNaslov}' not found`,
            null
          )
        );
    }
    // azuriramo glavne podatke o pjesmi
    const updateSql = `
      UPDATE pjesme 
      SET 
        naslov = COALESCE($1, naslov),
        album = COALESCE($2, album),
        godina_objavljivanja = COALESCE($3, godina_objavljivanja),
        trajanje_s = COALESCE($4, trajanje_s),
        izdavacka_kuca = COALESCE($5, izdavacka_kuca),
        jezik = COALESCE($6, jezik)
      WHERE naslov = $7
    `;
    await pool.query(updateSql, [
      noviNaslov || stariNaslov,
      Album,
      Godina_objavljivanja,
      Trajanje_s,
      Izdavačka_kuća,
      Jezik,
      stariNaslov,
    ]);
    // ako se naslov promijenio, azuriramo i sve povezane tablice
    if (noviNaslov && noviNaslov !== stariNaslov) {
      const updateReferencesSql = `
        UPDATE izvodaci SET pjesma = $1 WHERE pjesma = $2;
        UPDATE zanrovi SET pjesma = $1 WHERE pjesma = $2;
        UPDATE autori SET pjesma = $1 WHERE pjesma = $2;
        UPDATE producenti SET pjesma = $1 WHERE pjesma = $2;
      `;
      await pool.query(updateReferencesSql, [noviNaslov, stariNaslov]);
    }
    // vrati azuriranu pjesmu
    const finalNaslov = noviNaslov || stariNaslov;
    const getPjesmaSql = `
      SELECT
        p.naslov AS "Naslov",
        p.album AS "Album",
        (SELECT array_agg(i.imena) FROM izvodaci i WHERE i.pjesma = p.naslov) AS "Izvođači",
        p.godina_objavljivanja::text AS "Godina_objavljivanja",
        (SELECT array_agg(z.zanr) FROM zanrovi z WHERE z.pjesma = p.naslov) AS "Žanrovi",
        p.trajanje_s AS "Trajanje_(s)",
        p.izdavacka_kuca AS "Izdavačka_kuća",
        p.jezik AS "Jezik",
        (SELECT json_agg(json_build_object('Ime', a.ime, 'Prezime', a.prezime)) FROM autori a WHERE a.pjesma = p.naslov) AS "Autori",
        (SELECT json_agg(json_build_object('Ime', pr.ime, 'Prezime', pr.prezime)) FROM producenti pr WHERE pr.pjesma = p.naslov) AS "Producenti"
      FROM pjesme p
      WHERE p.naslov = $1;
    `;
    const updated = await pool.query(getPjesmaSql, [finalNaslov]);
    res
      .status(200)
      .json(
        responseWrapper("OK", "Song updated successfully", updated.rows[0])
      );
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json(responseWrapper("Error", "Failed to update the song info", null));
  }
});

// brisanje pjesme
app.delete("/api/v1/pjesme/:naslov", async (req, res) => {
  try {
    const naslov = req.params.naslov;
    // provjera postoji li pjesma
    const checkSql = "SELECT naslov FROM pjesme WHERE naslov = $1";
    const checkResult = await pool.query(checkSql, [naslov]);
    if (checkResult.rows.length === 0) {
      return res
        .status(404)
        .json(
          responseWrapper(
            "Not Found",
            `Song by the name '${naslov}' not found`,
            null
          )
        );
    }
    // obrisi pjesmu
    const deleteSql = "DELETE FROM pjesme WHERE naslov = $1";
    await pool.query(deleteSql, [naslov]);
    res
      .status(200)
      .json(
        responseWrapper("OK", `Song '${naslov}' successfully deleted`, null)
      );
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json(responseWrapper("Error", "Failed to delete the song", null));
  }
});

// endpoint za OpenAPI specifikaciju
app.get("/api/v1/openapi.json", (req, res) => {
  res.setHeader("Content-Type", "application/json");
  res.sendFile(__dirname + "/openapi.json");
});

// pocetna stranica
app.get("/", (req, res) => {
  res.render("index");
});

// stranica s tablicom
app.get("/datatable", (req, res) => {
  res.render("datatable");
});

// fja koja pomaze kod filtriranja (vraca pjesme koje odgovaraju filtriranom upitu)
app.get("/api/pjesme", async (req, res) => {
  const q = req.query.q || "";
  const field = req.query.field || "all";
  try {
    const { sql, params } = buildSql(q, field);
    const r = await pool.query(sql, params);
    res.json(r.rows);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Failed to fetch songs" });
  }
});

// izvoz u json formatu (filtriranih rezultata)
app.get("/export/json", async (req, res) => {
  const q = req.query.q || "";
  const field = req.query.field || "all";
  try {
    const { sql, params } = buildSql(q, field);
    const r = await pool.query(sql, params);
    res.setHeader("Content-Disposition", 'attachment; filename="pjesme.json"');
    res.setHeader("Content-Type", "application/json; charset=utf-8");
    res.send(JSON.stringify(r.rows, null, 2));
  } catch (e) {
    console.error(e);
    res.status(500).send("Error while exporting");
  }
});

// izvoz u csv formatu (filtriranih rezultata)
app.get("/export/csv", async (req, res) => {
  const q = req.query.q || "";
  const field = req.query.field || "all";
  try {
    const { sql, params } = buildSql(q, field);
    const r = await pool.query(sql, params);
    const header =
      "Naslov,Album,Izvođači,Godina_objavljivanja,Žanrovi,Trajanje_(s),Izdavačka_kuća,Jezik,Autori,Producenti\n";
    let csv = header;
    for (const row of r.rows) {
      const naslov = (row["Naslov"] || "").toString().replace(/"/g, '""');
      const album = (row["Album"] || "").toString().replace(/"/g, '""');
      const izv = (row["Izvođači"] || []).join(", ");
      const god = row["Godina_objavljivanja"] || "";
      const zan = (row["Žanrovi"] || []).join(", ");
      const traj = row["Trajanje_(s)"] || "";
      const kuca = (row["Izdavačka_kuća"] || "").toString().replace(/"/g, '""');
      const jezik = (row["Jezik"] || "").toString().replace(/"/g, '""');
      const autoriArr = row["Autori"] || [];
      const autoriStr = (
        Array.isArray(autoriArr)
          ? autoriArr.map((a) => `${a.Ime} ${a.Prezime}`)
          : []
      ).join(", ");
      const producentiArr = row["Producenti"] || [];
      const producentiStr = (
        Array.isArray(producentiArr)
          ? producentiArr.map((p) => `${p.Ime} ${p.Prezime}`)
          : []
      ).join(", ");
      function qv(s) {
        if (s === null || s === undefined) return "";
        const str = s.toString();
        if (str.includes(",") || str.includes('"') || str.includes("\n"))
          return `"${str.replace(/"/g, '""')}"`;
        return str;
      }
      const line =
        [
          qv(naslov),
          qv(album),
          qv(izv),
          qv(god),
          qv(zan),
          qv(traj),
          qv(kuca),
          qv(jezik),
          qv(autoriStr),
          qv(producentiStr),
        ].join(",") + "\n";
      csv += line;
    }
    res.setHeader("Content-Type", "text/csv; charset=utf-8");
    res.setHeader("Content-Disposition", 'attachment; filename="pjesme.csv"');
    res.send(csv);
  } catch (e) {
    console.error(e);
    res.status(500).send("Error while exporting");
  }
});

app.get("/download/csv", (req, res) => {
  res.download("pjesme.csv", (e) => {
    if (e) {
      console.error(e);
      return res.status(500).json({ error: "Failed to download CSV file" });
    }
  });
});

app.get("/download/json", (req, res) => {
  res.download("pjesme.json", (e) => {
    if (e) {
      console.error(e);
      return res.status(500).json({ error: "Failed to download JSON file" });
    }
  });
});

app.get("/download/schema", (req, res) => {
  res.download("schema.json", (e) => {
    if (e) {
      console.error(e);
      return res.status(500).json({ error: "Failed to download schema file" });
    }
  });
});

// dodatne provjere svih nemogucih metoda i mogucih gresaka

// 404 - endpoint ne postoji
app.use((req, res) => {
  res
    .status(404)
    .json(
      responseWrapper(
        "Not Found",
        `Endpoint '${req.method} ${req.originalUrl}' does not exist`,
        null
      )
    );
});

// 500 - globalni error handler
app.use((e, req, res, next) => {
  console.error(e);
  res.status(500).json(responseWrapper("Error", "Server error", null));
});

// pokretanje servera
const PORT = 3000;
app.listen(PORT);
