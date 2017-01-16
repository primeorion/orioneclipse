var sns = require('helper/AwsSdkConnect.js').sns;
var token = "1234567898123456789";
var params = {'PlatformApplicationArn':"arn:aws:sns:us-west-2:684194472494:app/ADM/TestApp",'Token':token};

var message = 'Test1';
var subject = 'Stuff1';

/*sns.createPlatformEndpoint(params,function(err,EndPointResult)
{
    if (err) {
    console.log(err.stack);
    //return;
  }
  console.log("end point "+JSON.stringify(EndPointResult));
    //var client_arn = EndPointResult["EndpointArn"];
    var client_arn = "arn:aws:sns:us-west-2:684194472494:test";
    sns.publish({
    TargetArn: client_arn,
    Message: message,
    Subject: subject},
        function(err,data){
        if (err)
        {
            console.log("Error sending a message "+err);
        }
        else
        {
            console.log("Sent message: "+data.MessageId);

        }
    });
});*/
var payload = {
    default: "Hello World",
    APNS: {
      aps: {
        alert: "Hello World",
        sound: "default",
        badge: 1
      }
    }
  };
  var endpointArn = "arn:aws:sns:us-west-2:684194472494:test";
// sns.publish({
//     Message: "hello",
//     //MessageStructure: 'json',
//     TargetArn: endpointArn
//   }, function(err, data) {
//     if (err) {
//       console.log(err.stack);
//       return;
//     }

//     console.log('push sent');
//     console.log(data);
//   });
// var params = {
//   Name: 'Another_topic' /* required */
// };
// sns.createTopic(params, function(err, data) {
//   if (err) console.log(err, err.stack); // an error occurred
//   else     console.log(data);           // successful response
// });

// var params = {
//   EndpointArn: 'STRING_VALUE' 
// };
// sns.deleteEndpoint(params, function(err, data) {
//   if (err) console.log(err, err.stack); // an error occurred
//   else     console.log(data);           // successful response
// });

// var params = {};
// sns.listTopics(params, function(err, data) {
//   if (err) console.log(err, err.stack); // an error occurred
//   else     console.log(data);           // successful response
// });

// var params = {};
// sns.listSubscriptions(params, function(err, data) {
//   if (err) console.log(err, err.stack); // an error occurred
//   else     console.log(data);           // successful response
// });