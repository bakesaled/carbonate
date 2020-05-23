export const defaultCsvOptions: CsvOptions = {
  sort: 'desc',
  mappings: {
    fitId: 'Id',
    amount: 'Amount',
    checkNumber: 'Check Number',
    dateAvailable: 'Date||Processed Date',
    datePosted: 'Date',
    memo: 'Description',
    name: 'Description',
    transactionType: 'Type',
    balance: 'RunningBalance',
  },
};

export interface CsvMappings {
  fitId?: string;
  datePosted?: string;
  dateAvailable?: string;
  amount?: string;
  transactionType?: string;
  name?: string;
  checkNumber?: string;
  memo?: string;
  balance?: string;
}
export class CsvOptions {
  sort?: 'asc' | 'desc';
  mappings: CsvMappings;

  constructor(options: CsvOptions = defaultCsvOptions) {
    this.sort = options.sort || defaultCsvOptions.sort;
    this.mappings = { ...defaultCsvOptions.mappings, ...options.mappings };
  }
}
