const express = require("express");
const router = express.Router();
const multer = require("multer");
const User = require("../models/users");
const Job = require("../models/jobs");
const Notification = require("../models/notifications");
const fs = require("fs");
const nodemailer = require("nodemailer");
var uuid = require("node-uuid");
const { resolve } = require("path");

var transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: "nassiphivinqishe@gmail.com",
        pass: "07328911200",
    },
});

const levelDescriptionObj = {
    1: "Entry",
    2: "Junior",
    3: "Intermediate",
    4: "Senior",
};

var storage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, "./public");
    },
    filename: function(req, file, cb) {
        cb(null, file.fieldname + "_" + Date.now() + "_" + file.originalname);
    },
});

var upload = multer({
    storage: storage,
}).single("image");

// // Authentication and Authorization Middleware
var auth = function(req, res, next) {
    if (req.session && req.session.userId && req.session.isLoggedIn)
        return next();
    else return res.send("You are not authorized!");
};

// Type of user middleware
var isRecruiter = function(req, res, next) {
    if (req.session && req.session.isRecruiter) {
        return next();
    } else {
        return res.send("You are not authorized to add job");
    }
};

router.get("/add_job", isRecruiter, (req, res) => {
    res.render("add_job");
});

router.post("/add_job", isRecruiter, function(req, res) {
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

router.get("/user_information", (req, res) => {
    res.render("user_information");
});

router.get("/available_jobs", (req, res) => {
    res.render("available_jobs");
});

router.get("/motion_resume", auth, (req, res) => {
    Job.find({}, function(err, jobs) {
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

router.get("/my_profile", (req, res) => {
    var userId = req.session.userId
    
    User.findOne({_id:userId}, function(err, user) {
        if(err) {
            console.log("error")
            res.status(500).send("Error")
        } else {
            res.render("my_profile", {
                user:user,
                userId:userId
            }); 
        }
        
    })
});

router.post("/send_applicant_an_interview", (req, res) => {
    var applicantId = req.body.applicantId
    var interviewJobId = req.body.intervieJobId

    Job.updateOne({
            _id: interviewJobId,
            "applicants.user_id": applicantId
        }, {
            $set: {
                "applicants.$.application_progress": "got_interview"
            }
        },

        function(err, results) {
            if (err) {
                console.log(err)
                console.log("Error in updating applicants")
                res.status(500).send("Error updating")
            } else {
                console.log("Successfully updated!")
                // send notification
                var notificationObj = req.body.notificationObj

                const notification = new Notification({
                    notificationType: notificationObj.notificationType,
                    from: notificationObj.from,
                    to: notificationObj.to,
                    isRead: notificationObj.isRead,
                    jobId: notificationObj.jobId,
                })

                notification.save((err) => {
                    if (err) {
                        console.log(err);
                        res.status(500).send(err)
                    } else {
                        console.log("Success saved notification")
                        res.send("Updated successfully")
                    }
                });
            }
        })
})

router.get("/job_details", (req, res) => {
    //Get all users applied for specific job
    var jobId = req.query.jobId;

    Job.findById(jobId, function(err, jobDetails) {
        if (err) {
            console.log("Error", error);
            res.status(500).send("Error in viewing job details");
        } else {
            if(!jobDetails) {
                //such job doesn't exist
                res.send("Job no longer exist");
                // res.render("job_details");
            } else if(jobDetails.applicants && jobDetails.applicants.length > 0) {
                //jb with applicants
                new Promise((resolve, reject) => {
                    var count = 0
                    var jobApplantsNames = []
                    for (var a = 0; a < jobDetails.applicants.length; a++) {

                        User.findOne({
                            _id: jobDetails.applicants[a].user_id
                        }, function(err, data) {

                            if (err) {
                                jobApplantsNames.push("Error getting names")
                                count++
                                if (count == jobDetails.applicants.length) {
                                    resolve(jobApplantsNames)
                                }
                            } else {
                                count++
                                if (data) {
                                    jobApplantsNames.push(data.name)
                                    if (count == jobDetails.applicants.length) {
                                        resolve(jobApplantsNames)
                                    }

                                } else {
                                    jobApplantsNames.push("User not exist")
                                    if (count == jobDetails.applicants.length - 1) {
                                        resolve(jobApplantsNames)
                                    }
                                }
                            }
                        })
                    }

                }).then((jobApplantsNames) => {
                    res.render("job_details", {
                        jobDetails: jobDetails,
                        jobApplantsNames: jobApplantsNames,
                        levelDescriptionObj: levelDescriptionObj,
                        userId: req.session.userId,
                    });
                })
                .catch(error => {
                    console.log(error)
                    res.status(500).send(error)
                })
            } else {
                //job exist but no applicants
                res.render("job_details", {
                    jobDetails: jobDetails,
                    jobApplantsNames: [],
                    levelDescriptionObj: levelDescriptionObj,
                    userId: req.session.userId,
                });
            }
        }
    });
});

router.post("/apply_for_job", auth, (req, res) => {
    var jobId = req.body.jobId;
    var userId = req.session.userId;
    var applicant = {
        user_id: userId,
        date_applied: new Date()
    };

    Job.updateOne({
            _id: jobId
        }, {
            $push: {
                applicants: applicant
            }
        },
        function(err, result) {
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

    Job.updateOne({
        _id: jobId
    }, updatedJobDetails, function(err, results) {
        if (err) {
            console.log("Error", err);
            res.status(500).send("Error in updating!");
        } else {
            res.send("Sucess");
        }
    });
});

router.get("/view_profile", (req, res) => {
    var userId= req.query.userId

    User.findOne({_id: userId}, function(err, user) {
        if(err) {
            console.log("error")
            res.status(500).send("Error in finding user!")
        }
        else {
            console.log("Success")
            res.render("view_profile", {user:user})
        }
    })
})

router.post("/save_interview_questions", (req, res) => {
    // Update jobs save innterview questions for that specific job
    var interviewQuestions = req.body.interviewQuestions; //type array
    var jobId = req.body.jobId;

    Job.updateOne({
         _id: jobId
        }, {
            $set: {
                interview: {
                    questions: interviewQuestions,
                    date_added: new Date(),
                },
            },
        },

        function(err, results) {
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
        companyUrl: userData.companyUrl,
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

            transporter.sendMail(mailOptions, function(error, info) {
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

    User.findOne({
        email: email
    }, function(err, userResults) {
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

router.get("/verify_email", (req, res) => {
    var verificationToken = req.query.verify_token;

    User.findOne({
        verificationLink: verificationToken
    }, function(err, data) {
        if (err) {
            console.log(error);
            res.send("error on server", error);
        } else {
            if (!data) {
                res.send("The link has expired or doesn't exist");
            } else {
                User.updateOne({
                        _id: data._id,
                    }, {
                        user_email_verified: true
                    },
                    function(err, response) {
                        if (err) {
                            res.send("Error ");
                        } else {
                            User.updateOne({
                                    _id: data._id
                                }, {
                                    $unset: {
                                        verificationLink: 1
                                    },
                                },
                                function(err, data) {
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

router.post("/save_notification", (req, res) => {
    var notificationObj = req.body.notificationObj;

    const notification = new Notification({
        notificationType: notificationObj.notificationType,
        from: notificationObj.from,
        to: notificationObj.to,
        isRead: notificationObj.isRead,
        jobId: notificationObj.jobId,
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

router.post("/delete_notification", auth, (req, res) => {
    var notificationId = req.body.notificationId

    Notification.deleteOne({
        _id: notificationId
    }, function(err, data) {
        if (err) {
            console.log(err);
            res.send("error");
        } else {
            console.log("Successssfully deleted notification")
            // io.emit("sent_interview", { userId: "some userId", jobId: "sdee" });
            res.send("Notitfication deleted")
        }
    });
})

router.post("/update_read_notification", auth, (req, res) => {
    var jobId = req.body.jobId
    Notification.updateOne({
        jobId: jobId
    }, {
        isRead: true
    }, function(err, data) {
        if (err) {
            console.log(err);
            res.send("error");
        } else {
            console.log("Success")
            res.send('success')
        }
    })
})

router.get("/messages", auth, (req, res)=> {
    res.send("Still working on this router. Please check back again soon :)")
})

router.get("/view_interview_answers", (req, res) => {
    var {jobId, userId} = req.query

    console.log(jobId, userId)

    Job.findOne({_id: jobId}, function(err, data) {
        if(err) {
            console.log(err)
            res.send("Error on this route")
        } else {

            if(data) {
                var applicants = data.applicants
                var applicant = applicants.find((applicant)=> {
                    return applicant.user_id == userId
                })

                res.render("interview_answers", {
                    applicant: applicant,
                    jobId: jobId
                })

            } else {
                res.send("Error: this job no longer exist!")
            }
        }
    })
})

router.post("/submit_interview", (req, res) => {
    var answers = req.body.answers
    var jobId = req.body.jobId
    var userId = req.session.userId

    new Promise((resolve, reject) => { 
        for(var a = 0; a< answers.length; a++ ){
            if(answers[a].isVideo == "true") {
                var base64Data = answers[0].answer.replace(/^data:(.*?);base64,/, "");
                base64Data= base64Data.replace(/ /g, '+');
                var filename= `./interview_video_answers/${new Date().getTime()}.mp4`

                fs.writeFile(`${filename}`, base64Data, 'base64', function(err, success) {
                    console.log(err);
                    
                });
                // change file naming from base64 to filename
                answers[a].answer = `${filename}`
            } 
            resolve()
        }
    }).then(() => {

   
   Job.updateOne({_id: jobId,
        "applicants.user_id": userId}, {
        $set:{
            "applicants.$.interview_answers": answers,
            "applicants.$.application_progress": "answered_interview",
            }
        },
        function (err, data) {
            if(err){
                console.log(err)
                res.status(500).send(err);
            }
            else {
                console.log(data)
                console.log("Successfully submited answered interview")
                res.send("Submited successfully")
            }
        }
    )
    })

})

router.post("/save_motionresume", (req, res) => {
    var userId = req.session.userId
    var motionresume = req.body.motionresume
    var base64Data =motionresume.replace(/^data:(.*?);base64,/, "");
    base64Data= base64Data.replace(/ /g, '+');
    var filename= `/motionresume/${new Date().getTime()}.mp4`

    fs.writeFile(`./public${filename}`, base64Data, 'base64', function(err, success) {
        if(err){
            console.log(err);
        } 
        else {
            console.log(success)
            filename = `${filename}`
        }
        
    });

   
   User.updateOne({_id: userId},{$set:{"motionresume":filename}} ,function (err, data) {
        if(err){
                console.log(err)
                res.status(500).send(err);
            }
            else {
                console.log("Successfully submited motionresume")
                res.send("Submited successfully")
            }
        }
    )

})

router.get("/take_video_motionresume", (req, res) => {
    res.render("take_video_motionresume")
})

router.get("/take_interview", (req, res) => {
    var jobId = req.query.jobId;

    Job.findById({
        _id: jobId
    }, function(err, job) {
        if (err) {
            console.log(err)
            res.status(500).send(err);
        } else {          
            res.render("take_interview", {
                job: job,
                jobId:jobId
            })
        }
    })

})

router.get("/notifications", (req, res) => {
    Notification.find({
        to: req.session.userId
    }, function(err, notifications) {
        if (err) {
            res.status(500).send(err);
        } else {
            if (notifications.length == 0) {
                res.render("notifications", {
                    notifications: [],
                    posterNames: [],
                })
            } else {

                new Promise((resolve, reject) => {
                    var count = 0
                    var posterNames = []


                    for (var a = 0; a < notifications.length; a++) {

                        User.findOne({
                            _id: notifications[a].from
                        }, function(err, data) {
                            if (err) {
                                posterNames.push("Error getting names")
                                count++
                                if (count == notifications.lengt) {
                                    resolve(posterNames)
                                }
                            } else {
                                count++
                                if (data) {
                                    posterNames.push(data.name)
                                    if (count == notifications.length) {
                                        resolve(posterNames)
                                    }
                                } else {
                                    posterNames.push("User no longer exist")
                                    if (count == notifications.length) {
                                        resolve(posterNames)
                                    }
                                }
                            }
                        })
                    }
                }).then((posterNames) => {
                    res.render("notifications", {
                        notifications: notifications,
                        posterNames: posterNames,
                    })
                })
            }
        }
    })
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

            transporter.sendMail(mailOptions, function(error, info) {
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