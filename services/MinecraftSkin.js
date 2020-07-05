const canvas = require('canvas');
const Image = canvas.Image;

const TYPE_OLD = 1;
const TYPE_NEW = 2;


class MinecraftSkin {

    static side = 60;
    static defaultWidth = 140;

    baseBuffer = null
    imageWidth = null;
    baseImage = null;
    img = null;
    isAlex = false;
    type = TYPE_OLD;
    blockSize = null;

    _canvas = null;
    _ctx = null;

    constructor(imageBufferFile, isAlex = false, imageWidth = MinecraftSkin.side) {
        this.baseBuffer = imageBufferFile;

        const imageFile = new Image();
        imageFile.src = imageBufferFile;
        this.baseImage = imageFile;

        this.side = MinecraftSkin.side;
        this.isAlex = isAlex;
        this.imageWidth = imageWidth;


        if (!imageFile.width || typeof imageFile.width !== 'number') throw Error(`Invalid skin file dimensions! Width was ${imageFile.width}.`);
        if (imageFile.width % 64 !== 0) throw Error(`Invalid skin file dimensions! Expected width number divisable by 64, got ${imageFile.width}`);
        if (imageFile.height % 32 !== 0) throw Error(`Invalid skin file dimensions! Expected height number divisable by 32, got ${imageFile.height}`);

        // determine type?
        this.type = (imageFile.height !== imageFile.width) ? TYPE_OLD : TYPE_NEW;

        this._canvas = canvas.createCanvas(imageWidth, imageWidth);
        this._ctx = this._canvas.getContext('2d');
        
        this._ctx.mozImageSmoothingEnabled = true;
        this._ctx.webkitImageSmoothingEnabled = true;
        this._ctx.msImageSmoothingEnabled = true;
        this._ctx.imageSmoothingEnabled = true;
    }



    getRender = () => {
        // use multiples of 60 for "base" height, then scale down...
        const ctx = this._ctx;
        const canvas = this._canvas;

        const outSide = MinecraftSkin.getSideForHead(this.imageWidth);
        let drawSide = MinecraftSkin.side;
        // get next multiple of 60 that is >= outSide...

        while (drawSide < outSide) {
            drawSide *= 2;
        }

        this.side = drawSide;

        // get render in multiples of 60 (most accturate/good looking math)
        const upscaleImage = this._internalGetRender();

        const [finalWidth,finalHeight] = [this.imageWidth, this.imageWidth*2.05];

        // render at specified width and determine height now
        canvas.width = finalWidth;
        canvas.height = finalHeight;

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(upscaleImage, 0, 0, finalWidth, finalHeight);

        return canvas.toBuffer();
    }

    getHead = () => {
        // use multiples of 60 for "base" height, then scale down...
        const ctx = this._ctx;
        const canvas = this._canvas;

        const outSide = MinecraftSkin.getSideForHead(this.imageWidth);
        let drawSide = MinecraftSkin.side;
        // get next multiple of 60 that is >= outSide...

        while (drawSide < outSide) {
            drawSide *= 2;
        }

        this.side = drawSide;

        // get render in multiples of 60 (most accturate/good looking math)
        const upscaleImage = this._internalGetHead();


        const [finalWidth,finalHeight] = [this.imageWidth,this.imageWidth];

        // render at specified width and determine height now
        canvas.width = finalWidth;
        canvas.height = finalHeight;
        
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(upscaleImage, 0, 0, finalWidth, finalHeight);

        return canvas.toBuffer();
    }



    _makeScaledImage = () => {
        try {
            this.img = MinecraftSkin.generateToScaleImage(this.side, this.baseImage);
            this.blockSize = this.img.width / 8;
        } catch (e) {
            throw Error("Could not generate upscaled image");
        }
    };


