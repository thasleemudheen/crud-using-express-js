
const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const fs = require('fs');
const ejs = require('ejs');
const { v4: uuidv4 } = require('uuid'); 

const app = express();
const port =  3000;
const filePath = path.join(__dirname, 'user.json');

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

app.post('/submit_form', (req, res) => {
  const { name, age, phone, email, qualification } = req.body;

  const userId = uuidv4();

  const userDetails = { id: userId, name, age, phone, email, qualification };

  if (!name || !age || !phone || !email || !qualification) {
    return res.status(400).send('All fields are required.');
  }

  try {
    let fileData = fs.readFileSync(filePath, 'utf-8');

    const users = JSON.parse(fileData);

    users.push(userDetails);

    fs.writeFileSync(filePath, JSON.stringify(users, null, 2));
    res.redirect('/table');
  } catch (error) {
    console.error('Error:', error.message);
    res.status(500).send(`Internal Server Error: ${error.message}`);
  }
});

app.get('/table', (req, res) => {
  try {
    const fileData = fs.readFileSync(filePath, 'utf-8');
    const users = JSON.parse(fileData);

    res.render('table', { users });
  } catch (error) {
    console.error('Error:', error.message);
    res.status(500).send(`Internal Server Error: ${error.message}`);
  }
});

app.get('/edit/:id', (req, res) => {
  const userId = req.params.id;

  try {
    let fileData = fs.readFileSync(filePath, 'utf-8');

    const users = JSON.parse(fileData);

    const user = users.find(user => user.id === userId);

    if (user) {
      res.render('editform', { user });
    } else {
      res.status(404).send('User not found.');
    }
  } catch (error) {
    console.error('Error:', error.message);
    res.status(500).send(`Internal Server Error: ${error.message}`);
  }
});

app.post('/edit/:id', (req, res) => {
  const userId = req.params.id;
  const { name, age, phone, email, qualification } = req.body;

  try {
    let fileData = fs.readFileSync(filePath, 'utf-8');

    const users = JSON.parse(fileData);

    const userIndex = users.findIndex(user => user.id === userId);

    if (userIndex !== -1) {
      users[userIndex] = { id: userId, name, age, phone, email, qualification };

      fs.writeFileSync(filePath, JSON.stringify(users, null, 2));

      console.log('User updated:', userId);

      res.redirect('/table');
    } else {
      res.status(404).send('User not found.');
    }
  } catch (error) {
    console.error('Error:', error.message);
    res.status(500).send(`Internal Server Error: ${error.message}`);
  }
});

app.get('/delete/:id', (req, res) => {
  const userId = req.params.id;

  try {
    let fileData = fs.readFileSync(filePath, 'utf-8');

    const users = JSON.parse(fileData);

    const userIndex = users.findIndex(user => user.id === userId);

    if (userIndex !== -1) {
      users.splice(userIndex, 1);

      fs.writeFileSync(filePath, JSON.stringify(users, null, 2));

      console.log('User deleted:', userId);
      
      res.redirect('/table');
    } else {
      res.status(404).send('User not found.');
    }
  } catch (error) {
    console.error('Error:', error.message);
    res.status(500).send(`Internal Server Error: ${error.message}`);
  }
});
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});
app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});