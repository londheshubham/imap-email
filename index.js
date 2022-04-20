const fs = require('fs');
const Imap = require('imap');
require('dotenv').config();
const {simpleParser} = require('mailparser');
const imapConfig = {
  user: 'londheshubham68@gmail.com',
  password: process.env.password,
  host: 'imap.gmail.com',
  port: 993,
  tls: true,
};

let emailData = [];

const getEmails = () => {
  console.log(process.env.password);
    try {
      const imap = new Imap(imapConfig);
      imap.once('ready', () => {
        imap.openBox('INBOX', false, () => {
          imap.search(['UNSEEN', ['SINCE', new Date()]], (err, results) => {
            const f = imap.fetch(results, {bodies: ''});
            f.on('message', msg => {
              msg.on('body', stream => {
                simpleParser(stream, async (err, parsed) => {
                  console.log(process.env.password);
                    saveData(parsed)
                });
              });
            });
            f.once('error', ex => {
              return Promise.reject(ex);
            });
            f.once('end', () => {
              console.log('Done fetching all messages!');
              imap.end();
            });
          });
        });
      });  
      imap.once('error', err => {
        console.log(err);
      });
  
      imap.once('end', () => {
        console.log('Connection ended');
        writeDataToJson()
      });
  
      imap.connect();
    } catch (ex) {
      console.log('an error occurred');
    }
  };
  
  const saveData = (data) => {
    const obj = {
        subject: data.subject,
        date: data.date,
        text: data.text,
        textAsHtml: data.textAsHtml,
    };
    emailData.push(obj);
  }

  const writeDataToJson = () => {
    const jsonToBeWritten = JSON.stringify(emailData, null, 2);
    fs.writeFileSync('data.json', jsonToBeWritten);
  }

  getEmails();
