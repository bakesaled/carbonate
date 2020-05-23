import { StatementModel } from '../statement.model';
import { CsvOptions, defaultCsvOptions } from './csv-options';
import * as csvParser from 'csvtojson';
import { TransactionModel } from '../transaction.model';

export class CsvCarbonator {
  async carbonateStatement(
    csv: string,
    csvOptions: CsvOptions = defaultCsvOptions
  ): Promise<StatementModel> {
    const results = await csvParser().fromString(csv); // Papa.parse(csv);
    const statement: StatementModel = {
      transactions: this.transformToTransactions(results, csvOptions),
      ledgerBalance: this.parseMoney(
        this.getBalanceAmount(results, csvOptions)
      ),
      availableBalance: this.parseMoney(
        this.getBalanceAmount(results, csvOptions)
      ),
      balanceAsOf: new Date(),
    };
    // console.log('results csv', results);
    return statement;
  }

  private transformToTransactions(
    data: any[],
    csvOptions: CsvOptions
  ): TransactionModel[] {
    return data.map((row) => {
      return {
        fitId: this.findMapping(row, csvOptions.mappings.fitId),
        amount: this.parseMoney(
          this.findMapping(row, csvOptions.mappings.amount)
        ),
        datePosted: new Date(
          this.findMapping(row, csvOptions.mappings.datePosted)
        ),
        dateAvailable: new Date(
          this.findMapping(row, csvOptions.mappings.dateAvailable)
        ),
        checkNumber: this.findMapping(row, csvOptions.mappings.checkNumber),
        memo: this.findMapping(row, csvOptions.mappings.memo),
        name: this.findMapping(row, csvOptions.mappings.name),
        transactionType: this.findMapping(
          row,
          csvOptions.mappings.transactionType
        ),
      } as TransactionModel;
    });
  }

  private findMapping(row: any, propName: string) {
    if (propName.indexOf('||') > -1) {
      const names = propName.split('||');
      for (let i = 0; i < names.length; i++) {
        const name = names[i];
        if (row[name] && row[name].length) {
          return row[name];
        }
      }
    } else if (propName.indexOf('&&') > -1) {
      const names = propName.split('&&');
      let result = '';
      names.forEach((name) => {
        if (row[name] && row[name].length) {
          result += row[name];
        }
      });
      return result;
    } else {
      return row[propName];
    }
  }

  private getBalanceAmount(data: any[], csvOptions: CsvOptions) {
    console.log('bal', csvOptions, data[0]);
    // assume latest balance is first row for now.
    if (csvOptions.sort === 'desc') {
      return data[0][csvOptions.mappings.balance];
    } else {
      return data[data.length - 1][csvOptions.mappings.balance];
    }
  }

  private parseMoney(stringVal: string) {
    stringVal = stringVal.replace(/[^0-9.-]+/g, '');
    return Number(stringVal);
  }
}
