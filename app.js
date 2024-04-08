const express = require("express");
const mongoose = require("mongoose");
const path = require("path");
const session = require("express-session");
// const { type } = require('os');
// const { exit } = require('process');
// const sha256 = require('sha256');
let connection_string =
  "mongodb+srv://vinothg0618:vinoth112003@cluster0.fiy26nf.mongodb.net";
// let connection_string = "mongodb://127.0.0.1:27017";

mongoose.connect(`${connection_string}/quiz_data`);
const db = mongoose.connection;

db.once("open", () => {
  console.log("Connected to MongoDB");
});
db.on("error", (err) => {
  console.log(err);
});

const questionSchema = new mongoose.Schema({
  Question: String,
  Answer: String,
});

const imageSchema = new mongoose.Schema({
  Image_qn: String,
  Image_url: String,
  Image_name: String,
});

// const Question = mongoose.model('Question', questionSchema); // Define Question model
// const QuestionModel = mongoose.model('QuestionModel', questionSchema); // Define Question model
// const Question = mongoose.model('Question', questionSchema, "question");
const Image = mongoose.model("Image", imageSchema, "image");

const teamSchema = new mongoose.Schema({
  team_name: String,
  round1: [
    {
      question_id: mongoose.Schema.Types.ObjectId,
      Question: String,
      A: String,
      B: String,
      C: String,
      D: String,
      Answer: String,
    },
  ],
  round2: [
    {
      question_id: mongoose.Schema.Types.ObjectId,
      Question: String,
      A: String,
      B: String,
      C: String,
      D: String,
      Answer: String,
    },
  ],
  round3: [
    {
      question_id: mongoose.Schema.Types.ObjectId,
      Question: String,
      A: String,
      B: String,
      C: String,
      D: String,
      Answer: String,
    },
  ],
  round1_image: {
    Image_qn: String,
    image_url: String,
    Image_name: String,
  },
  round2_image: {
    Image_qn: String,
    image_url: String,
    Image_name: String,
  },
  round3_image: {
    Image_qn: String,
    image_url: String,
    Image_name: String,
  },
  AnsweredQuestions: {
    type: [Boolean],
    default: [
      false,
      false,
      false,
      false,
      false,
      false,
      false,
      false,
      false,
      false,
      false,
      false,
      false,
      false,
      false,
      false,
    ],
  },
  images_found: { type: Number, default: 0 },
  attempts: { type: Number, default: 0 },
  score: { type: Number, default: 0 },
  currentRound: { type: String, default: "round1" },
  timeLapsed: { type: Number, default: 0 },
  round1_time: { type: String, default: "00:00" }, // Set round1_time to today at 9:00 AM
  round2_time: { type: String, default: "00:00" }, // Set round2_time to today at 9:00 AM
  round3_time: { type: String, default: "00:00" },
  gameOver: { type: Boolean, default: false },
  login_punches: [{ type: String }],
  logout_punches: [{ type: String }],
  malpractice: [{ type: String }],
  gameOverTime: { type: String },
});

const Team = mongoose.model("Team", teamSchema);

const adminSchema = new mongoose.Schema({
  name: String,
  password: String,
  isActive: Boolean,
  loginTime: String,
  logoutTime: String,
});

const Admin = mongoose.model("Admin", adminSchema);

// const newAdmin = new Admin({
//     name
// })

const app = express();

app.set("view engine", "ejs"); // Set EJS as the view engine
app.set("views", path.join(__dirname, "public"));

app.use(
  session({
    secret: "0987654321wertyuiosdfghjklzxcvbnm", // Change this to a strong secret key
    resave: false,
    saveUninitialized: true,
  })
);

app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));
app.use(express.urlencoded({ extended: true }));

const currentTime = new Date();
const options = { timeZone: "Asia/Kolkata", hour12: false };
const CurrentformattedTime = currentTime
  .toLocaleString("en-US", options)
  .split(", ")[1];

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "login.html"));
});

