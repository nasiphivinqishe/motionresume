const express = require("express");
const router = express.Router();
const multer = require("multer");
const User = require("../models/users");
const Job = require("../models/jobs");
const Notification = require("../models/notifications");
const fs = require("fs");
const nodemailer = require("nodemailer");
var uuid = require("node-uuid");

const levelDescriptionObj = {
  1: "Entry",
  2: "Junior",
  3: "Intermediate",
  4: "Senior",
};

var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./public");
  },
  filename: function (req, file, cb) {
    cb(null, file.fieldname + "_" + Date.now() + "_" + file.originalname);
  },
});

var upload = multer({
  storage: storage,
}).single("image");

// // Authentication and Authorization Middleware
var auth = function (req, res, next) {
  if (req.session && req.session.userId && req.session.isLoggedIn)
    return next();
  else return res.send("You are not authorized!");
};

// Type of user middleware
var isRecruiter = function (req, res, next) {
  if (req.session && req.session.isRecruiter) {
    return next();
  } else {
    return res.send("You are not authorized to add job");
  }
};

router.get("/add_job", isRecruiter, (req, res) => {
  res.render("add_job");
});

router.post("/add_job", isRecruiter, function (req, res) {
  var jobDataObject = req.body.addJobDataObject;
  console.log(jobDataObject);

  var job = new Job({
    poster: req.session.userId,
    userId: req.session.userId,
    requirements: jobDataObject.requirements,
    level: jobDataObject.level,
    field: jobDataObject.field,
    skills: jobDataObject.skills,
    start_date: jobDataObject.start_date,
    application_closing_date: jobDataObject.application_closing_date,
    functions: jobDataObject.functions,
  });
  console.log(job);

  job.save((err) => {
    if (err) {
      console.log(err);
      res.send("error");
    } else {
      console.log("success");
      res.send("success");
    }
  });
});

router.get("/", (req, res) => {
  if (req.session && req.session.userId && req.session.isLoggedIn)
    res.redirect("motion_resume");
  else res.render("index");
});

router.get("/registration", (req, res) => {
  res.render("registration");
});

router.get("/my_profile", (req, res) => {
  res.render("my_profile");
});

router.get("/user_information", (req, res) => {
  res.render("user_information");
});

router.get("/available_jobs", (req, res) => {
  res.render("available_jobs");
});

router.get("/motion_resume", auth, (req, res) => {
  Job.find({}, function (err, jobs) {
    if (err) {
      res.send(err);
    } else {
      res.render("motion_resume", {
        jobs: jobs,
        levelDescriptionObj: levelDescriptionObj,
        userId: req.session.userId,
      });
    }
  });
});

router.post("/send_applicant_an_interview", (req, res) => {
  var applicantId= req.body.applicantId
  var interviewJobId = req.body.intervieJobId 

  Job.updateOne({_id : interviewJobId, "applicants.user_id" : applicantId}, 
    {$set : {"applicants.$.application_progress" :"got_interview" }},
              
    function(err, results) {
      if(err){
        console.log(err)
        console.log("Error in updating applicants")
        res.status(500).send("Error updating")
      }
      else
      {
        console.log(results)
        console.log("Successfully updated!")
        // send notification
        res.send("Updated successfully")
        
      }
  })
})

router.get("/job_details", (req, res) => {
  //Get all users applied for specific job
  var jobId = req.query.jobId;


  Job.findById(jobId, function (err, jobDetails) {
    if (err) {
      console.log("Error", error);
      res.send("Error in viewing job details");
    } else {
        
       new Promise((resolve, reject) => {
      var count = 0
      var jobApplantsNames = []
        for(var a = 0; a < jobDetails.applicants.length; a++){

          User.findOne({_id: jobDetails.applicants[a].user_id}, function(err, data) {
            
            if(err) {
              jobApplantsNames.push("Error getting names")
              count++
              if(count == jobDetails.applicants.length) {
                resolve(jobApplantsNames)
              }
            } else {
              count++
              if(data)
              { 
                jobApplantsNames.push(data.name)
                if(count == jobDetails.applicants.length) {
                  resolve(jobApplantsNames)
                }
               
              } else {
                jobApplantsNames.push("User not exist")
                if(count == jobDetails.applicants.length -1) {
                 resolve(jobApplantsNames)
                }
              }
            }
          })
        }
      }).then((jobApplantsNames) => {
        res.render("job_details", {
          jobDetails: jobDetails,
          jobApplantsNames:jobApplantsNames,
          levelDescriptionObj: levelDescriptionObj,
          userId: req.session.userId,
        });
      })
      .catch(error=> {
        console.log(error)
      })
    }
  });
});

