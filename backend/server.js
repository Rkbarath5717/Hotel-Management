const express = require("express");
const cors = require("cors");
const multer = require("multer");
const fs = require("fs");
const path = require("path");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const {
  SECRET_KEY,
  protect,
  adminOnly
} = require("./intermidiater/authentication");

const app = express();
const PORT = 5000;

app.use(cors({
  origin: "http://localhost:5173"
}));

app.use(express.json());

const dataFolder = path.join(__dirname, "data");
const uploadFolder = path.join(__dirname, "uploads");

const dataFile = path.join(dataFolder, "hotels.json");
const usersFile = path.join(dataFolder, "users.json");

if (!fs.existsSync(dataFolder)) {
  fs.mkdirSync(dataFolder, { recursive: true });
}

if (!fs.existsSync(uploadFolder)) {
  fs.mkdirSync(uploadFolder, { recursive: true });
}

if (!fs.existsSync(dataFile)) {
  fs.writeFileSync(dataFile, "[]");
}

if (!fs.existsSync(usersFile)) {
  fs.writeFileSync(usersFile, "[]");
}

app.use("/uploads", express.static(uploadFolder));


const storage = multer.diskStorage({
  destination: function (req, file, callback) {
    callback(null, uploadFolder);
  },

  filename: function (req, file, callback) {
    const fileName = Date.now() + path.extname(file.originalname);
    callback(null, fileName);
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024
  }
});


let adminAccount = null;

async function prepareAccounts() {
  adminAccount = {
    name: "Admin",
    email: "rkbarath5717@gmail.com",
    passwordHash: await bcrypt.hash("Barath@5717", 10),
    role: "admin"
  };

  const users = readUsers();

  const demoUsers = [
    {
      name: "Vignesh",
      email: "vignesh@gmail.com",
      password: "Vignesh@5717"
    },
    {
      name: "Sabari",
      email: "sabari@gmail.com",
      password: "Sabari@5717"
    }
  ];

  for (const demoUser of demoUsers) {
    const existingUser = users.find(
      user => user.email === demoUser.email
    );

    if (!existingUser) {
      users.push({
        name: demoUser.name,
        email: demoUser.email,
        passwordHash: await bcrypt.hash(demoUser.password, 10),
        role: "user"
      });
    }
  }

  saveUsers(users);
}


function readUsers() {
  const data = fs.readFileSync(usersFile, "utf8");
  return JSON.parse(data);
}

function saveUsers(users) {
  fs.writeFileSync(usersFile, JSON.stringify(users, null, 2));
}


function readHotels() {
  const data = fs.readFileSync(dataFile, "utf8");
  return JSON.parse(data);
}

function saveHotels(hotels) {
  fs.writeFileSync(dataFile, JSON.stringify(hotels, null, 2));
}

function deleteImage(image) {
  if (!image) {
    return;
  }

  const fileName = path.basename(image);
  const imagePath = path.join(uploadFolder, fileName);

  if (fs.existsSync(imagePath)) {
    fs.unlinkSync(imagePath);
  }
}


app.get("/", (req, res) => {
  res.send("Hotel Management Backend is Running");
});


app.post("/api/auth/register", async (req, res) => {
  try {
    const { name, email, password, confirmPassword } = req.body;

    if (!name || !email || !password || !confirmPassword) {
      return res.status(400).json({
        message: "All fields are required"
      });
    }

    const cleanName = name.trim();
    const cleanEmail = email.trim().toLowerCase();

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (cleanName.length < 2) {
      return res.status(400).json({
        message: "PLEASE ENTER THE VALID NAME......"
      });
    }

    if (!emailPattern.test(cleanEmail)) {
      return res.status(400).json({
        message: "PLEASE ENTER A VALID EMAIL ADDRESS..."
      });
    }

    if (password.length < 8) {
      return res.status(400).json({
        message: "PASSWORD MUST BE CONTAINS ATLEAST 8 CHARACTERS....."
      });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({
        message: "PASSWORD NOT-MATCHED...."
      });
    }

    const users = readUsers();

    const emailExists =
      cleanEmail === adminAccount.email.toLowerCase() ||
      users.some(user => user.email.toLowerCase() === cleanEmail);

    if (emailExists) {
      return res.status(409).json({
        message: "THIS IS ALREADY EXIST EMAIL ADDRESSS...."
      });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const newUser = {
      id: Date.now(),
      name: cleanName,
      email: cleanEmail,
      passwordHash: passwordHash,
      role: "user"
    };

    users.push(newUser);
    saveUsers(users);

    return res.status(201).json({
      message: "REGISTRATION SUCCESSFULLY....",
      user: {
        name: newUser.name,
        email: newUser.email,
        role: newUser.role
      }
    });

  } catch (error) {
    console.error("Registration Error:", error);

    res.status(500).json({
      message: "REGISTRATION IS FAILED....please try again"
    });
  }
});


app.post("/api/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: "EMAIL AND PASSWORD IS MUST BE REQUIRED...."
      });
    }

    const cleanEmail = email.trim().toLowerCase();

    const users = readUsers();

    let account = null;

    if (cleanEmail === adminAccount.email.toLowerCase()) {
      account = adminAccount;
    } else {
      account = users.find(
        user => user.email.toLowerCase() === cleanEmail
      );
    }

    if (!account) {
      return res.status(401).json({
        message: "INVALID ACCOUNT......."
      });
    }

    const passwordMatch = await bcrypt.compare(
      password,
      account.passwordHash
    );

    if (!passwordMatch) {
      return res.status(401).json({
        message: "INVALID PASSWORD PLEASE ENTER A VALID ONE..."
      });
    }

    const token = jwt.sign(
      {
        email: account.email,
        role: account.role
      },
      SECRET_KEY,
      {
        expiresIn: "2h"
      }
    );

    res.json({
      message: "LOGIN SUCCESSFULLY....",
      token: token,
      name: account.name,
      email: account.email,
      role: account.role
    });

  } catch (error) {
    console.error("Login Error:", error);

    res.status(500).json({
      message: "Login failed. Please try again."
    });
  }
});


