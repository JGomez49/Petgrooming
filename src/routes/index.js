const {Router} = require('express');
const router = Router();

const moment = require('moment');

const path = require('path');
//Se debe importar este path para poder trabajar con rutas del sistema
//y se usa con unlink en este modulo.
const {unlink} = require('fs-extra');
//Unlink sirve para eliminar la imagen tambien del folder Uploads

//Esta constante image es la que me permite crear una nueva
//imagen y guardarla en la base de datos

// const Image = require('../models/BORRAR_Image');
const Registro = require('../models/BORRAR_Registro');
const ImageMirelleDog = require('../models/ImageMirelleDog');

const cloudinary = require('cloudinary');
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});


router.get('/', async(req,res)=>{
    const imagesMirelleDog = await ImageMirelleDog.find();
    //console.log(images);
    res.render('index.ejs', {imagesMirelleDog: imagesMirelleDog});
});




router.get('/client/:id', async(req,res)=>{
    const {id} = req.params;
    const imagesMirelleDog = await ImageMirelleDog.find();
    res.render('clients.ejs', {
        imagesMirelleDog : imagesMirelleDog,
        clientid : id
    });
});


router.get('/upload', (req,res)=>{
    res.render('upload.ejs');
});


router.post('/upload', async(req,res)=>{
    const image = new ImageMirelleDog();
    //el req.body es lo que se recibe desde el formulario
    console.log('Esto es el req de Image: ' + req);
    const result = await cloudinary.v2.uploader.upload(req.file.path);
        image.title = req.body.title;
        image.description = req.body.description;
        image.filename = req.file.filename;
        //image.path = 'img/uploads/' + req.file.filename;
        image.path = result.url;
        image.public_id = result.public_id;
        image.originalname = req.file.originalname;
        image.mimetype = req.file.mimetype;
        image.size = req.file.size;
        // image.portada = req.body.portada;
        image.precio = req.body.precio;
        // image.adicionar = req.body.adicionar;
        // image.veces = req.body.veces;
        image.comments = req.body.comments;
        image.fecha_upload = moment().format('LL');

        image.kin_name = req.body.kin_name;
        image.phone = req.body.phone;
        image.email = req.body.email;
        image.how = req.body.how;
        image.breed = req.body.breed;
        image.age = req.body.age;
        image.gender = req.body.gender;
        image.diet = req.body.diet;
        image.health = req.body.health;
        image.withanest = req.body.withanest;
        image.noanest = req.body.noanest;

    //await unlink(path.resolve('./src/public/' + image.path));
    await unlink(req.file.path);
    await image.save();
    //console.log(image);
    res.redirect('/');
});


router.post('/historial', async(req,res)=>{
    const registro = new Registro();
    registro.valor = req.body.valor;
    //     let options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    //     let today  = new Date();
    // registro.fecha = today.toLocaleDateString("en-US");
    registro.fecha = moment().format('LL'); 
        // let time = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
    registro.hora = moment().format('LTS');
    await registro.save();
    res.redirect('/clear');
});

router.get('/historial', async(req,res)=>{
    const registros = await Registro.find();
    console.log(registros);
    res.render('historial.ejs', {registros});
});




router.get('/image/:id', async(req,res)=>{
    const {id} = req.params;
    console.log('El id de la foto es: ' + id);
    const image = await ImageMirelleDog.findById(id);
    const images = await ImageMirelleDog.find();
    console.log('Esto es image: ' + image);
    // res.render('profile', {image: image});
    if (image.description == 'Almuerzos'){
        res.render('clients.ejs', {
            image: image,
            images: images
        });
    }else{
        res.render('profile.ejs', {
            image: image
        });
    }
});


router.get('/image/:id/delete', async(req,res)=>{
    console.log(req.params.id);
    const {id} = req.params;
    const image = await ImageMirelleDog.findByIdAndDelete(id);
            //Esto (arriba) elimina la imagen (ruta) de la base de datos,
            //y los datos se guardan en la constante image
    //await unlink(path.resolve('./src/public/' + image.path));
            //y esto elimina la imagen de uploads usando las propiedades de image.
    await cloudinary.v2.uploader.destroy(image.public_id);
            //Este es para borrar la imagen de Cloudinary
    res.redirect('/');
});


router.get('/registro/:id/delete', async(req,res)=>{
    console.log(req.params.id);
    const {id} = req.params;
    const registro = await Registro.findByIdAndDelete(id);
    res.redirect('/historial');
});




router.get('/image/:id/add', async(req,res)=>{
    console.log(req.params.id);
    const {id} = req.params;
    const image = await ImageMirelleDog.findById(id);
    const images = await ImageMirelleDog.findById();
    let veces = image.veces;
    veces = veces + 1;
    console.log("veces: " + veces);
    await ImageMirelleDog.findByIdAndUpdate(id, { 
        adicionar: "ON", 
        veces 
    });
    console.log(image);
    res.redirect('/clients');
});



router.get('/image/:id/dentalupload', async(req,res)=>{
    console.log('image id: ')
    console.log(req.params.id);
    console.log('_________')
    const {id} = req.params;
    // const image = await ImageMirelleDog.findById(id);
    // let veces = image.veces;
    // veces = veces + 1;
    // console.log("veces: "+veces);
    // await ImageMirelleDog.findByIdAndUpdate(id, { adicionar: "ON", veces });
    // console.log(image);
    // res.redirect('/clients');
    res.render('dentalupload.ejs', {id});
});


router.get('/image/:id/remove', async(req,res)=>{
    console.log(req.params.id);
    const {id} = req.params;
    const image = await ImageMirelleDog.findById(id);
    let veces = image.veces;
    veces = veces - 1;
    console.log("veces: "+veces);
    await ImageMirelleDog.findByIdAndUpdate(id, { adicionar: "OFF", veces});
    console.log(image);
    res.redirect('/');
});

router.get('/clear', async(req,res)=>{
    const images = await ImageMirelleDog.find();
    images.forEach(imagen => {
        clearOrden(ImageMirelleDog, imagen);
    });
    res.redirect('/');
});
async function clearOrden(Image,imagen){
    await Image.findByIdAndUpdate(imagen.id, { veces: 0 });
};


module.exports = router;