    _internalGetRender = () => {
        if (this.img === null) this._makeScaledImage();

        const {side, blockSize, img} = this;
        const [rectWidth, rectHeight] = MinecraftSkin.getRenderImageDimensions(side);

        let tmpCanvas = canvas.createCanvas(rectWidth,rectHeight);
        let ctx = tmpCanvas.getContext("2d");

        // make upscaled image

        ctx.mozImageSmoothingEnabled = true;
        ctx.webkitImageSmoothingEnabled = true;
        ctx.msImageSmoothingEnabled = true;
        ctx.imageSmoothingEnabled = true;


        const hB = blockSize/2;
        const sB = blockSize/8;


        const w = side * 0.9;
        const h = side;

        const baseOffsetL = side*0.25;
        const baseOffsetT = side*0.55;

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.save();


        
        // ============== feet ==============

        //left leg face
        ctx.transform(
            1, /*Horizontal scaling. A value of 1 results in no scaling*/
            -0.5, /*Vertical skewing.*/
            0, /*Horizontal skewing.*/
            1,  /*Vertical scaling. A value of 1 results in no scaling.*/
            baseOffsetL + side * 6/8, // /*Horizontal translation (moving).*/
            baseOffsetT + side * 23/8 - 1 - sB/16 // /*Vertical translation (moving).*/
            );

        ctx.drawImage(
            img, // image to draw
            hB+1, // image left (x) crop offset
            hB*5+1,  // image top (y) crop offset
            hB-2, // image crop width
            hB*3-2, // image crop height
            0, // placement left (x) offset
            0, // placement top (y) offset
            w/2, // placement width
            h * 1.5 // placement height
            ); 

        ctx.restore();
        ctx.save();

        if (this.type == TYPE_OLD) {

            // right leg face (mirrored left leg)
            ctx.transform(
                -1, /*Horizontal scaling. A value of 1 results in no scaling*/
                0.5, /*Vertical skewing.*/
                0, /*Horizontal skewing.*/
                1,  /*Vertical scaling. A value of 1 results in no scaling.*/
                baseOffsetL + side * 13/8 + sB/7, // /*Horizontal translation (moving).*/
                baseOffsetT + side * 19/8 + sB/3 -0.5 - sB/16 // /*Vertical translation (moving).*/
                );

            ctx.drawImage(
                img, // image to draw
                hB, // image left (x) crop offset
                hB*5+1,  // image top (y) crop offset
                hB-2, // image crop width
                hB*3-2, // image crop height
                0, // placement left (x) offset
                0, // placement top (y) offset
                w/2, // placement width
                h * 1.5 // placement height
                ); 

            ctx.restore();
            ctx.save();

        } else {

            // right leg face
            ctx.transform(
                1, /*Horizontal scaling. A value of 1 results in no scaling*/
                -0.5, /*Vertical skewing.*/
                0, /*Horizontal skewing.*/
                1,  /*Vertical scaling. A value of 1 results in no scaling.*/
                baseOffsetL + side * 9/8 + sB/2, // /*Horizontal translation (moving).*/
                baseOffsetT + side * 21/8 + sB/8 - sB/16 // /*Vertical translation (moving).*/
                );

            ctx.drawImage(
                img, // image to draw
                hB*5+1, // image left (x) crop offset
                hB*13+1,  // image top (y) crop offset
                hB-2, // image crop width
                hB*3-2, // image crop height
                0, // placement left (x) offset
                0, // placement top (y) offset
                w/2, // placement width
                h * 1.5 // placement height
                ); 

            ctx.restore();
            ctx.save();


            // OVERLAY

            // right leg face overlay
            ctx.transform(
                1, /*Horizontal scaling. A value of 1 results in no scaling*/
                -0.5, /*Vertical skewing.*/
                0, /*Horizontal skewing.*/
                1,  /*Vertical scaling. A value of 1 results in no scaling.*/
                baseOffsetL + side * 9/8 + sB/2, // /*Horizontal translation (moving).*/
                baseOffsetT + side * 21/8 - sB/8 // /*Vertical translation (moving).*/
                );

            ctx.drawImage(
                img, // image to draw
                hB+1, // image left (x) crop offset
                hB*13+1,  // image top (y) crop offset
                hB-2, // image crop width
                hB*3-2, // image crop height
                0, // placement left (x) offset
                0, // placement top (y) offset
                (w/2)*1.1, // placement width
                (h * 1.5)*1.1 // placement height
                ); 

            ctx.restore();
            ctx.save();
        }



        // left leg left
        ctx.transform(
            1, /*Horizontal scaling. A value of 1 results in no scaling*/
            0.5, /*Vertical skewing.*/
            0, /*Horizontal skewing.*/
            1,  /*Vertical scaling. A value of 1 results in no scaling.*/
            baseOffsetL + side * 2/8 + sB/2, // /*Horizontal translation (moving).*/
            baseOffsetT + side * 21/8 + sB/8 - sB/16 // /*Vertical translation (moving).*/
            );

        ctx.drawImage(
            img, // image to draw
            1, // image left (x) crop offset
            hB*5+1,  // image top (y) crop offset
            hB-2, // image crop width
            hB*3-2, // image crop height
            0, // placement left (x) offset
            0, // placement top (y) offset
            w/2, // placement width
            h * 1.5 // placement height
            ); 
        ctx.restore();
        ctx.save();

        if (this.type == TYPE_NEW) {
            // OVERLAY

            //left leg face overlay
            ctx.transform(
                1, /*Horizontal scaling. A value of 1 results in no scaling*/
                -0.5, /*Vertical skewing.*/
                0, /*Horizontal skewing.*/
                1,  /*Vertical scaling. A value of 1 results in no scaling.*/
                baseOffsetL + side * 6/8 -1, // /*Horizontal translation (moving).*/
                baseOffsetT + side * 23/8 - sB/4  // /*Vertical translation (moving).*/
                );

            ctx.drawImage(
                img, // image to draw
                hB+1, // image left (x) crop offset
                hB*9+1,  // image top (y) crop offset
                hB-2, // image crop width
                hB*3-2, // image crop height
                0, // placement left (x) offset
                0, // placement top (y) offset
                (w/2)*1.1, // placement width
                (h * 1.5)*1.1 // placement height
                ); 

            ctx.restore();
            ctx.save();

            // left leg left overlay
            ctx.transform(
                1, /*Horizontal scaling. A value of 1 results in no scaling*/
                0.5, /*Vertical skewing.*/
                0, /*Horizontal skewing.*/
                1,  /*Vertical scaling. A value of 1 results in no scaling.*/
                baseOffsetL + side * 2/8, // /*Horizontal translation (moving).*/
                baseOffsetT + side * 21/8 - sB/4// /*Vertical translation (moving).*/
                );

            ctx.drawImage(
                img, // image to draw
                1, // image left (x) crop offset
                hB*9+1,  // image top (y) crop offset
                hB-2, // image crop width
                hB*3-2, // image crop height
                0, // placement left (x) offset
                0, // placement top (y) offset
                (w/2)*1.1, // placement width
                (h * 1.5)*1.1 // placement height
                ); 
            ctx.restore();
            ctx.save();


        }


        // arms right
        if (this.type == TYPE_OLD) {
            //mirror left

            // right arm face
            ctx.transform(
                -1, /*Horizontal scaling. A value of 1 results in no scaling*/
                0.5, /*Vertical skewing.*/
                0, /*Horizontal skewing.*/
                1,  /*Vertical scaling. A value of 1 results in no scaling.*/
                baseOffsetL + (side * 16.75/8) - sB/16, // /*Horizontal translation (moving).*/
                baseOffsetT + (side * 6/8)  - sB/4 /*Vertical translation (moving).*/
                );

            ctx.drawImage(
                img, // image to draw
                hB*11+1, // image left (x) crop offset
                hB*5+1,  // image top (y) crop offset
                hB-2, // image crop width
                hB*3-2, // image crop height
                0, // placement left (x) offset
                0, // placement top (y) offset
                w * 0.5, // placement width
                h * 1.5 // placement height
                ); 
            ctx.restore();
            ctx.save();



            // right arm top
            ctx.transform(
                1, /*Horizontal scaling. A value of 1 results in no scaling*/
                0.5, /*Vertical skewing.*/
                -1, /*Horizontal skewing.*/
                0.5,  /*Vertical scaling. A value of 1 results in no scaling.*/
                baseOffsetL + (side * 13/8) + sB/8 , // /*Horizontal translation (moving).*/
                baseOffsetT + (side * 4/8) /*Vertical translation (moving).*/
                );

            ctx.drawImage(
                img, // image to draw
                hB*11+1, // image left (x) crop offset
                hB*4+1,  // image top (y) crop offset
                sB*3-2, // image crop width
                hB-2, // image crop height
                0, // placement left (x) offset
                0, // placement top (y) offset
                w/2, // placement width
                w/2 // placement height
                ); 
            ctx.restore();
            ctx.save();

        }
        else if (this.isAlex) {

             // right arm face
             ctx.transform(
                1, /*Horizontal scaling. A value of 1 results in no scaling*/
                -0.5, /*Vertical skewing.*/
                0, /*Horizontal skewing.*/
                1,  /*Vertical scaling. A value of 1 results in no scaling.*/
                baseOffsetL + (side * 13/8) + sB/8 - sB/16, // /*Horizontal translation (moving).*/
                baseOffsetT + (side * 7.5/8) // /*Vertical translation (moving).*/
                );

            ctx.drawImage(
                img, // image to draw
                hB*9+1, // image left (x) crop offset
                hB*13+1,  // image top (y) crop offset
                sB*3-2, // image crop width
                hB*3-2, // image crop height
                0, // placement left (x) offset
                0, // placement top (y) offset
                w * 3/8, // placement width
                h * 1.5 // placement height
                ); 
            ctx.restore();
            ctx.save();


            //right arm top
            ctx.transform(
                1, /*Horizontal scaling. A value of 1 results in no scaling*/
                -0.5, /*Vertical skewing.*/
                1, /*Horizontal skewing.*/
                0.5,  /*Vertical scaling. A value of 1 results in no scaling.*/
                baseOffsetL + (side * 10/8) - sB/2.5, // /*Horizontal translation (moving).*/
                baseOffsetT + (side * 6/8) - sB/4  // /*Vertical translation (moving).*/
                );

            ctx.drawImage(
                img, // image to draw
                hB*9+1, // image left (x) crop offset
                hB*12+1,  // image top (y) crop offset
                sB*3-2, // image crop width
                hB-2, // image crop height
                0, // placement left (x) offset
                0, // placement top (y) offset
                w * 3/8, // placement width
                w/2 // placement height
                ); 

            ctx.restore();
            ctx.save();


            // OVERLAYS

            // right arm face overlay
            ctx.transform(
                1, /*Horizontal scaling. A value of 1 results in no scaling*/
                -0.5, /*Vertical skewing.*/
                0, /*Horizontal skewing.*/
                1,  /*Vertical scaling. A value of 1 results in no scaling.*/
                baseOffsetL + (side * 13/8) + sB/8 , // /*Horizontal translation (moving).*/
                baseOffsetT + (side * 7.5/8)  - sB * 0.667 // - sB/4 /*Vertical translation (moving).*/
                );

            ctx.drawImage(
                img, // image to draw
                hB*13+1, // image left (x) crop offset
                hB*13+1,  // image top (y) crop offset
                sB*3-2, // image crop width
                hB*3-2, // image crop height
                0, // placement left (x) offset
                0, // placement top (y) offset
                (w * 3/8) * 1.1, // placement width
                (h * 1.5) * 1.1 // placement height
                ); 
            ctx.restore();
            ctx.save();

             //right arm top overlay
             ctx.transform(
                1, /*Horizontal scaling. A value of 1 results in no scaling*/
                -0.5, /*Vertical skewing.*/
                1, /*Horizontal skewing.*/
                0.5,  /*Vertical scaling. A value of 1 results in no scaling.*/
                baseOffsetL + (side * 10/8) - sB * 0.75, // /*Horizontal translation (moving).*/
                baseOffsetT + (side * 5/8) - sB/8  // /*Vertical translation (moving).*/
                );

            ctx.drawImage(
                img, // image to draw
                hB*13+1, // image left (x) crop offset
                hB*12+1,  // image top (y) crop offset
                sB*3-2, // image crop width
                hB-2, // image crop height
                0, // placement left (x) offset
                0, // placement top (y) offset
                (w * 3/8)*1.1, // placement width
                (w/2)*1.1 // placement height
                ); 

            ctx.restore();
            ctx.save();


        } else {

             // right arm face
             ctx.transform(
                1, /*Horizontal scaling. A value of 1 results in no scaling*/
                -0.5, /*Vertical skewing.*/
                0, /*Horizontal skewing.*/
                1,  /*Vertical scaling. A value of 1 results in no scaling.*/
                baseOffsetL + (side * 13/8) + sB/8 - sB/16, // /*Horizontal translation (moving).*/
                baseOffsetT + (side * 7.5/8) // - sB/4 /*Vertical translation (moving).*/
                );

            ctx.drawImage(
                img, // image to draw
                hB*9+1, // image left (x) crop offset
                hB*13+1,  // image top (y) crop offset
                hB-2, // image crop width
                hB*3-2, // image crop height
                0, // placement left (x) offset
                0, // placement top (y) offset
                w/2, // placement width
                h * 1.5 // placement height
                ); 
            ctx.restore();
            ctx.save();


            //right arm top
            ctx.transform(
                1, /*Horizontal scaling. A value of 1 results in no scaling*/
                -0.5, /*Vertical skewing.*/
                1, /*Horizontal skewing.*/
                0.5,  /*Vertical scaling. A value of 1 results in no scaling.*/
                baseOffsetL + (side * 10/8) - sB/2.5, // /*Horizontal translation (moving).*/
                baseOffsetT + (side * 6/8) - sB/4  // /*Vertical translation (moving).*/
                );

            ctx.drawImage(
                img, // image to draw
                hB*9+1, // image left (x) crop offset
                hB*12+1,  // image top (y) crop offset
                hB-2, // image crop width
                hB-2, // image crop height
                0, // placement left (x) offset
                0, // placement top (y) offset
                w/2, // placement width
                w/2 // placement height
                ); 

            ctx.restore();
            ctx.save();

            // OVERLAY

             // right arm face overlay
             ctx.transform(
                1, /*Horizontal scaling. A value of 1 results in no scaling*/
                -0.5, /*Vertical skewing.*/
                0, /*Horizontal skewing.*/
                1,  /*Vertical scaling. A value of 1 results in no scaling.*/
                baseOffsetL + (side * 13/8) + sB/8 , // /*Horizontal translation (moving).*/
                baseOffsetT + (side * 7.5/8) - sB * 0.667 // - sB/4 /*Vertical translation (moving).*/
                );

            ctx.drawImage(
                img, // image to draw
                hB*13+1, // image left (x) crop offset
                hB*13+1,  // image top (y) crop offset
                hB-2, // image crop width
                hB*3-2, // image crop height
                0, // placement left (x) offset
                0, // placement top (y) offset
                (w/2)*1.1, // placement width
                (h * 1.5)*1.1 // placement height
                ); 
            ctx.restore();
            ctx.save();


            //right arm top overlay
            ctx.transform(
                1, /*Horizontal scaling. A value of 1 results in no scaling*/
                -0.5, /*Vertical skewing.*/
                1, /*Horizontal skewing.*/
                0.5,  /*Vertical scaling. A value of 1 results in no scaling.*/
                baseOffsetL + (side * 9/8) + sB/8, // /*Horizontal translation (moving).*/
                baseOffsetT + (side * 5/8) - sB/8 // /*Vertical translation (moving).*/
                );

            ctx.drawImage(
                img, // image to draw
                hB*13+1, // image left (x) crop offset
                hB*12+1,  // image top (y) crop offset
                hB-2, // image crop width
                hB-2, // image crop height
                0, // placement left (x) offset
                0, // placement top (y) offset
                (w/2)*1.1, // placement width
                (w/2)*1.1 // placement height
                ); 

            ctx.restore();
            ctx.save();


        }


        // ============ body ==============

        // body face
        ctx.transform(
            1, /*Horizontal scaling. A value of 1 results in no scaling*/
            -0.5, /*Vertical skewing.*/
            0, /*Horizontal skewing.*/
            1,  /*Vertical scaling. A value of 1 results in no scaling.*/
            baseOffsetL + side * 0.75, // /*Horizontal translation (moving).*/
            baseOffsetT + side * 11/8 // /*Vertical translation (moving).*/
            );

        ctx.drawImage(
            img, // image to draw
            hB*5+1, // image left (x) crop offset
            hB*5+1,  // image top (y) crop offset
            hB*2-2, // image crop width
            hB*3-2, // image crop height
            0, // placement left (x) offset
            0, // placement top (y) offset
            w, // placement width
            h * 1.5 // placement height
            ); 

        ctx.restore();
        ctx.save();


        // body left
        ctx.transform(
            1, /*Horizontal scaling. A value of 1 results in no scaling*/
            0.5, /*Vertical skewing.*/
            0, /*Horizontal skewing.*/
            1,  /*Vertical scaling. A value of 1 results in no scaling.*/
            baseOffsetL + side * 0.25 + sB/2, // /*Horizontal translation (moving).*/
            baseOffsetT + side * 9.180/8 // /*Vertical translation (moving).*/
            );

        ctx.drawImage(
            img, // image to draw
            hB*4+1, // image left (x) crop offset
            hB*5+1,  // image top (y) crop offset
            hB-2, // image crop width
            hB*3-2, // image crop height
            0, // placement left (x) offset
            0, // placement top (y) offset
            w/2, // placement width
            h * 1.5 // placement height
            ); 

        ctx.restore();
        ctx.save();

        if (this.type == TYPE_NEW) {
            // overlay layers body

            // body face overlay
            ctx.transform(
                1, /*Horizontal scaling. A value of 1 results in no scaling*/
                -0.5, /*Vertical skewing.*/
                0, /*Horizontal skewing.*/
                1,  /*Vertical scaling. A value of 1 results in no scaling.*/
                baseOffsetL + side * 0.75 , // /*Horizontal translation (moving).*/
                baseOffsetT + side * 11/8 - sB/2 // /*Vertical translation (moving).*/
                );

            ctx.drawImage(
                img, // image to draw
                hB*5+1, // image left (x) crop offset
                hB*9+1,  // image top (y) crop offset
                hB*2-2, // image crop width
                hB*3-2, // image crop height
                0, // placement left (x) offset
                0, // placement top (y) offset
                w * 1.1, // placement width
                h * 1.65 // placement height
                ); 

            ctx.restore();
            ctx.save();



            // body left overlay
            ctx.transform(
                1, /*Horizontal scaling. A value of 1 results in no scaling*/
                0.5, /*Vertical skewing.*/
                0, /*Horizontal skewing.*/
                1,  /*Vertical scaling. A value of 1 results in no scaling.*/
                baseOffsetL + side * 0.25 + sB/8, // /*Horizontal translation (moving).*/
                baseOffsetT + side * 9/8 - sB/2 // /*Vertical translation (moving).*/
                );

            ctx.drawImage(
                img, // image to draw
                hB*4+1, // image left (x) crop offset
                hB*9+1,  // image top (y) crop offset
                hB-2, // image crop width
                hB*3-2, // image crop height
                0, // placement left (x) offset
                0, // placement top (y) offset
                w * 0.55, // placement width
                h * 1.65 // placement height
                ); 

            ctx.restore();
            ctx.save();


        }


        // arms left
        if (this.isAlex) {

            // left arm side
            ctx.transform(
                1, /*Horizontal scaling. A value of 1 results in no scaling*/
                0.5, /*Vertical skewing.*/
                0, /*Horizontal skewing.*/
                1,  /*Vertical scaling. A value of 1 results in no scaling.*/
                baseOffsetL - (side * 0.25) + sB * 1.5  + sB/16, // /*Horizontal translation (moving).*/
                baseOffsetT + side * 11/8 - sB * 0.334  // /*Vertical translation (moving).*/
                );

            ctx.drawImage(
                img, // image to draw
                hB*10+1, // image left (x) crop offset
                hB*5+1,  // image top (y) crop offset
                hB-2, // image crop width
                hB*3-2, // image crop height
                0, // placement left (x) offset
                0, // placement top (y) offset
                w/2, // placement width
                h * 1.5 // placement height
                ); 
            ctx.restore();
            ctx.save();

            
            // left arm face
            ctx.transform(
                1, /*Horizontal scaling. A value of 1 results in no scaling*/
                -0.5, /*Vertical skewing.*/
                0, /*Horizontal skewing.*/
                1,  /*Vertical scaling. A value of 1 results in no scaling.*/
                baseOffsetL + (side * 0.25) + sB * 9/8 , // /*Horizontal translation (moving).*/
                baseOffsetT + (side * 13/8) - sB/2 /*Vertical translation (moving).*/
                );

            ctx.drawImage(
                img, // image to draw
                hB*11+1, // image left (x) crop offset
                hB*5+1,  // image top (y) crop offset
                sB*3-2, // image crop width
                hB*3-2, // image crop height
                0, // placement left (x) offset
                0, // placement top (y) offset
                w * 3/8, // placement width
                h * 1.5 // placement height
                ); 
            ctx.restore();
            ctx.save();

            
            //left arm top
            ctx.transform(
                1, /*Horizontal scaling. A value of 1 results in no scaling*/
                -0.5, /*Vertical skewing.*/
                1, /*Horizontal skewing.*/
                0.5,  /*Vertical scaling. A value of 1 results in no scaling.*/
                baseOffsetL - (side * 1.5/8) + sB, // /*Horizontal translation (moving).*/
                baseOffsetT + (side * 11/8) - (sB * 0.334) +  1 // /*Vertical translation (moving).*/
                );

            ctx.drawImage(
                img, // image to draw
                hB*11+1, // image left (x) crop offset
                hB*4+1,  // image top (y) crop offset
                sB*3-2, // image crop width
                hB-2, // image crop height
                0, // placement left (x) offset
                0, // placement top (y) offset
                w * 3/8, // placement width
                w/2 // placement height
                ); 

            ctx.restore();
            ctx.save();



            // overlays


            // left arm side overlay
            ctx.transform(
                1, /*Horizontal scaling. A value of 1 results in no scaling*/
                0.5, /*Vertical skewing.*/
                0, /*Horizontal skewing.*/
                1,  /*Vertical scaling. A value of 1 results in no scaling.*/
                baseOffsetL - (side * 0.25) + sB * 1.5 - w/8 * 0.3344, // /*Horizontal translation (moving).*/
                baseOffsetT + side * 10/8 - sB * 0.334  + 1  // /*Vertical translation (moving).*/
                );

            ctx.drawImage(
                img, // image to draw
                hB*10+1, // image left (x) crop offset
                hB*9+1,  // image top (y) crop offset
                hB-2, // image crop width
                hB*3-2, // image crop height
                0, // placement left (x) offset
                0, // placement top (y) offset
                (w * 1.1) /2, // placement width
                (h * 1.1) * 1.5 // placement height
                ); 
            ctx.restore();
            ctx.save();


            // left arm face overlay
             ctx.transform(
                1, /*Horizontal scaling. A value of 1 results in no scaling*/
                -0.5, /*Vertical skewing.*/
                0, /*Horizontal skewing.*/
                1,  /*Vertical scaling. A value of 1 results in no scaling.*/
                baseOffsetL + (side * 0.25) + sB * 9/8 , // /*Horizontal translation (moving).*/
                baseOffsetT + (side * 13/8) - sB * 1.2 /*Vertical translation (moving).*/
                );


            ctx.drawImage(
                img, // image to draw
                hB*11+1, // image left (x) crop offset
                hB*9+1,  // image top (y) crop offset
                sB*3-2, // image crop width
                hB*3-2, // image crop height
                0, // placement left (x) offset
                0, // placement top (y) offset
                (w * 3/8)* 1.1, // placement width
                (h * 1.5)* 1.1 // placement height
                ); 
            ctx.restore();
            ctx.save();



            //left arm top overlay
            ctx.transform(
                1, /*Horizontal scaling. A value of 1 results in no scaling*/
                -0.5, /*Vertical skewing.*/
                1, /*Horizontal skewing.*/
                0.5,  /*Vertical scaling. A value of 1 results in no scaling.*/
                baseOffsetL - (side * 1.5/8) + sB * 0.667 + 1, // /*Horizontal translation (moving).*/
                baseOffsetT + (side * 10/8) - (sB * 0.334) +  1 // /*Vertical translation (moving).*/
                );

            ctx.drawImage(
                img, // image to draw
                hB*11+1, // image left (x) crop offset
                hB*8+1,  // image top (y) crop offset
                sB*3-2, // image crop width
                hB-2, // image crop height
                0, // placement left (x) offset
                0, // placement top (y) offset
                (w * 3/8) * 1.1, // placement width
                (w/2) * 1.1 // placement height
                ); 

            ctx.restore();
            ctx.save();


        } else {


            // left arm side
            ctx.transform(
                1, /*Horizontal scaling. A value of 1 results in no scaling*/
                0.5, /*Vertical skewing.*/
                0, /*Horizontal skewing.*/
                1,  /*Vertical scaling. A value of 1 results in no scaling.*/
                baseOffsetL - (side * 0.25) + sB/2 + sB/16, // /*Horizontal translation (moving).*/
                baseOffsetT + side * 11/8 + sB/4 // /*Vertical translation (moving).*/
                );

            ctx.drawImage(
                img, // image to draw
                hB*10+1, // image left (x) crop offset
                hB*5+1,  // image top (y) crop offset
                hB-2, // image crop width
                hB*3-2, // image crop height
                0, // placement left (x) offset
                0, // placement top (y) offset
                w/2, // placement width
                h * 1.5 // placement height
                ); 
            ctx.restore();
            ctx.save();
            


            // left arm face
            ctx.transform(
                1, /*Horizontal scaling. A value of 1 results in no scaling*/
                -0.5, /*Vertical skewing.*/
                0, /*Horizontal skewing.*/
                1,  /*Vertical scaling. A value of 1 results in no scaling.*/
                baseOffsetL + (side * 0.25) + sB/8, // /*Horizontal translation (moving).*/
                baseOffsetT + (side * 13/8) //+ sB/4 // /*Vertical translation (moving).*/
                );

            ctx.drawImage(
                img, // image to draw
                hB*11+1, // image left (x) crop offset
                hB*5+1,  // image top (y) crop offset
                hB-2, // image crop width
                hB*3-2, // image crop height
                0, // placement left (x) offset
                0, // placement top (y) offset
                w/2, // placement width
                h * 1.5 // placement height
                ); 
            ctx.restore();
            ctx.save();

            
            //left arm top
            ctx.transform(
                1, /*Horizontal scaling. A value of 1 results in no scaling*/
                -0.5, /*Vertical skewing.*/
                1, /*Horizontal skewing.*/
                0.5,  /*Vertical scaling. A value of 1 results in no scaling.*/
                baseOffsetL - (side * 1.5/8), // /*Horizontal translation (moving).*/
                baseOffsetT + (side * 11/8) + sB/4 + 1 // /*Vertical translation (moving).*/
                );

            ctx.drawImage(
                img, // image to draw
                hB*11+1, // image left (x) crop offset
                hB*4+1,  // image top (y) crop offset
                hB-2, // image crop width
                hB-2, // image crop height
                0, // placement left (x) offset
                0, // placement top (y) offset
                w/2, // placement width
                w/2 // placement height
                ); 
            ctx.restore();
            ctx.save();

            if (this.type == TYPE_NEW) {
                // overlays

                // left arm side overlay
                ctx.transform(
                    1, /*Horizontal scaling. A value of 1 results in no scaling*/
                    0.5, /*Vertical skewing.*/
                    0, /*Horizontal skewing.*/
                    1,  /*Vertical scaling. A value of 1 results in no scaling.*/
                    baseOffsetL - (side * 0.25) + sB/2 - w/8 * 0.3344, // /*Horizontal translation (moving).*/
                    baseOffsetT + side * 10/8 + sB/4  + 1
                    );

                ctx.drawImage(
                    img, // image to draw
                    hB*10+1, // image left (x) crop offset
                    hB*9+1,  // image top (y) crop offset
                    hB-2, // image crop width
                    hB*3-2, // image crop height
                    0, // placement left (x) offset
                    0, // placement top (y) offset
                    (w * 1.1) /2, // placement width
                    (h * 1.1) * 1.5 // placement height
                    ); 
                ctx.restore();
                ctx.save();

                // left arm face overlay
                ctx.transform(
                    1, /*Horizontal scaling. A value of 1 results in no scaling*/
                    -0.5, /*Vertical skewing.*/
                    0, /*Horizontal skewing.*/
                    1,  /*Vertical scaling. A value of 1 results in no scaling.*/
                    baseOffsetL + (side * 0.25) + sB/8, // /*Horizontal translation (moving).*/
                    baseOffsetT + (side * 13/8)  - sB * 0.75  // /*Vertical translation (moving).*/
                    );


                ctx.drawImage(
                    img, // image to draw
                    hB*11+1, // image left (x) crop offset
                    hB*9+1,  // image top (y) crop offset
                    hB-2, // image crop width
                    hB*3-2, // image crop height
                    0, // placement left (x) offset
                    0, // placement top (y) offset
                    (w/2)* 1.1, // placement width
                    (h * 1.5)* 1.1 // placement height
                    ); 
                ctx.restore();
                ctx.save();

                //left arm top overlay
                ctx.transform(
                    1, /*Horizontal scaling. A value of 1 results in no scaling*/
                    -0.5, /*Vertical skewing.*/
                    1, /*Horizontal skewing.*/
                    0.5,  /*Vertical scaling. A value of 1 results in no scaling.*/
                    //baseOffsetL - (side * 1.5/8) + sB * 0.667 + 1, // /*Horizontal translation (moving).*/
                    baseOffsetL - (side * 1.5/8) - (sB * 0.25), // /*Horizontal translation (moving).*/
                    baseOffsetT + (side * 11/8)  - (sB * 0.667) +  1 // /*Vertical translation (moving).*/
                    //baseOffsetT + (side * 10/8) - (sB * 0.334) +  1 // /*Vertical translation (moving).*/
                    );

                ctx.drawImage(
                    img, // image to draw
                    hB*11+1, // image left (x) crop offset
                    hB*8+1,  // image top (y) crop offset
                    hB-2, // image crop width
                    hB-2, // image crop height
                    0, // placement left (x) offset
                    0, // placement top (y) offset
                    (w/2) * 1.1, // placement width
                    (w/2) * 1.1 // placement height
                    ); 

                ctx.restore();
                ctx.save();

            }

        }


        // ============== head ==============


        //right hair overlay
        ctx.transform(
            -1, /*Horizontal scaling. A value of 1 results in no scaling*/
            -0.5, /*Vertical skewing.*/
            0, /*Horizontal skewing.*/
            1,  /*Vertical scaling. A value of 1 results in no scaling.*/
            baseOffsetL + w*2 + sB * .667, /*Horizontal translation (moving).*/
            baseOffsetT - sB * 0.334//+ h /4 /*Vertical translation (moving).*/
            );

        ctx.drawImage(
            img, // image to draw
            blockSize*6+1, // image left (x) crop offset
            blockSize+1,  // image top (y) crop offset
            blockSize-2, // image crop width
            blockSize-2, // image crop height
            0, // placement left (x) offset
            0, // placement top (y) offset
            w * 1.1, // placement width
            h * 1.1 // placement height
            ); 
        
        ctx.restore();
        ctx.save();

        //back hair overlay
        ctx.transform(
            1, /*Horizontal scaling. A value of 1 results in no scaling*/
            -0.5, /*Vertical skewing.*/
            0, /*Horizontal skewing.*/
            1,  /*Vertical scaling. A value of 1 results in no scaling.*/
            baseOffsetL - w/8 * 0.667, /*Horizontal translation (moving).*/
            baseOffsetT - sB * 0.334//+ h /4 /*Vertical translation (moving).*/
            );

        ctx.drawImage(
            img, // image to draw
            blockSize*7+1, // image left (x) crop offset
            blockSize+1,  // image top (y) crop offset
            blockSize-2, // image crop width
            blockSize-2, // image crop height
            0, // placement left (x) offset
            0, // placement top (y) offset
            w * 1.1, // placement width
            h * 1.1 // placement height
            ); 
        
        ctx.restore();
        ctx.save();



        //head face
        ctx.transform(
            1, /*Horizontal scaling. A value of 1 results in no scaling*/
            -0.5, /*Vertical skewing.*/
            0, /*Horizontal skewing.*/
            1,  /*Vertical scaling. A value of 1 results in no scaling.*/
            baseOffsetL + w, /*Horizontal translation (moving).*/
            baseOffsetT + (w * 0.5) /*Vertical translation (moving).*/
            );
    
        ctx.drawImage(
            img, // image to draw
            blockSize+1, // image left (x) crop offset
            blockSize+1,  // image top (y) crop offset
            blockSize-2, // image crop width
            blockSize-2, // image crop height
            0, // placement left (x) offset
            0, // placement top (y) offset
            w, // placement width
            h // placement height
            ); 

        ctx.restore();
        ctx.save();

        //head left
        ctx.transform(
            1, /*Horizontal scaling. A value of 1 results in no scaling*/
            0.5, /*Vertical skewing.*/
            0, /*Horizontal skewing.*/
            1,  /*Vertical scaling. A value of 1 results in no scaling.*/
            baseOffsetL + 0.5, /*Horizontal translation (moving).*/
            baseOffsetT /*Vertical translation (moving).*/
            );

        ctx.drawImage(
            img, // image to draw
            1, // image left (x) crop offset
            blockSize+1,  // image top (y) crop offset
            blockSize-2, // image crop width
            blockSize-2, // image crop height
            0, // placement left (x) offset
            0, // placement top (y) offset
            w, // placement width
            h // placement height
            ); 

        ctx.restore();
        ctx.save();


        //head top
        ctx.transform(
            1, /*Horizontal scaling. A value of 1 results in no scaling*/
            -0.5, /*Vertical skewing.*/
            1, /*Horizontal skewing.*/
            0.5,  /*Vertical scaling. A value of 1 results in no scaling.*/
            baseOffsetL , /*Horizontal translation (moving).*/
            baseOffsetT + 1 /*Vertical translation (moving).*/
            );
        
        ctx.drawImage(
            img, // image to draw
            blockSize+1, // image left (x) crop offset
            1,  // image top (y) crop offset
            blockSize-2, // image crop width
            blockSize-2, // image crop height
            0, // placement left (x) offset
            0, // placement top (y) offset
            w, // placement width
            w // placement height
            ); 

        ctx.restore();
        ctx.save();


        //left hair overlay
        ctx.transform(
            1, /*Horizontal scaling. A value of 1 results in no scaling*/
            0.5, /*Vertical skewing.*/
            0, /*Horizontal skewing.*/
            1,  /*Vertical scaling. A value of 1 results in no scaling.*/
            baseOffsetL - w/8 * 0.667, /*Horizontal translation (moving).*/
            baseOffsetT - h/8 * 0.3334 + 1 /*Vertical translation (moving).*/
            );
        ctx.drawImage(
            img, // image to draw
            blockSize*4+1, // image left (x) crop offset
            blockSize+1,  // image top (y) crop offset
            blockSize-2, // image crop width
            blockSize-2, // image crop height
            0, // placement left (x) offset
            0, // placement top (y) offset
            w * 1.1, // placement width
            h * 1.1 // placement height
            ); 
        
        ctx.restore();
        ctx.save();



        // front hair overlay
        ctx.transform(
            1, /*Horizontal scaling. A value of 1 results in no scaling*/
            -0.5, /*Vertical skewing.*/
            0, /*Horizontal skewing.*/
            1,  /*Vertical scaling. A value of 1 results in no scaling.*/
            baseOffsetL + w, /*Horizontal translation (moving).*/
            baseOffsetT + h * 0.4625 /*Vertical translation (moving).*/
            );
        ctx.drawImage(
            img, // image to draw
            blockSize*5+1, // image left (x) crop offset
            blockSize+1,  // image top (y) crop offset
            blockSize-2, // image crop width
            blockSize-2, // image crop height
            0, // placement left (x) offset
            0, // placement top (y) offset
            w * 1.1, // placement width
            h * 1.1 // placement height
            ); 
        ctx.restore();
        ctx.save();


        // top hair overlay
        ctx.transform(
            1, /*Horizontal scaling. A value of 1 results in no scaling*/
            -0.5, /*Vertical skewing.*/
            1, /*Horizontal skewing.*/
            0.5,  /*Vertical scaling. A value of 1 results in no scaling.*/
            baseOffsetL - sB/1.75 - 1.5, //+ w, /*Horizontal translation (moving).*/
            baseOffsetT - sB/4 /*Vertical translation (moving).*/
            );

        ctx.drawImage(
            img, // image to draw
            hB*10+1, // image left (x) crop offset
            1,  // image top (y) crop offset
            blockSize-2, // image crop width
            blockSize-2, // image crop height
            0, // placement left (x) offset
            0, // placement top (y) offset
            w * 1.1 + 0.5, // placement width
            w * 1.1 + 0.5 // placement height
            ); 
        ctx.restore();
        ctx.save();


        
        let tmpImg = new Image();
        tmpImg.src = tmpCanvas.toBuffer();
        return tmpImg;
    }


