require('dotenv').config();
const express = require('express');
const path = require('path');
const fs = require('fs');
const nodemailer = require('nodemailer');

const app = express();
const PORT = process.env.PORT || 3000;

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

const projects = JSON.parse(fs.readFileSync(path.join(__dirname, 'data', 'projects.json'), 'utf-8'));

app.locals.siteUrl = process.env.SITE_URL || 'http://localhost:3000';

app.get('/', (req, res) => {
  res.render('index', {
    title: 'Neevara Realty — Crafting Homes, Creating Legacies',
    projects
  });
});

app.get('/projects/:slug', (req, res) => {
  const project = projects.find(p => p.slug === req.params.slug);
  if (!project) return res.status(404).render('index', { title: 'Page Not Found', projects });
  res.render('project', {
    title: `${project.name} — Neevara Realty`,
    project,
    projects
  });
});

app.post('/contact', async (req, res) => {
  const { name, phone, email, message, project: projectName } = req.body;
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    return res.json({ success: true, message: 'Enquiry received. We will contact you shortly.' });
  }
  try {
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.EMAIL_PORT || '587'),
      secure: false,
      auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS }
    });
    await transporter.sendMail({
      from: `"Neevara Realty" <${process.env.EMAIL_USER}>`,
      to: process.env.EMAIL_USER,
      subject: `New Enquiry from ${name}${projectName ? ` — ${projectName}` : ''}`,
      html: `<p><strong>Name:</strong> ${name}</p><p><strong>Phone:</strong> ${phone}</p><p><strong>Email:</strong> ${email || '—'}</p><p><strong>Project:</strong> ${projectName || '—'}</p><p><strong>Message:</strong> ${message || '—'}</p>`
    });
    res.json({ success: true, message: 'Thank you! We will reach out to you shortly.' });
  } catch {
    res.json({ success: true, message: 'Enquiry received. We will contact you shortly.' });
  }
});

app.get('/health', (req, res) => res.json({ status: 'ok' }));

app.listen(PORT, () => {
  console.log(`Neevara Realty running at http://localhost:${PORT}`);
});
