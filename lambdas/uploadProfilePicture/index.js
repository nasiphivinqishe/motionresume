const multipart = require('aws-lambda-multipart-parser');
var AWS = require('aws-sdk');
var s3 = new AWS.S3({ apiVersion: '2006-03-01' });

const uploadProfilePicture = (event) => {
    /*
        {
        "file": {
            "type": "file",
            "filename": "lorem.txt",
            "contentType": "text/plain",
            "content": {
                "type": "Buffer",
                "data": [ ... byte array ... ]
            } or String
        },
        "field": "value"
    }
    */

    const result = multipart.parse(event)

    const filename = result.filename
    var fileContent = result.file.content


    const params = {
        Bucket: "myprofilepicturebucket",
        Key: filename,
        Body: fileContent
    };

    // call S3 to retrieve upload file to specified bucket
    return s3.upload(params).promise()
}



exports.handler = (event, context, callback) => {

    JSON.stringify({ event })

    uploadProfilePicture(event)
        .then(result => {
            console.debug(result)
            callback(null, result)
        })
        .catch(error => {
            console.error(error)
            callback(error, null)
        })
}
