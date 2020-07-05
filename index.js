const express = require('express');
const bodyParser = require('body-parser');

const app = express();

// ========= setup =========
app.disable('x-powered-by');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true })) 

app.use(bodyParser.raw({
    type: 'image/png',
    limit: '10mb'
}));

require('./routes/apiRoutes')(app);


const PORT = process.env.PORT || 5000;
app.listen(PORT);