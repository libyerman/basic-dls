Install

  #git clone https://github.com/decontamin4t0R/basic-dls.git
  
  #node install

Create cert

  #openssl req -x509 -nodes -days 1095 -newkey rsa:2048 -out /etc/apache2/ssl/server.crt -keyout /etc/apache2/ssl/server.key

Edit index.js

  #key: fs.readFileSync('/etc/apache2/ssl/server.key'),
  #cert: fs.readFileSync('/etc/apache2/ssl/server.crt'),

Create template and change parametres 

  #cp -a template-settings.js settings.js

Create especific template for each "MAC Address"
  "device": {
        "00:1a:e8:2c:56:94": require("./settingPrueba.js"), // prueba

Execute server

  #node index.js

