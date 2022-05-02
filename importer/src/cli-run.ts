import { readFile } from 'fs/promises';
import ora from 'ora';
import { homedir } from 'os';
import path from 'path';
import { parseFile, parseStream } from './csv.js';
import { CompareSchemaResult, createProcessor, TableInfo } from './processor.js';
import { splitCommas } from './utils.js';
import { XataApiClient } from '@xata.io/client';
import fetch from 'cross-fetch';
import prompts from 'prompts';
import { parseConfigFile } from './config.js';

const spinner = ora();

export async function run(
  file: string,
  { table, columns, types, noheader, format, create, force, branch, xatadir }: Record<string, unknown>
) {
  if (typeof table !== 'string') {
    return exitWithError('The table name is a required flag');
  }
  if (format !== 'csv') {
    return exitWithError('The only supported format right now is csv');
  }

  const apiKey = await readKey();
  const config = await readConfigFile(String(xatadir));
  const xata = new XataApiClient({ apiKey, fetch });

  const tableInfo: TableInfo = {
    workspaceID: config.workspaceID,
    database: config.dbName,
    branch: String(branch),
    tableName: table
  };

  const options = createProcessor(xata, tableInfo, {
    types: splitCommas(types),
    columns: splitCommas(columns),
    noheader: Boolean(noheader),
    async shouldContinue(compare) {
      return Boolean(await shouldContinue(compare, table, create, force));
    }
  });

  try {
    if (file === '-') {
      await parseStream(process.stdin, options);
    } else {
      await parseFile(file, options);
    }
  } catch (err) {
    exitWithError(err);
  }
}

async function readKey() {
  // TODO: is this the same for windows?
  const keyPath = path.join(homedir(), '.config', 'xata', 'key');
  try {
    return await readFile(keyPath, 'utf-8');
  } catch (err) {
    exitWithError(
      `Could not read API Key at ${keyPath}. Please install the Xata CLI and run xata login. More information at https://github.com/xataio/cli`
    );
    throw err;
  }
}

async function readConfigFile(xatadir: string) {
  const configPath = path.join(xatadir, 'config.json');
  let input: string;
  try {
    input = await readFile(configPath, 'utf-8');
  } catch (err) {
    exitWithError(`Could not read config file at ${configPath}`);
    throw err;
  }
  try {
    return await parseConfigFile(input);
  } catch (err) {
    exitWithError(`Configuration file at ${input} seems to have a wrong format`);
    throw err;
  }
}

function exitWithError(err: unknown) {
  const message = (err as any).message || err;
  spinner.fail(typeof message === 'string' ? message : JSON.stringify(message));
  process.exit(1);
}

export async function shouldContinue(
  compare: CompareSchemaResult,
  table: string,
  create: unknown,
  force: unknown
): Promise<boolean | void> {
  const errorMessages: string[] = [];
  compare.columnTypes.forEach((type) => {
    if (type.error) {
      errorMessages.push(
        `Column ${type.columnName} exists with type ${type.schemaType} but a type of ${type.castedType} would be needed.`
      );
    }
  });
  if (errorMessages.length > 0) {
    return exitWithError(errorMessages.join('\n'));
  }

  if (!create) {
    if (compare.missingTable) {
      return exitWithError(`Table ${table} does not exist. Use --create to create it`);
    }
    if (compare.missingColumns.length > 0) {
      const missing = compare.missingColumns.map((col) => col.column);
      return exitWithError(`These columns are missing: ${missing.join(', ')}. Use --create to create them`);
    }
  } else {
    if (compare.missingTable) {
      if (!force) {
        const response = await prompts({
          type: 'confirm',
          name: 'confirm',
          message: `Table ${table} does not exist. Do you want to create it?`
        });
        if (!response.confirm) return false;
      }
    } else if (compare.missingColumns.length > 0) {
      if (!force) {
        const missing = compare.missingColumns.map((col) => col.column);
        const response = await prompts({
          type: 'confirm',
          name: 'confirm',
          message: `These columns are missing: ${missing.join(', ')}. Do you want to create them?`
        });
        if (!response.confirm) return false;
      }
    }
  }

  return true;
}
