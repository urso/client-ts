import { BaseCommand } from '../../base.js';

export default class Browse extends BaseCommand {
  static description = 'Open the current database in the browser';

  static examples = [];

  static flags = {};

  static args = [];

  async run(): Promise<void> {
    // const { args, flags } = await this.parse(Browse);

    this.error('To be done');
  }
}