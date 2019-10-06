var express = require('express');
const fs = require('fs');
var http = require('http');
var https = require('https');
var xmlparser = require('express-xml-bodyparser');
var util = require('util');
var cookieParser = require('cookie-parser');
var xml2js = require('xml2js');

var settings = require('./settings.js');

app = express();

/*app.use(function(req, res, next){
  req.pipe(concat(function(data){
    req.body = data;
    next();
  }));
});*/
//app.use(bodyParser.text({type: '*/*'}));
app.use(xmlparser());
app.use(cookieParser());

function logRequest(req, res) {
  console.log(req.method, req.protocol, req.headers, req.originalUrl, req.query, util.inspect(req.body, false, null));
  res.status(404).send('not found');
}
number = 0;

sessions = {};
app.post('/DeploymentService/LoginService', (req, res) => {
  console.log(req.method, req.protocol, req.headers, req.originalUrl, req.query, util.inspect(req.body, false, null));
  message = req.body.workpointmessage.message[0];
  nonce = message['$'].nonce;
  reasonForContact = message.reasonforcontact[0];
  if (typeof(reasonForContact) == 'object') {
    reasonForContactAction = reasonForContact.$.action;
    reasonForContactStatus = reasonForContact.$.status;
    reasonForContact = reasonForContact._;
  }
  console.log(nonce, typeof(reasonForContact), reasonForContact, "" + reasonForContact);
  if (reasonForContact == 'solicited' || reasonForContact == 'start-up') {
    itemlist = message.itemlist[0].item;
    contactMeUri = itemlist.find(x => x['$']['name'] == 'contact-me-uri')._;
    version = itemlist.find(x => x['$']['name'] == 'software-version')._;
    macAddr = itemlist.find(x => x['$']['name'] == 'mac-addr')._;
    console.log(itemlist, contactMeUri, version, macAddr);


    //nonce = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);;
    console.log('Doing', nonce);
    session = sessions[macAddr] = {
      'macAddr': macAddr,
      'provisioned': false
    }
    if (version != 'V3 R5.12.0') {
      console.log('Attempting firmware upgrade...');
      return res.cookie('macAddr', macAddr).status(200).type('text/xml').send(`
<DlsMessage xsi:schemaLocation="http://www.siemens.com/DLS" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns="http://www.siemens.com/DLS"> 
<Message nonce="${nonce}">
  <Action>SoftwareDeployment</Action>
  <ItemList>
    <Item name="file-server">192.168.2.5</Item>
    <Item name="file-pwd">osdownload</Item>
    <Item name="file-path">/</Item>
    <Item name="file-name">OS40_SIP_V3_R5_12_0.img</Item>
    <Item name="file-type">APP</Item>
    <Item name="file-username">ftpuser</Item>
    <Item name="file-port">21</Item>
    <Item name="file-sw-type">Siemens SIP</Item>
    <Item name="file-sw-version">3.5.12.0</Item>
    <Item name="file-priority">normal</Item>
  </ItemList>
</Message>
</DlsMessage>`);
    }
    console.log('Requesting all vars...');
    return res.cookie('macAddr', macAddr).status(200).type('text/xml').send(`
<DlsMessage xsi:schemaLocation="http://www.siemens.com/DLS" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns="http://www.siemens.com/DLS"> 
<Message nonce="${nonce}">
  <Action>ReadAllItems</Action>
</Message>
</DlsMessage>`);
  } else if (reasonForContact == 'reply-to') {
    macAddr = req.cookies.macAddr;
    console.log('reply-to', macAddr);
    if (! (macAddr in sessions)) {
      console.log('reply-to not found');
      return res.status(404).send('not found');
    }
    session = sessions[macAddr];

    if (reasonForContactAction == 'ReadAllItems') {
      fs.writeFile(`all_variables/response_${session.macAddr}_${nonce}`, JSON.stringify(message));
      itemlist = message.itemlist[0].item;
      content = "";
      for (i = 0; i < itemlist.length; i++) {
        let item = itemlist[i];
        if ('index' in item['$']) {
          content += `${item['$'].name}[${item['$'].index}]: ${item._}\n`;
        } else {
          content += `${item['$'].name}: ${item._}\n`;        
        }
      }
      fs.writeFile(`all_variables/responseList_${session.macAddr}_${nonce}`, content);
    }

    if (session.provisioned || !(macAddr in settings.device)) {
      console.log('Cleanup', macAddr);
      return res.status(200).type('text/xml').send(`
      <DLSMessage xsi:schemaLocation="http://www.siemens.com/DLS" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns="http://www.siemens.com/DLS">
        <Message nonce="${nonce}">
          <Action>CleanUp</Action>
        </Message>
      </DLSMessage>`);
    }
    session.provisioned = true;

    settingsToSet = {...settings.global, ...settings.device[macAddr]};
    settingsXML = Object.keys(settingsToSet).reduce(function(result, key) {
      value = settingsToSet[key];
      if (typeof(value) === 'object') {
        for (index in value) {
          actValue = value[index];
          result.push({
            "Item":[
              {
                "_":actValue,
                "$":{
                  "name":key,
                  "index": index
                }
              }
            ]
          });
        }
      } else {
        result.push({
          "Item":[
            {
              "_":value,
              "$":{
                "name":key
              }
            }
          ]
        });
      }
      return result
    }, []);
    message = {
      "DLSMessage":{
        "$":{
          "xsi:schemaLocation":"http://www.siemens.com/DLS",
          "xmlns:xsi":"http://www.w3.org/2001/XMLSchema-instance",
          "xmlns":"http://www.siemens.com/DLS"
        },
        "Message":[
          {
            "$":{
              "nonce": nonce
            },
            "Action":[
              "WriteItems"
            ],
            "ItemList": settingsXML
          }
        ]
      }
    };
    var builder = new xml2js.Builder();
    var xml = builder.buildObject(message);
    console.log(xml);
    
    return res.status(200).type('text/xml').send(xml);
  }
  console.log('not-found');
  return res.status(404).send('not found');
})

app.get('/*', logRequest);
app.post('/*', logRequest);


https.createServer(
{
  key: fs.readFileSync('./key.pem'),
  cert: fs.readFileSync('./cert.pem'),
}
,app).listen(443);
http.createServer(app).listen(80);