    _internalGetHead = () => {
        if (this.img === null) this._makeScaledImage();

        const {side, blockSize, img} = this;
        const [rectWidth, rectHeight] = MinecraftSkin.getHeadImageDimensions(side);

        let tmpCanvas = canvas.createCanvas(rectWidth,rectHeight);
        let ctx = tmpCanvas.getContext("2d");

        // make upscaled image

        ctx.mozImageSmoothingEnabled = true;
        ctx.webkitImageSmoothingEnabled = true;
        ctx.msImageSmoothingEnabled = true;
        ctx.imageSmoothingEnabled = true;
        
        const hB = blockSize/2;
        const sB = blockSize/8;

        const baseOffsetL = side/8;
        const baseOffsetT = side/2 + sB/2;

        const w = side * 0.9;
        const h = side;


        ctx.clearRect(0, 0, canvas.width, canvas.height); // reset previous drawing (if any)
        ctx.save();


        // ============== head ==============

        //right hair overlay
        ctx.transform(
            -1, /*Horizontal scaling. A value of 1 results in no scaling*/
            -0.5, /*Vertical skewing.*/
            0, /*Horizontal skewing.*/
            1,  /*Vertical scaling. A value of 1 results in no scaling.*/
            baseOffsetL + w*2 + sB * .667, /*Horizontal translation (moving).*/
            baseOffsetT - sB * 0.334//+ h /4 /*Vertical translation (moving).*/
            );

        ctx.drawImage(
            img, // image to draw
            blockSize*6+1, // image left (x) crop offset
            blockSize+1,  // image top (y) crop offset
            blockSize-2, // image crop width
            blockSize-2, // image crop height
            0, // placement left (x) offset
            0, // placement top (y) offset
            w * 1.1, // placement width
            h * 1.1 // placement height
            ); 
        
        ctx.restore();
        ctx.save();

        //back hair overlay
        ctx.transform(
            1, /*Horizontal scaling. A value of 1 results in no scaling*/
            -0.5, /*Vertical skewing.*/
            0, /*Horizontal skewing.*/
            1,  /*Vertical scaling. A value of 1 results in no scaling.*/
            baseOffsetL - w/8 * 0.667, /*Horizontal translation (moving).*/
            baseOffsetT - sB * 0.334//+ h /4 /*Vertical translation (moving).*/
            );

        ctx.drawImage(
            img, // image to draw
            blockSize*7+1, // image left (x) crop offset
            blockSize+1,  // image top (y) crop offset
            blockSize-2, // image crop width
            blockSize-2, // image crop height
            0, // placement left (x) offset
            0, // placement top (y) offset
            w * 1.1, // placement width
            h * 1.1 // placement height
            ); 
        
        ctx.restore();
        ctx.save();



        //head face
        ctx.transform(
            1, /*Horizontal scaling. A value of 1 results in no scaling*/
            -0.5, /*Vertical skewing.*/
            0, /*Horizontal skewing.*/
            1,  /*Vertical scaling. A value of 1 results in no scaling.*/
            baseOffsetL + w, /*Horizontal translation (moving).*/
            baseOffsetT + (w * 0.5) /*Vertical translation (moving).*/
            );
    
        ctx.drawImage(
            img, // image to draw
            blockSize+1, // image left (x) crop offset
            blockSize+1,  // image top (y) crop offset
            blockSize-2, // image crop width
            blockSize-2, // image crop height
            0, // placement left (x) offset
            0, // placement top (y) offset
            w, // placement width
            h // placement height
            ); 

        ctx.restore();
        ctx.save();

            


        //head left
        ctx.transform(
            1, /*Horizontal scaling. A value of 1 results in no scaling*/
            0.5, /*Vertical skewing.*/
            0, /*Horizontal skewing.*/
            1,  /*Vertical scaling. A value of 1 results in no scaling.*/
            baseOffsetL + 0.5, /*Horizontal translation (moving).*/
            baseOffsetT /*Vertical translation (moving).*/
            );

        ctx.drawImage(
            img, // image to draw
            1, // image left (x) crop offset
            blockSize+1,  // image top (y) crop offset
            blockSize-2, // image crop width
            blockSize-2, // image crop height
            0, // placement left (x) offset
            0, // placement top (y) offset
            w, // placement width
            h // placement height
            ); 

        ctx.restore();
        ctx.save();


        //head top
        ctx.transform(
            1, /*Horizontal scaling. A value of 1 results in no scaling*/
            -0.5, /*Vertical skewing.*/
            1, /*Horizontal skewing.*/
            0.5,  /*Vertical scaling. A value of 1 results in no scaling.*/
            baseOffsetL , /*Horizontal translation (moving).*/
            baseOffsetT + 1 /*Vertical translation (moving).*/
            );
        
        ctx.drawImage(
            img, // image to draw
            blockSize+1, // image left (x) crop offset
            1,  // image top (y) crop offset
            blockSize-2, // image crop width
            blockSize-2, // image crop height
            0, // placement left (x) offset
            0, // placement top (y) offset
            w, // placement width
            w // placement height
            ); 

        ctx.restore();
        ctx.save();


        //left hair overlay
        ctx.transform(
            1, /*Horizontal scaling. A value of 1 results in no scaling*/
            0.5, /*Vertical skewing.*/
            0, /*Horizontal skewing.*/
            1,  /*Vertical scaling. A value of 1 results in no scaling.*/
            baseOffsetL - w/8 * 0.667, /*Horizontal translation (moving).*/
            baseOffsetT - h/8 * 0.3334 + 1 /*Vertical translation (moving).*/
            );
        ctx.drawImage(
            img, // image to draw
            blockSize*4+1, // image left (x) crop offset
            blockSize+1,  // image top (y) crop offset
            blockSize-2, // image crop width
            blockSize-2, // image crop height
            0, // placement left (x) offset
            0, // placement top (y) offset
            w * 1.1, // placement width
            h * 1.1 // placement height
            ); 
        
        ctx.restore();
        ctx.save();



        // front hair overlay
        ctx.transform(
            1, /*Horizontal scaling. A value of 1 results in no scaling*/
            -0.5, /*Vertical skewing.*/
            0, /*Horizontal skewing.*/
            1,  /*Vertical scaling. A value of 1 results in no scaling.*/
            baseOffsetL + w, /*Horizontal translation (moving).*/
            baseOffsetT + h * 0.4625 /*Vertical translation (moving).*/
            );
        ctx.drawImage(
            img, // image to draw
            blockSize*5+1, // image left (x) crop offset
            blockSize+1,  // image top (y) crop offset
            blockSize-2, // image crop width
            blockSize-2, // image crop height
            0, // placement left (x) offset
            0, // placement top (y) offset
            w * 1.1, // placement width
            h * 1.1 // placement height
            ); 
        ctx.restore();
        ctx.save();


        // top hair overlay
        ctx.transform(
            1, /*Horizontal scaling. A value of 1 results in no scaling*/
            -0.5, /*Vertical skewing.*/
            1, /*Horizontal skewing.*/
            0.5,  /*Vertical scaling. A value of 1 results in no scaling.*/
            baseOffsetL - sB/1.75 - 1.5, //+ w, /*Horizontal translation (moving).*/
            baseOffsetT - sB/4 /*Vertical translation (moving).*/
            );

        ctx.drawImage(
            img, // image to draw
            hB*10+1, // image left (x) crop offset
            1,  // image top (y) crop offset
            blockSize-2, // image crop width
            blockSize-2, // image crop height
            0, // placement left (x) offset
            0, // placement top (y) offset
            w * 1.1 + 0.5, // placement width
            w * 1.1 + 0.5 // placement height
            ); 
        ctx.restore();
        ctx.save();


        let tmpImg = new Image();
        tmpImg.src = tmpCanvas.toBuffer();
        return tmpImg;
    }

    
    static getHeadImageDimensions(side) {
        return [side*2.175, side*2.175];
    }