app.get("/login", async (req, res) => {
  const team_name = req.query.team_name.toLowerCase();
  if (team_name == undefined || team_name == "" || team_name == null) {
    res.sendFile(path.join(__dirname, "public", "login.html"));
  } else {
    try {
      // Check if the team name already exists in the database
      const existingTeam = await Team.findOne({ team_name });

      const currentTime = new Date();
      const options = { timeZone: "Asia/Kolkata", hour12: false };
      const formattedTime = currentTime
        .toLocaleString("en-US", options)
        .split(", ")[1]; // Extract time part

      if (existingTeam) {
        req.session.teamId = existingTeam._id;
        existingTeam.login_punches.push(formattedTime);
        await existingTeam.save();
        // If the team exists, add the team ID to session and redirect to dashboard
        if (existingTeam.gameOver == true) {
          console.log("Game Over Already");
          return res.redirect("/profile");
        }
        req.session.teamId = existingTeam._id;
        console.log("Team already exists");
        return res.redirect("/dashboard");
      }

      // Generate random questions and images for each round
      const numberOfRandomQuestions = 16;
      const numberOfRandomImages = 3;

      const randomRound1Questions = await fetchRandomQuestions(
        "round1_questions",
        numberOfRandomQuestions
      );
      const randomRound2Questions = await fetchRandomQuestions(
        "round2_questions",
        numberOfRandomQuestions
      );
      const randomRound3Questions = await fetchRandomQuestions(
        "round3_questions",
        numberOfRandomQuestions
      );
      const randomImages = await Image.aggregate([
        { $sample: { size: numberOfRandomImages } },
      ]);

      // Create a new team with random questions and images
      const newTeam = new Team({
        team_name: team_name.toLowerCase(),
        round1: randomRound1Questions.map((question) => ({
          question_id: question._id,
          Question: question.question,
          A: question.A,
          B: question.B,
          C: question.C,
          D: question.D,
          Answer: question.answer,
        })),
        round2: randomRound2Questions.map((question) => ({
          question_id: question._id,
          Question: question.question,
          A: question.A,
          B: question.B,
          C: question.C,
          D: question.D,
          Answer: question.answer,
        })),
        round3: randomRound3Questions.map((question) => ({
          question_id: question._id,
          Question: question.question,
          A: question.A,
          B: question.B,
          C: question.C,
          D: question.D,
          Answer: question.answer,
        })),
        round1_image: {
          Image_qn: randomImages[0].Image_qn,
          image_url: randomImages[0].Image_Url,
          Image_name: randomImages[0].Image_name,
        }, // Assuming randomImages is an array of 3 images
        round2_image: {
          Image_qn: randomImages[1].Image_qn,
          image_url: randomImages[1].Image_Url,
          Image_name: randomImages[1].Image_name,
        },
        round3_image: {
          Image_qn: randomImages[2].Image_qn,
          image_url: randomImages[2].Image_Url,
          Image_name: randomImages[2].Image_name,
        },
        login_punches: [formattedTime],
      });

      const savedTeam = await newTeam.save();
      req.session.teamId = savedTeam._id;
      console.log("Team ID:", savedTeam._id);
      res.redirect("/dashboard");
    } catch (error) {
      console.error("Error occurred:", error);
      res.status(500).send("Internal Server Error");
    }
  }
});

async function fetchRandomQuestions(round, numberOfRandomQuestions) {
  const QuestionModel = mongoose.model(`${round}`, questionSchema);
  const randomQuestions = await QuestionModel.aggregate([
    { $sample: { size: numberOfRandomQuestions } },
  ]);
  return randomQuestions;
}