app.get("/api/hotels", protect, (req, res) => {
  const hotels = readHotels();

  const search = (req.query.search || "").toLowerCase();
  const minPrice = req.query.minPrice;
  const maxPrice = req.query.maxPrice;

  const limit = Math.max(1, Number(req.query.limit) || 5);
  const offset = Math.max(0, Number(req.query.offset) || 0);

  let filteredHotels = hotels.filter((hotel) => {
    const titleMatch = hotel.title.toLowerCase().includes(search);

    const minMatch =
      minPrice === undefined ||
      minPrice === "" ||
      hotel.price >= Number(minPrice);

    const maxMatch =
      maxPrice === undefined ||
      maxPrice === "" ||
      hotel.price <= Number(maxPrice);

    return titleMatch && minMatch && maxMatch;
  });

  const total = filteredHotels.length;

  filteredHotels = filteredHotels.slice(offset, offset + limit);

  res.json({
    hotels: filteredHotels,
    total: total,
    limit: limit,
    offset: offset
  });
});


app.get("/api/hotels/:id", protect, (req, res) => {
  const hotels = readHotels();

  const hotel = hotels.find(
    item => String(item.id) === req.params.id
  );

  if (!hotel) {
    return res.status(404).json({
      message: "HOTEL IS NOT FOUND...."
    });
  }

  res.json(hotel);
});


app.post(
  "/api/hotels",
  protect,
  adminOnly,
  upload.single("image"),
  (req, res) => {
    const {
      title,
      description,
      latitude,
      longitude,
      price
    } = req.body;

    if (
      !title ||
      !description ||
      latitude === undefined ||
      longitude === undefined ||
      price === undefined
    ) {
      if (req.file) {
        deleteImage(req.file.filename);
      }

      return res.status(400).json({
        message: "ALL DETAILS ARE MUST BE REQUIRED...."
      });
    }

    if (!req.file) {
      return res.status(400).json({
        message: "HOTEL IMAGE IS REQUIRED....."
      });
    }

    const hotel = {
      id: Date.now(),
      title: title,
      description: description,
      latitude: Number(latitude),
      longitude: Number(longitude),
      price: Number(price),
      image: "/uploads/" + req.file.filename
    };

    const hotels = readHotels();

    hotels.push(hotel);
    saveHotels(hotels);

    res.status(201).json({
      message: "HOTEL ADDED SUCCESSFULLY.....",
      hotel: hotel
    });
  }
);


app.put(
  "/api/hotels/:id",
  protect,
  adminOnly,
  upload.single("image"),
  (req, res) => {
    const hotels = readHotels();

    const index = hotels.findIndex(
      item => String(item.id) === req.params.id
    );

    if (index === -1) {
      if (req.file) {
        deleteImage(req.file.filename);
      }

      return res.status(404).json({
        message: "HOTEL IS NOT FOUND...."
      });
    }

    const oldHotel = hotels[index];

    const {
      title,
      description,
      latitude,
      longitude,
      price
    } = req.body;

    if (
      !title ||
      !description ||
      latitude === undefined ||
      longitude === undefined ||
      price === undefined
    ) {
      if (req.file) {
        deleteImage(req.file.filename);
      }

      return res.status(400).json({
        message: "All details are required"
      });
    }

    let image = oldHotel.image;

    if (req.file) {
      image = "/uploads/" + req.file.filename;
      deleteImage(oldHotel.image);
    }

    const updatedHotel = {
      id: oldHotel.id,
      title: title,
      description: description,
      latitude: Number(latitude),
      longitude: Number(longitude),
      price: Number(price),
      image: image
    };

    hotels[index] = updatedHotel;
    saveHotels(hotels);

    res.json({
      message: "HOTEL UPDATE SUCCESSFULLY....",
      hotel: updatedHotel
    });
  }
);


app.delete(
  "/api/hotels/:id",
  protect,
  adminOnly,
  (req, res) => {
    const hotels = readHotels();

    const hotel = hotels.find(
      item => String(item.id) === req.params.id
    );

    if (!hotel) {
      return res.status(404).json({
        message: "Hotel not found"
      });
    }

    const updatedHotels = hotels.filter(
      item => String(item.id) !== req.params.id
    );

    saveHotels(updatedHotels);
    deleteImage(hotel.image);

    res.json({
      message: "HOTEL DETAILS ARE DELETED...."
    });
  }
);

prepareAccounts()
  .then(() => {
    app.listen(PORT, () => {
      console.log("Hotel Management Backend is Running");
      console.log("Server URL: http://localhost:" + PORT);
    });
  })
  .catch((error) => {
    console.error("Backend startup failed:", error);
  });