    static getRenderImageDimensions(side) {
        return [side*2.5,side*5.1];
    }

    static generateToScaleImage = (side, image) => {

        const minWidth = side * 8;
        let newWidth = image.width;
        let newHeight = image.height;


        while (newWidth < minWidth) {
            newWidth *= 2;
            newHeight *= 2;
            // determine workable minimum scale width
        }

        let tmpCanvas = canvas.createCanvas(newWidth,newHeight);
        let tmpCtx = tmpCanvas.getContext("2d");

        tmpCanvas.width = newWidth;
        tmpCanvas.height = newHeight;

        // make upscaled image

        tmpCtx.mozImageSmoothingEnabled = false;
        tmpCtx.webkitImageSmoothingEnabled = false;
        tmpCtx.msImageSmoothingEnabled = false;
        tmpCtx.imageSmoothingEnabled = false;


        tmpCtx.drawImage(image, 0, 0, tmpCanvas.width, tmpCanvas.height);


        let tmpImg = new Image();
        tmpImg.src = tmpCanvas.toBuffer();
        return tmpImg;
    };

    
    static getSideForRender(imageWidth) {
        return Math.floor(imageWidth/2.5);
    }

    static getSideForHead(imageWidth) {
        return Math.floor(imageWidth/2.05);
    }
}

module.exports = MinecraftSkin;