app.get("/dashboard", async (req, res) => {
  // Access teamId from session
  const teamId = req.session.teamId;

  try {
    // Fetch team details from the database using teamId
    const team = await Team.findById(teamId);

    if (team) {
      if (team.gameOver != true) {
        res.render("dashboard", { team: team });
      } else {
        res.redirect("/profile");
      }
    } else {
      res.redirect("/");
    }
    // Now you can use team details as needed
  } catch (error) {
    console.error("Error fetching team details:", error);
    res.status(500).send("Internal Server Error");
  }
});

app.get("/question/:round/:index", async (req, res) => {
  const { round, index } = req.params;
  const teamId = req.session.teamId;
  try {
    const team = await Team.findById(teamId);
    let question;
    if (round == "round1") {
      question = team.round1[index];
    } else if (round == "round2") {
      question = team.round2[index];
    } else {
      question = team.round3[index];
    }

    if (team) {
      res.json({ success: true, question: question });
    } else {
      res.status(404).json({ success: false, message: "Question not found" });
    }
  } catch (error) {
    console.error("Error fetching question:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
});

app.get("/details/:team_id", async (req, res) => {
  const team_id = req.params.team_id; // Corrected from req.params.index to req.params.team_id
  try {
    const team = await Team.findById(team_id);
    if (team) {
      res.status(200).json({ success: true, team: team }); // Corrected from res.sendStatus(200).json(...)
    } else {
      res.status(404).json({ success: false, message: "Team not found" });
    }
  } catch (error) {
    console.error("Error fetching team details:", error); // Corrected from "Error fetching question"
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
});

// Endpoint to update score
app.put("/updateScore", async (req, res) => {
  const { teamId, increment } = req.body;
  try {
    // Assuming you have a Team model defined
    const team = await Team.findById(teamId);
    if (!team) {
      return res
        .status(404)
        .json({ success: false, message: "Team not found" });
    }
    // Update the score
    team.score += increment;
    await team.save();
    res.sendStatus(200); // Send success response
  } catch (error) {
    console.error("Error updating score:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
});

// Endpoint to update attempts
app.put("/updateAttempt", async (req, res) => {
  const { teamId } = req.body;
  try {
    // Assuming you have a Team model defined
    const team = await Team.findById(teamId);
    if (!team) {
      return res
        .status(404)
        .json({ success: false, message: "Team not found" });
    }
    // Update the attempts
    team.attempts++;
    await team.save();
    res.sendStatus(200); // Send success response
  } catch (error) {
    console.error("Error updating attempts:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
});

// Endpoint to update attempts
app.put("/updateImageFound", async (req, res) => {
  const teamId = req.body.teamId;
  const time = req.body.time;
  console.log(time);

  try {
    // Assuming you have a Team model defined
    const team = await Team.findById(teamId);
    if (!team) {
      return res
        .status(404)
        .json({ success: false, message: "Team not found" });
    }
    // Update the attempts
    team.images_found++;
    let currentRound = team.currentRound;
    if (currentRound == "round1") {
      team.currentRound = "round2";
      team.round1_time = time;
    } else if (currentRound == "round2") {
      team.currentRound = "round3";
      team.round2_time = time;
    } else {
      // game over
      team.round3_time = time;
      team.gameOver = true;
      team.gameOverTime = CurrentformattedTime;
      await team.save();

      // Send a JSON response indicating redirection
      return res.status(200).json({ redirectTo: "/profile" });
    }

    team.AnsweredQuestions = [
      false,
      false,
      false,
      false,
      false,
      false,
      false,
      false,
      false,
      false,
      false,
      false,
      false,
      false,
      false,
      false,
    ];
    await team.save();
    res.status(200).json({ success: true, message: "Update successful" });
  } catch (error) {
    console.error("Error updating Image found:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
});

// Endpoint to update attempts
app.put("/timeLapse", async (req, res) => {
  const { teamId } = req.body;
  try {
    // Assuming you have a Team model defined
    const team = await Team.findById(teamId);
    if (!team) {
      return res
        .status(404)
        .json({ success: false, message: "Team not found" });
    }
    // Update the attempts
    let currentRound = team.currentRound;
    if (currentRound == "round1") {
      team.currentRound = "round2";
      team.round1_time = "00:00";
    } else if (currentRound == "round2") {
      team.currentRound = "round3";
      team.round2_time = "00:00";
    } else {
      // game over
      team.round3_time = "00:00";
      team.gameOver = true;
      team.gameOverTime = CurrentformattedTime;
      await team.save();
      // Send a JSON response indicating redirection
      return res.status(200).json({ redirectTo: "/profile" });
    }

    team.AnsweredQuestions = [
      false,
      false,
      false,
      false,
      false,
      false,
      false,
      false,
      false,
      false,
      false,
      false,
      false,
      false,
      false,
      false,
    ];
    await team.save();
    res
      .status(200)
      .json({ success: true, message: "Time lapse updated successful" });
  } catch (error) {
    console.error("Error updating attempts:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
});

// Backend route to handle updating answered questions
app.put(
  "/updateAnsweredQuestions/:userId/:questionIndex/:boolValue",
  async (req, res) => {
    const { userId, questionIndex, boolValue } = req.params;
    try {
      const user = await Team.findById(userId);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      // Update AnsweredQuestions array
      user.AnsweredQuestions[questionIndex] = boolValue;
      // Save updated user data back to the database
      const updatedUser = await user.save();
      res.json(updatedUser);
    } catch (error) {
      console.error("Error updating user:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  }
);

// Backend route to handle updating Malpractices
app.put("/updateMalpractice/:userId/:type", async (req, res) => {
  const { userId, type } = req.params;
  console.log(userId);
  console.log(type);
  try {
    const user = await Team.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    // Update AnsweredQuestions array
    user.malpractice.push(type);
    user.gameOver = true;
    user.gameOverTime = CurrentformattedTime;
    // Save updated user data back to the database
    await user.save();
    res.status(200).json({ success: true, redirectTo: "profile" });
  } catch (error) {
    console.error("Error updating malpractice user:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Backend route to handle Skip round
app.put("/skipround/:userId/:timeing", async (req, res) => {
  const { userId, timeing } = req.params;
  console.log(userId);
  console.log(timeing);
  try {
    const user = await Team.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    // Update AnsweredQuestions array
    if (user.currentRound == "round1") {
      user.currentRound = "round2";
      user.round1_time = timeing;
    } else if (user.currentRound == "round2") {
      user.currentRound = "round3";
      user.round2_time = timeing;
    } else if (user.currentRound == "round3") {
      user.round3_time = timeing;
      user.gameOver = true;
      user.gameOverTime = CurrentformattedTime;
      // Save updated user data back to the database
    }

    await user.save();
    res
      .status(200)
      .json({ success: true, message: "round skipped successfully" });
  } catch (error) {
    console.error("Error updating malpractice user:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.get("/profile", async (req, res) => {
  // Destroy the session
  const teamId = req.session.teamId;
  const team = await Team.findById(teamId);
  if (teamId) {
    console.log("profile " + teamId);
    console.log("Game Over " + team.gameOver);
    if (teamId && team.gameOver == true) {
      res.render("profile", { team: team });
    } else {
      res.redirect("/");
    }
  } else {
    res.redirect("/");
  }
});

app.get("/admin", async (req, res) => {
  try {
    let adminId = req.session.adminId;

    const admin = await Admin.findById(adminId);

    if (admin) {
      // Fetch all teams from the database and sort by gameOverTime
      const teams = await Team.find().sort({ gameOverTime: 1 });
      // Fetch all admins ordered by isActive field
      const admins = await Admin.find().sort({ isActive: -1 });
      res.render("admin", { teams: teams, admins: admins });
    } else {
      res.sendFile(path.join(__dirname, "public", "adminlogin.html"));
    }
  } catch (error) {
    console.error("Error fetching teams:", error);
    res.status(500).send("Internal Server Error");
  }
});

app.get("/teamData", async (req, res) => {
  try {
    let adminId = req.session.adminId;

    const admin = await Admin.findById(adminId);
    if (admin) {
      // Fetch all teams from the database and sort by gameOverTime
      const teams = await Team.find().sort({ gameOverTime: -1 });
      // Fetch all admins ordered by isActive field
      const admins = await Admin.find().sort({ isActive: -1 });
      res.send({ teams: teams, admins: admins, currentAdmin: admin.name });
    } else {
      res.sendFile(path.join(__dirname, "public", "adminlogin.html"));
    }
  } catch (error) {
    console.error("Error fetching teams:", error);
    res.status(500).send("Internal Server Error");
  }
});

// Update logout route to record logout time
app.get("/logout", async (req, res) => {
  // Destroy the session
  const teamId = req.session.teamId;
  req.session.destroy(async (err) => {
    if (err) {
      console.error("Error destroying session:", err);
      res.status(500).send("Internal Server Error");
    } else {
      try {
        // Record logout time
        const team = await Team.findById(teamId);
        if (team) {
          const currentTime = new Date();
          const options = { timeZone: "Asia/Kolkata", hour12: false };
          const formattedTime = currentTime
            .toLocaleString("en-US", options)
            .split(", ")[1]; // Extract time part
          team.logout_punches.push(formattedTime);

          // team.logout_punches.push(new Date());
          await team.save();
        }
        // Redirect the user to the login page or any other desired page
        res.redirect("/");
      } catch (error) {
        console.error("Error occurred:", error);
        res.status(500).send("Internal Server Error");
      }
    }
  });
});

app.post("/adminlogin", async (req, res) => {
  const name = req.body.name.toLowerCase();
  const password = req.body.password.toLowerCase();
  // const admin = await Admin.findOne({ name });
  // console.log(admin);
  console.log(name, password);
  if (name == undefined || name == "" || name == null) {
    res.sendFile(path.join(__dirname, "public", "adminlogin.html"));
  } else {
    try {
      // Check if the team name already exists in the database
      const admin = await Admin.findOne({ name });
      console.log(admin);
      console.log(admin.password);
      console.log(password);
      if (admin && admin.password.toLowerCase() == password) {
        req.session.adminId = admin._id;
        const currentTime = new Date();
        const options = { timeZone: "Asia/Kolkata", hour12: false };
        const formattedTime = currentTime
          .toLocaleString("en-US", options)
          .split(", ")[1];
        admin.loginTime = formattedTime;
        admin.isActive = true;
        await admin.save();
        res.redirect("/admin");
      } else {
        res.sendFile(path.join(__dirname, "public", "adminlogin.html"));
      }
    } catch (error) {
      console.error("Error occurred:", error);
      res.status(500).send("Internal Server Error");
    }
  }
});

// Update logout route to record logout time
app.get("/adminlogout", async (req, res) => {
  // Destroy the session
  const admin_name = req.session.adminId;
  req.session.destroy(async (err) => {
    if (err) {
      console.error("Error destroying session:", err);
      res.status(500).send("Internal Server Error");
    } else {
      try {
        // Record logout time
        const admin = await Admin.findById(admin_name);
        if (admin) {
          const currentTime = new Date();
          const options = { timeZone: "Asia/Kolkata", hour12: false };
          const formattedTime = currentTime
            .toLocaleString("en-US", options)
            .split(", ")[1]; // Extract time part
          admin.logoutTime = formattedTime;
          admin.isActive = false;
          // team.logout_punches.push(new Date());
          await admin.save();
        }
        // Redirect the user to the login page or any other desired page
        res.sendFile(path.join(__dirname, "public", "adminlogin.html"));
      } catch (error) {
        console.error("Error occurred:", error);
        res.status(500).send("Internal Server Error");
      }
    }
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server is listening on port ${PORT}`);
});
