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

app.locals.siteUrl = process.env.SITE_URL || 'https://neevararealty.com';
app.locals.siteName = 'Neevara Realty';
app.locals.seo = {
  ogImage: `${app.locals.siteUrl}/images/gallery-1.jpg`,
  phone: '+917707707708',
  address: 'Bizzbay Business Hub, Office No. 110, NIBM Road, Kondhwa Khurd, Pune – 411048, Maharashtra, India'
};

app.get('/', (req, res) => {
  res.render('index', {
    title: 'Neevara Realty — Premium Residences in Belagavi, Karnataka',
    description: 'Neevara Realty crafts premium apartments and luxury homes in Belagavi, Karnataka. Explore Haigreeva Meadows 2 BHK residences. Book a site visit today.',
    canonicalUrl: `${app.locals.siteUrl}/`,
    projects
  });
});

app.get('/projects/:slug', (req, res) => {
  const project = projects.find(p => p.slug === req.params.slug);
  if (!project) return res.status(404).render('index', { title: 'Page Not Found', projects });
  res.render('project', {
    title: `${project.name} — ${project.unitsLabel || project.type} | Neevara Realty`,
    description: project.about,
    canonicalUrl: `${app.locals.siteUrl}/projects/${project.slug}`,
    project,
    projects
  });
});

app.post('/contact', async (req, res) => {
  const { name, phone, email, message, project: projectName } = req.body;
  if (!name || !phone) {
    return res.json({ success: false, message: 'Please provide your name and phone number.' });
  }
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    return res.json({ success: true, message: 'Enquiry received. We will contact you shortly.' });
  }
  try {
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.EMAIL_PORT || '587'),
      secure: false,
      auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
      connectionTimeout: 10000,
      socketTimeout: 10000
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
