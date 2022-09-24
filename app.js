
const Jimp = require('jimp');
const inquirer = require('inquirer');
const { existsSync } = require ('node:fs');
const floydSteinberg = require('floyd-steinberg');

let namewithExtensionInput= null

const startApp =async () =>{

    const answer = await inquirer.prompt([{
        name: 'start',
        messege: 'Hi! Welcome to "Watermark manager". Copy your image files to `/img` folder. Then you\'ll be able to use them in the app. Are you ready?',
        type:'confirm'
    }]);

    if(!answer.start)process.exit();

    const options = await inquirer.prompt([{
        name: 'inputImage',
        type: 'input',
        message: 'what file do you want to mark ?',
        default: 'test.jpg'
    },{
        name:'watermarkType',
        type:'list',
        choices: ['Text watermark', 'Image watermark','B&W'],
    }])

    if(options.watermarkType === 'Text watermark'){
        const text = await inquirer.prompt([{
            name: 'value',
            type:'input',
            messege: 'Type your watermatk text:'
        }])
        options.watermarkText = text.value;
        prepareOutputFilename(options.inputImage,options.watermarkText) 
        
        
    }else if(options.watermarkType === 'Image watermark') {
        const image = await inquirer.prompt([{
            name:'filename',
            type: 'input',
            message:'type your watermark name:',
            default: 'logo.png',
        }])
        options.watermarkImage = image.filename;
        //addImageWatermarkToImage('./img/' + options.inputImage, './test-with-watermark.jpg', './img/' + options.watermarkImage);
        prepareOutputFilename(options.inputImage, options.watermarkImage,options.watermarkImage)
    }else if(options.watermarkType === 'B&W'){
        makeBW(options.inputImage)
    }

}
startApp()


const addTextWatermarkToImage = async function(inputFile, outputFile, text) {
    try{
        const image = await Jimp.read(inputFile);
        const font = await Jimp.loadFont(Jimp.FONT_SANS_32_BLACK);
        const textData={
            text,
            alignmentX: Jimp.HORIZONTAL_ALIGN_CENTER,
            alignmentY: Jimp.VERTICAL_ALIGN_MIDDLE,
        }
        image.print(font, 0, 0, textData, image.getWidth(), image.getHeight());
        await image.quality(100).writeAsync(outputFile);
    }
    catch(error){
        console.log('Something went wrong... Try again!')
    }
};
  
const addImageWatermarkToImage = async function(inputFile, outputFile, watermarkFile) {
    try{    // normal code, it may throw an error at some point
        const image = await Jimp.read(inputFile);
        const watermark = await Jimp.read(watermarkFile);
        const x = image.getWidth() / 2 - watermark.getWidth() / 2;
        const y = image.getHeight() / 2 - watermark.getHeight() / 2;
        image.composite(watermark, x, y, {
            mode: Jimp.BLEND_SOURCE_OVER,
            opacitySource: 0.5,
        });
        await image.quality(100).writeAsync(outputFile);
    }
    catch(error){ // if there's an error, we catch it and show it in console
        console.log('Something went wrong... Try again!')
    }
};

const prepareOutputFilename = (param, text,img) => {
    if (!existsSync('./img/'+param)){
        console.log('The path not exists, Something went wrong... Try again.');
    }else{
        namewithExtensionInput =param.split('.'); 
        const fileExtension = namewithExtensionInput[1]
        const nameInput = namewithExtensionInput[0]
        if(!img){
            addTextWatermarkToImage('./img/' + param, 'przerobiony-'+ nameInput + '.' + fileExtension, text);
        }else{
            addImageWatermarkToImage('./img/' + param, 'przerobiony-'+ nameInput + '.' + fileExtension, './img/'+ text);
        }
        console.log('!!!!! Success !!!!!')
        startApp()
   } 
}
// const makeBW = (filename) =>{

//     Jimp.read('./img/'+filename, function (err, image) {
//         if (err) throw err;
//         image.autocrop().scaleToFit(256, 256)
//         //.rgba(false).greyscale().contrast(1).posterize(2)
//         image.bitmap = floydSteinberg(image.bitmap)
//         image.write("out.png")
//         })


// }

