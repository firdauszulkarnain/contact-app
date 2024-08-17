const express = require('express')
const expressLayouts = require('express-ejs-layouts');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const flash = require('connect-flash');
const { body, check, validationResult } = require('express-validator');

// Override Method
const methodOverride = require('method-override');

require('./utils/db');
const Contact = require('./model/contact')

// Config Express
const app = express();
const port = 3000;

// Config Ejs
app.set('view engine', 'ejs');
app.use(expressLayouts);
app.use(express.static('public'));
app.use(express.urlencoded({extended: true}));

// config flash
app.use(cookieParser('secret'));
app.use(session({
  cookie: {maxAge : 6000},
  secret: 'secret',
  resave: true,
  saveUninitialized: true,
}));
app.use(flash());

// Use Method
app.use(methodOverride('_method'))

// Home
app.get('/', (req, res) => {
    res.render('index',  {title : 'Home', layout : 'layouts/main'});
})

// About
app.get('/about', (req, res) => {
    res.render('about', {title : 'About', layout : 'layouts/main'});
})

// Contact
app.get('/contact', async (req, res) => {
    const contacts = await Contact.find();
    res.render('contact',   {
      title : 'Contact', 
      layout : 'layouts/main',
      contacts,
      msg: req.flash('msg'),
    });
});

app.get('/contact/add', (req, res) => {
  res.render('add_contact',{
    title : 'Add Contact',
    layout: 'layouts/main',
  });
});

// process save data contact
app.post('/contact',
    [
      body('nama').custom( async (value) => {
          const duplicate = await Contact.findOne({ nama: value }).exec();
          if(duplicate){
            throw new Error('Nama Contact Sudah Ada.');
          }
          return true;
      }),
      check('email', 'Email Tidak Valid!').isEmail(),
      check('notelp', 'No Telp Tidak Valid!').isMobilePhone('id-ID'),
    ],
    async (req, res) => {
    const errors = validationResult(req);
    if(!errors.isEmpty()){
      // return res.status(400).json({ errors: errors.array() });
      res.render('add_contact',   {
        title : 'Add Contact', 
        layout : 'layouts/main',
        errors : errors.array()
      });
    }else{
      const result = await Contact.insertMany([req.body]);
      if(result.length > 0){
        console.log('result', result);
        req.flash('msg', 'Data Contact Berhasil Ditambahkan');
        res.redirect('/contact');
      }
    }
});

// Delete Contact
app.delete('/contact', async (req, res) => {
    const result = await Contact.deleteOne({ nama: req.body.nama });
    if(result.deletedCount > 0){
      req.flash('msg', 'Data Contact Berhasil DiHapus');
      res.redirect('/contact');
    }
})

// Edit Contact
app.get('/contact/edit/:nama', async (req, res) => {
  const contact = await Contact.findOne({ nama: req.params.nama }).exec();
  res.render('update_contact',{
    title : 'Update Contact',
    layout: 'layouts/main',
    contact
  });
});

// Proccess Update Data
app.put('/contact',
    [
      body('nama').custom( async (value, {req}) => {
          const duplicate = await Contact.findOne({ nama: value }).exec();
          if(value !== req.body.oldNama && duplicate){
            throw new Error('Nama Contact Sudah Ada.');
          }
          return true;
      }),
      check('email', 'Email Tidak Valid!').isEmail(),
      check('notelp', 'No Telp Tidak Valid!').isMobilePhone('id-ID'),
    ],
    (req, res) => {
    const errors = validationResult(req);
    if(!errors.isEmpty()){
      res.render('update_contact',   {
        title : 'Update Contact', 
        layout : 'layouts/main',
        errors : errors.array(),
        contact : req.body
      });
    }else{
      Contact.updateOne(
        {_id: req.body._id},
        {
          $set : {
            nama: req.body.nama,
            email: req.body.email,
            notelp: req.body.notel
          }
        }
      ).then((result) => {
        req.flash('msg', 'Data Contact Berhasil Diupdate');
        res.redirect('/contact');
      });
    }
});


// Detail Contact
app.get('/contact/:nama', async (req, res) => {
  const contact = await Contact.findOne({ nama: req.params.nama }).exec();
  res.render('detail_contact',   {
    title : 'Detail Contact', 
    layout : 'layouts/main',
    contact
  });
})

app.listen(port, () => {
    console.log(`Mongo Contact App | Listening at http://localhost:${port}`)
})
