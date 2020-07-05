const multer = require('multer');
let upload = multer();
const MinecraftSkin = require('../services/MinecraftSkin');


const GENERIC_400 = {
    status: 400,
    message: 'Bad Request',
    description: ''
};

const GENERIC_500 = {
    status: 500,
    message: 'Internal Server Error',
    description: ''
};

module.exports = (app) => {

    app.get('/test', 
    async (req, res) => {
        res.send('hello world');
    });


    
    app.post('/head', 
    upload.single('file'),
    async (req, res) => {
        // requires multipart/form-data fields:

        // - "isAlex" optional, if set to anything (not empty, not '0' and not 'false' (case insensitive)) considered "true"
        // - "file" --- image/png skin file

        const {body, file} = req;

        if (!file) return res.status(GENERIC_400.status).send({...GENERIC_400, description: 'No skin file provided!'});

        const size = req.query.size ? parseInt(req.query.size) : 120;

        if (size < 10) return res.status(GENERIC_400.status).send({...GENERIC_400, description: 'Minimum head size is 10!'});
        if (size > 1000) return res.status(GENERIC_400.status).send({...GENERIC_400, description: 'Maximum head size is 1000!'});

        const isAlex = body.isAlex && body.isAlex !== '0' && body.isAlex.toLowerCase() !== 'false';

        try {

            const skin = new MinecraftSkin(file.buffer, isAlex, size);

            const headBuffer = await skin.getHead();

            res.set('Content-Type', 'image/png');
            res.send(headBuffer);

        } catch (e) {
            return res.status(GENERIC_500.status).send({...GENERIC_500, description: e.message});
        }

    });


    app.post('/render', 
    upload.single('file'),
    async (req, res) => {
        // requires multipart/form-data fields:

        // - "isAlex" optional, if set to anything (not empty) considered "true"
        // - "file" --- image/png skin file
        const {body, file} = req;

        if (!file) return res.status(GENERIC_400.status).send({...GENERIC_400, description: 'No skin file provided!'});

        const size = req.query.size ? parseInt(req.query.size) : 120;

        if (size < 10) return res.status(GENERIC_400.status).send({...GENERIC_400, description: 'Minimum render size (width) is 10!'});
        if (size > 500) return res.status(GENERIC_400.status).send({...GENERIC_400, description: 'Maximum render size (width) is 500!'});

        const isAlex = body.isAlex && body.isAlex !== '0' && body.isAlex.toLowerCase() !== 'false';

        try {

            const skin = new MinecraftSkin(file.buffer, isAlex, size);

            const skinBuffer = await skin.getRender();

            res.set('Content-Type', 'image/png');
            res.send(skinBuffer);

        } catch (e) {
            return res.status(GENERIC_500.status).send({...GENERIC_500, description: e.message});
        }

    });
};