router.post("/apply_for_job", auth, (req, res) => {
  var jobId = req.body.jobId;
  var userId = req.session.userId;
  var applicant = { user_id: userId, date_applied: new Date() };

  Job.updateOne(
    { _id: jobId },
    { $push: { applicants: applicant } },
    function (err, result) {
      if (err) {
        console.log(err);
        res.send("Error in saving questions");
      } else {
        console.log("success");
        res.send("success");
      }
    }
  );
});

router.post("/update_job_details", (req, res) => {
  var updatedJobDetails = req.body.updatedJobDetails;
  var jobId = updatedJobDetails.jobId;

  Job.updateOne({ _id: jobId }, updatedJobDetails, function (err, results) {
    if (err) {
      console.log("Error", err);
      res.status(500).send("Error in updating!");
    } else {
      res.send("Sucess");
    }
  });
});

router.post("/save_interview_questions", (req, res) => {
  // Update jobs save innterview questions for that specific job
  var interviewQuestions = req.body.interviewQuestions; //type array
  var jobId = req.body.jobId;

  Job.updateOne(
    { _id: jobId },
    {
      $set: {
        interview: {
          questions: interviewQuestions,
          date_added: new Date(),
        },
      },
    },

    function (err, results) {
      if (err) {
        console.log(err);
        res.send("error");
      } else {
        console.log("success");

        res.send("success");
      }
    }
  );
});

router.get("/motion_resume", auth, (req, res) => {
  res.render("motion_resume");
});

router.get("/registration_next_recruiter", (req, res) => {
  res.render("registration_recruiter");
});

router.get("/registration_next_jobseeker", (req, res) => {
  res.render("registration_jobseeker");
});

router.post("/register_recruiter", (req, res) => {
  var userData = req.body.userDataObject;
  var verificationToken = uuid.v4();


  const user = new User({
    verificationLink: verificationToken,
    name: userData.name,
    email: userData.companyEmail,
    phone: userData.phone,
    password: userData.password,
    typeOfUser: userData.typeOfUser,
    companyName: userData.companyName,
    companyUrl: req.body.userDataObject.companyUrl,
  });
console.log(userData)
  user.save((err) => {
    if (err) {
      console.log(err);
      res.send("error");
    } else {
      
      console.log("success");
      var mailOptions = {
        from: "nassiphivinqishe@gmail.com",
        to: "nasiphivinqishe@gmail.com",
        subject: "Verify Email.",
        html: `
        <h1>Welcome</h1>
        <p>This was sent to verify email</p>
        <p>Click here to verify <a href="http://localhost:5000/verify_email?verify_token=${verificationToken}">Yes</a></p>
        <h4>Thank you,</h4>
        <h4><b>Motion Resume Team</b></h4>
    `,
      };
      
      transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
          res.send(
            "Error in sending email"
          );
        } else {
          res.send("Successfully registered, check your email for verification");
        }
      });
    }
  });
});

// Finding user by email + Login endpoint
router.post("/login", (req, res) => {
  var email = req.body.email;
  var password = req.body.password;

  User.findOne({ email: email }, function (err, userResults) {
    if (err) {
      console.log("Error", err);
      res.send("Error in finding email.");
    } else {
      if (userResults != null) {
        if (password == userResults.password) {

          if (userResults.user_email_verified) {
            req.session.isLoggedIn = true;
            req.session.userId = userResults._id;


            if (userResults.typeOfUser == "recruiter") {
              req.session.isRecruiter = true;  
              res.redirect("motion_resume");
            } else {
              req.session.isRecruiter = false;
              res.redirect("motion_resume");
            }
  
          } else { 
            res.send("Please verify your email");
          }          

        } else {
          res.send("Please enter a valid password");
        }
      } else {
        res.send("The user doesn't exist, please register to continue.");
      }
    }
  });
});

