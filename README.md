digiturk (beIN Media Group) POC for new STB framework implementation using pure Javascript ES6 only

use verdaccio as npm registry for development purposes on local computer
> npm install -g verdaccio
> verdaccio&

add a new user to verdaccio and release fw
> npm adduser --registry http://localhost:4873
username : development
password : development
e-mail   : test@test.com
> npm run release