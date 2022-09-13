import express from "express";
import cors from "cors";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient({ log: ["warn", "error", "info", "query"] });
const app = express();
app.use(cors());
app.use(express.json());

const port = 5126;

app.get("/", async (req, res) => {
  res.send(`
    <h1> User & Hobbies </h1>
    <ul>
    <li> <a href="/users"> Users </a> </li>
    <li> <a href="/hobbies"> Hobbies </a> </li>
    </ul>`);
});

// users
app.get("/users", async (req, res) => {
  const users = await prisma.user.findMany({ include: { hobbies: true } });
  res.send(users);
});
app.get("/users/:id", async (req, res) => {
  const user = await prisma.user.findUnique({
    where: { id: Number(req.params.id) },
    include: { hobbies: true },
  });

  if (user) {
    res.send(user);
  } else {
    res.status(404).send({ error: "User not Found!" });
  }
});

app.post("/users", async (req, res) => {
  const userData = {
    name: req.body.name,
    image: req.body.image,
    email: req.body.name,
    hobbies: req.body.hobbies ? req.body.hobbies : [],
  };
  const user = await prisma.user.create({
    data: {
      name: userData.name,
      image: userData.image,
      email: userData.email,
      hobbies: {
        // @ts-ignore
        connectOrCreate: userData.hobbies.map((hobby: String) => ({
          where: { name: hobby },
          create: { name: hobby },
        })),
      },
    },
    include: { hobbies: true },
  });
  res.send(user);
});

app.patch("/users/:id", async (req, res) => {
  const id = Number(req.params.id);
  const user = await prisma.user.update({
    where: { id },
    data: req.body,
    include: { hobbies: true },
  });
  res.send(user);
});

app.delete("/users/:id", async (req, res) => {
  await prisma.user.delete({
    where: { id: Number(req.params.id) },
  });

  res.send({ message: "User deleted succeessfuly" });
});

// hobbies
app.get("/hobbies", async (req, res) => {
  const hobbies = await prisma.hobby.findMany({ include: { users: true } });
  res.send(hobbies);
});

app.get("/hobbies/:id", async (req, res) => {
  const id = Number(req.params.id);
  const hobby = await prisma.hobby.findUnique({
    where: { id },
    include: { users: true },
  });
  if (hobby) {
    res.send(hobby);
  } else {
    res.status(404).send({ error: "Hobby not Found!" });
  }
});
app.post("/hobbies", async (req, res) => {
  const hobbyData = {
    name: req.body.name,
    image: req.body.image,
    active: req.body.active,
    users: req.body.users ? req.body.users : [],
  };
  const hobby = await prisma.hobby.create({
    data: {
      name: hobbyData.name,
      image: hobbyData.image,
      active: hobbyData.active,
      users: {
        //@ts-ignore
        connectOrCreate: hobbyData.users.map((user) => ({
          where: { name: user },
          create: { name: user },
        })),
      },
    },
    include: { users: true },
  });
  res.send(hobby);
});

app.patch("/hobbies/:id", async (req, res) => {
  const id = Number(req.params.id);
  const hobby = await prisma.hobby.update({
    where: { id },
    data: req.body,
    include: { users: true },
  });
  res.send(hobby);
});

app.delete("/hobbies/:id", async (req, res) => {
  await prisma.hobby.delete({
    where: { id: Number(req.params.id) },
  });

  res.send({ message: "Hobby deleted successfuly" });
});

app.listen(port, () => {
  console.log(`YAY: http://localhost:${port}`);
});