router.get("/logout", (req, res) => {
  req.session.destroy();
  res.redirect("/");
});

const generateRandomString = () => {
  return uuid.v1();
};

var transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "nassiphivinqishe@gmail.com",
    pass: "07328911200",
  },
});

router.get("/verify_email", (req, res) => {
  var verificationToken = req.query.verify_token;

  User.findOne({ verificationLink: verificationToken }, function (err, data) {
    if (err) {
      console.log(error);
      res.send("error on server", error);
    } else {
      if (!data) {
        res.send("The link has expired or doesn't exist");
      } else {
        User.updateOne(
          {
            _id: data._id,
          },
          { user_email_verified: true },
          function (err, response) {
            if (err) {
              res.send("Error ");
            } else {
              User.updateOne(
                { _id: data._id },
                {
                  $unset: { verificationLink: 1 },
                },
                function (err, data) {
                  if (err) {
                    console.log(error);
                    res.send("error on server", error);
                  } else {
                    res.send(JSON.stringify("success ", data));
                  }
                }
              );
            }
          }
        );
      }
    }
  });
});

router.post("/save_notification", (req, res) =>{
  var notificationObj = req.body.notificationObj;

  const notification = new Notification({
    notificationType :notificationObj.notificationType,
    from : notificationObj.from,
    to : notificationObj.to,
    isRead : notificationObj.isRead,
    jobId : notificationObj.jobId,
  })

  notification.save((err) => {
    if (err) {
      console.log(err);
      res.send("error");
    } else {
      console.log("Success")
      res.send("Notification saved")
    }
  });
});

router.post("/delete_notification", auth,(req, res) => {
  var jobId=  req.body.jobId

  Notification.deleteOne({jobId : jobId}, function (err, data) {
    if (err) {
      console.log(err);
      res.send("error");
    } else {
      console.log("Success")
      // io.emit("sent_interview", { userId: "some userId", jobId: "sdee" });
      res.send("deleted")
    }
  });
})

router.post("/update_read_notification",auth, (req, res) => {
 var jobId = req.body.jobId
  Notification.updateOne({jobId : jobId} ,{isRead : true}, function(err, data){
    if (err) {
      console.log(err);
      res.send("error");
    } else {
      console.log("Success")
      res.send('success')
    }
  })
})

router.get("/read_all_notifications", auth, (req, res) => {
  Notification.find({}, function (err, notifications) {
    if (err) {
      res.send(err);
    } else {

      // res.render("notifications", {
      //   notifications : notifications
    
      // });
      res.send({notifications : notifications})
          
      
       
    }
  });
})

router.post("/register_jobseeker", (req, res) => {
  var userData = req.body.userDataObject;

  var verificationToken = uuid.v4();

  const user = new User({
    verificationLink: verificationToken,
    name: userData.name,
    email: userData.email,
    phone: userData.phone,
    password: userData.password,
    universityName: userData.universityName,
    qualification: userData.qualification,
    typeOfUser: userData.typeOfUser,
    degree: userData.degree,
    yearObtained: userData.yearObtained,
    title: userData.title,
    employmentType: userData.employmentType,
    company: userData.company,
    location: userData.location,
    yearsWorked: userData.yearsWorked,
    skills: userData.skills,
  });
  console.log(userData)

  user.save((err) => {
    if (err) {
      console.log(err);
      res.send("error in saving user");
    } else {
console.log("success")
      //send email with verifac
      var mailOptions = {
        from: "nassiphivinqishe@gmail.com",
        to: userData.email,
        subject: "Verify Email.",
        html: `
        <h1>Welcome</h1>
        <p>This was sent to verify email</p>
        <p>Click here to verify <a href="http://localhost:5000/verify_email?verify_token=${verificationToken}">Yes</a></p>
        <h4>Thank you,</h4>
        <h4><b>Motion Resume Team</b></h4>
    `,
      };

      transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
          console.log(error);
          res.send(
            "Error in sending email"
          );
        } else {
          res.send("Successfully registered, check your email for verification");
        }
      });
    }
  });
});

module.exports = router;
