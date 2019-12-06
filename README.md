# STB FW - Javascript (ES6)
POC for new STB framework implementation using pure Javascript ES6 only
- This is not a full-featured FW for STBs 
- It is only a POC for a hybrid STB FW implementation. It was coded only in 15 days.

use verdaccio as npm registry for development purposes on local computer
- npm install -g verdaccio
- verdaccio&

add a new user to verdaccio and release fw
- npm adduser --registry http://localhost:4873
- username : development
- password : development
- e-mail   : test@test.com
- npm run release
