const AWS = require('aws-sdk');

AWS.config.update(
    {
        region: "us-west-2",
        accessKeyId: "AKIAURJ45DN5DGYTJD5T",
        secretAccessKey: "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"
    });

const lambda = new AWS.Lambda();

var params = {
    FunctionName: 'sendEmail', /* required */
    Payload: JSON.stringify({
        "recepient": "fezekileplaatyi2@gmail.com",
        "subject": "Verify Email",
        "emailBody": `
            <h1>Welcome</h1>
            <p>This was sent to verify email</p>
           <h4>Thank you,</h4>
            <h4><b>Motion Resume Team</b></h4>
        `,
    })
};

return lambda.invoke(params).promise()
    .then((result) => {
        res.send("Successfully registered, check your email for verification");
        res.render("index")
    })
    .catch(error => {
        console.log(error)
        res.status(500).send(
            "Error in sending email"
        );
    })
