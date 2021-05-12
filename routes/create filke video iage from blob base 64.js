// var videoBlobs = jobSeekerDataObject.userDataObject.video;
// var base64Data = videoBlobs.data.replace(/^data:video\/mp4;base64,/, "");

// var video_name = Date.now() + "_resume_thing.mp4";

// require("fs").writeFile(
//   "public/feeds_video/" + video_name, //path
//   base64Data, //data to build video from
//   "base64", // tellling data type
//   function () {
//     //save details to db
//   }
// );
if (email && password === userResults) {
  console.log("Login success");
}
