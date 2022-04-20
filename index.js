const fs = require('fs');
const Imap = require('imap');
require('dotenv').config();
const { simpleParser } = require('mailparser');
const imapConfig = {
  user: 'londheshubham68@gmail.com',
  password: process.env.password,
  host: 'imap.gmail.com',
  port: 993,
  tls: true,
};

let emailData = [];

const getEmails = () => {
  try {
    const imap = new Imap(imapConfig);
    imap.once('ready', () => {
      imap.openBox('INBOX', false, () => {
        imap.search(['ALL', ['SINCE', new Date('2022-04-11')]], (err, results) => {
          const f = imap.fetch(results, { bodies: '' });
          f.on('message', msg => {
            msg.on('body', stream => {
              simpleParser(stream, async (err, parsed) => {
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


const checkIncomingOrDeletedEmails = () => {
  try {
    const imap = new Imap(imapConfig);
    imap.on('ready', () => {
      imap.openBox('INBOX', true, (err, box) => {
        if (err) console.log(err)
        else console.log('inbox is being monitored')
        imap.on('mail', function () {
          console.log('you have received a new email');
        });
        imap.on('expunge', function () {
          console.log('an email has been deleted from the inbox');
        })
      })
    })
    imap.once('error', err => {
      console.log(err);
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

checkIncomingOrDeletedEmails();

