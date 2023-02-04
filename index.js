const express = require("express");
const app = express();
app.use(express.static("build"));
const cors = require("cors");
const morgan = require("morgan");
const generateId = () => {
  const maxId = persons.length > 0 ? Math.max(...persons.map((n) => n.id)) : 0;
  return maxId + 1;
};
const requestmorgan = (tokens, req, res) => {
  const body = req.body;
  const item = [
    tokens.method(req, res),
    tokens.url(req, res),
    tokens.status(req, res),
    tokens.res(req, res, "content-length"),
    "-",
    tokens["response-time"](req, res),
    "ms",
    JSON.stringify(body),
  ].join(" ");
  return item;
};
app.use(cors());
app.use(morgan(requestmorgan));
const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: "unknown endpoint" });
};

app.use(express.json());

let persons = [
  {
    name: "Ada Lovelace",
    phone: "39-44-5323523",
    id: 1,
  },
  {
    name: "Dan Abramov",
    phone: "12-43-234345",
    id: 2,
  },
  {
    name: "Mary Poppendieck",
    phone: "39-23-6423122",
    id: 3,
  },
  {
    name: "Tyler Smith",
    phone: "3211-321321-231",
    id: 4,
  },
];

app.get("/", (request, response) => {
  response.send("<h1>New APi</h1>");
});
app.get("/info", (request, response) => {
  const date = new Date();

  response.send(`<h3>Phonebook has info for ${app.all} people</h3>${date}`);
});

app.get("/api/persons", (request, response) => {
  response.json(persons);
});

app.get("/api/persons/:id", (request, response) => {
  const id = Number(request.params.id);
  const person = persons.find((person) => person.id === id);
  if (person) {
    response.json(person);
  } else {
    response.status(404).end("Not found");
  }
});

app.delete("/api/persons/:id", (request, response) => {
  const id = Number(request.params.id);
  persons = persons.filter((person) => person.id !== id);

  response.status(204).end();
});

app.post("/api/persons", (request, response) => {
  const body = request.body;
  let verifyName = false;
  const verify = () =>
    persons.find((person) => {
      if (person.name === body.name) {
        verifyName = true;
      }
    });
  verify();
  if (!body) {
    return response.status(400).json({
      error: "content missing",
    });
  }
  if (body.name === "" || body.phone === "") {
    return response.status(400).json({
      error: "Name and phone can be empty",
    });
  }
  if (verifyName) {
    return response.status(400).json({
      error: "name must be unique",
    });
  }

  const person = {
    name: body.name,
    phone: body.phone,
    id: generateId(),
  };

  persons = persons.concat(person);

  response.json(person);
});

app.put("/api/persons/:id", (request, response) => {
  const body = request.body;
  const id = Number(request.params.id);
  if (!body) {
    return response.status(400).json({
      error: "content missing",
    });
  }
  if (body.name === "" || body.phone === "") {
    return response.status(400).json({
      error: "Name and phone can be empty",
    });
  }

  const person = {
    name: body.name,
    phone: body.phone,
    id: id,
  };

  persons[id - 1] = person;
  response.json(person);
});
app.use(unknownEndpoint);

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
