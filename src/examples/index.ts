import * as prompts from 'prompts';
import * as fs from 'fs';
import { OfxCarbonator } from '../ofx';
import { CsvCarbonator } from '../csv/csv.carbonator';
import { CsvOptions } from '../csv/csv-options';

const main = async () => {
  const choice = await prompts({
    type: 'select',
    name: 'value',
    message: 'Carbonate accounts or a statement?',
    choices: [
      { title: 'Accounts', value: 0 },
      { title: 'Statement', value: 1 },
    ],
  });
  const filePathAnswer = await prompts({
    type: 'text',
    name: 'filePath',
    message: 'file path: ',
    validate: (val) =>
      val !== null && val.length > 0 ? true : 'file path is required.',
  });

  if (filePathAnswer.filePath.toLowerCase().endsWith('.ofx')) {
    const ofxData = await readFile(filePathAnswer.filePath);
    console.log('file read');
    const ofxCarbonator = new OfxCarbonator();
    let results;
    try {
      if (choice.value) {
        console.log('carbonating statement...');
        results = await ofxCarbonator.carbonateStatement(ofxData);
      } else {
        console.log('carbonating accounts...');
        results = await ofxCarbonator.carbonateAccounts(ofxData);
      }
      console.log('results', results);
    } catch (e) {
      console.error('error', e);
    }
  } else if (filePathAnswer.filePath.toLowerCase().endsWith('.csv')) {
    const csvData = await readFile(filePathAnswer.filePath);
    console.log('file read');
    const csvCarbonator = new CsvCarbonator();
    let results;
    try {
      if (choice.value) {
        console.log('carbonating statement...');
        const cignaOptions: CsvOptions = new CsvOptions({
          mappings: {
            fitId: 'Processed Date&&Amount&&Description',
            transactionType: 'Description',
            checkNumber: 'Check Number',
            datePosted: 'Requested Date',
            dateAvailable: 'Processed Date',
            memo: 'Consumer Note',
            name: 'Consumer Note',
            balance: 'Available Cash Balance',
          },
        });
        results = await csvCarbonator.carbonateStatement(csvData, cignaOptions);
      } else {
        throw new Error('CSV account files are not supported.');
      }
      console.log('results', results);
    } catch (e) {
      console.error('error', e);
    }
  } else {
    throw new Error(`Unsupported file type`);
  }
};

function readFile(filePath): Promise<string> {
  return new Promise((resolve, reject) => {
    let ofxData = '';
    const readStream = fs.createReadStream(filePath);
    readStream
      .on('data', (data: string) => {
        ofxData += data;
      })
      .on('error', (e) => {
        reject(e);
      })
      .on('end', () => {
        resolve(ofxData);
      });
  });
}

main();
