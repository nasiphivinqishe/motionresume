var AWS = require('aws-sdk');
const S3 = new AWS.SES({
    apiVersion: '2010-12-01'
})

const sendEmail = (recepient, emailBody) => {
    // Create sendEmail params 
    var params = {
        Destination: {
            /* required */
            ToAddresses: ['nasiphivinqishe@gmail.com']
        },
        Message: {
            /* required */
            Body: {
                /* required */
                Html: {
                    Charset: "UTF-8",
                    Data: "<h1>Test</h1>"
                }
            },
            Subject: {
                Charset: 'UTF-8',
                Data: 'Test email'
            }
        },
        Source: 'nassiphivinqishe@gmail.com',
        /* required */
    };

    return S3.sendEmail(params).promise();
}

exports.handler = (event, context, callback) => {

    let { recepient, emailBody } = event

    sendEmail(recepient, emailBody)
        .then((result) => {
            console.debug(result)
            callback(null, result)
        })
        .catch(error => {
            console.error(error)
            callback(error, null)
        })
}