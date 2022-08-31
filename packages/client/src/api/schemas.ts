/**
 * Generated by @openapi-codegen
 *
 * @version 1.0
 */
export type User = {
  /*
   * @format email
   */
  email: string;
  fullname: string;
  image: string;
};

/**
 * @pattern [a-zA-Z0-9_-~:]+
 */
export type UserID = string;

export type UserWithID = User & {
  id: UserID;
};

/**
 * @format date-time
 * @x-go-type string
 */
export type DateTime = string;

/**
 * @pattern [a-zA-Z0-9_\-~]*
 */
export type APIKeyName = string;

/**
 * @pattern ^([a-zA-Z0-9][a-zA-Z0-9_\-~]+-)?[a-zA-Z0-9]{6}
 * @x-go-type auth.WorkspaceID
 */
export type WorkspaceID = string;

/**
 * @x-go-type auth.Role
 */
export type Role = 'owner' | 'maintainer';

export type WorkspaceMeta = {
  name: string;
  slug?: string;
};

export type Workspace = WorkspaceMeta & {
  id: WorkspaceID;
  memberCount: number;
  plan: 'free';
};

export type WorkspaceMember = {
  userId: UserID;
  fullname: string;
  /*
   * @format email
   */
  email: string;
  role: Role;
};

/**
 * @pattern [a-zA-Z0-9]+
 */
export type InviteID = string;

export type WorkspaceInvite = {
  inviteId: InviteID;
  /*
   * @format email
   */
  email: string;
  /*
   * @format date-time
   */
  expires: string;
  role: Role;
};

export type WorkspaceMembers = {
  members: WorkspaceMember[];
  invites: WorkspaceInvite[];
};

/**
 * @pattern ^ik_[a-zA-Z0-9]+
 */
export type InviteKey = string;

/**
 * Metadata of databases
 */
export type DatabaseMetadata = {
  /*
   * The machine-readable name of a database
   */
  name: string;
  /*
   * The human-readable name of a database
   */
  displayName: string;
  /*
   * The time this database was created
   */
  createdAt: DateTime;
  /*
   * The number of branches the database has
   */
  numberOfBranches: number;
  /*
   * Metadata about the database for display in Xata user interfaces
   */
  ui?: {
    /*
     * The user-selected color for this database across interfaces
     */
    color?: string;
  };
};

export type ListDatabasesResponse = {
  /*
   * A list of databases in a Xata workspace
   */
  databases?: DatabaseMetadata[];
};

export type ListBranchesResponse = {
  databaseName: string;
  displayName: string;
  branches: Branch[];
};

export type ListGitBranchesResponse = {
  mapping: {
    gitBranch: string;
    xataBranch: string;
  }[];
};

export type Branch = {
  name: string;
  createdAt: DateTime;
};

/**
 * @example {"repository":"github.com/my/repository","branch":"feature-login","stage":"testing","labels":["epic-100"]}
 * @x-go-type xata.BranchMetadata
 */
export type BranchMetadata = {
  /*
   * @minLength 1
   */
  repository?: string;
  branch?: BranchName;
  /*
   * @minLength 1
   */
  stage?: string;
  labels?: string[];
};

export type DBBranch = {
  databaseName: DBName;
  branchName: BranchName;
  createdAt: DateTime;
  id: string;
  version: number;
  lastMigrationID: string;
  metadata?: BranchMetadata;
  startedFrom?: StartedFromMetadata;
  schema: Schema;
};

export type StartedFromMetadata = {
  branchName: BranchName;
  dbBranchID: string;
  migrationID: string;
};

/**
 * @x-go-type xata.Schema
 */
export type Schema = {
  tables: Table[];
  tablesOrder?: string[];
};

/**
 * @x-internal true
 */
export type SchemaEditScript = {
  sourceMigrationID?: string;
  targetMigrationID?: string;
  tables: TableEdit[];
};

export type Table = {
  id?: string;
  name: TableName;
  columns: Column[];
  revLinks?: RevLink[];
};

/**
 * @x-internal true
 */
export type TableEdit = {
  oldName?: string;
  newName?: string;
  columns?: MigrationColumnOp[];
};

/**
 * @x-go-type xata.Column
 */
export type Column = {
  name: string;
  type: 'bool' | 'int' | 'float' | 'string' | 'text' | 'email' | 'multiple' | 'link' | 'object' | 'datetime';
  link?: {
    table: string;
  };
  notNull?: boolean;
  unique?: boolean;
  columns?: Column[];
};

export type RevLink = {
  linkID: string;
  table: string;
};

/**
 * @pattern [a-zA-Z0-9_\-~]+
 */
export type BranchName = string;

/**
 * @pattern [a-zA-Z0-9_\-~]+
 */
export type DBName = string;

/**
 * The DBBranchName matches the pattern `{db_name}:{branch_name}`.
 *
 * @pattern [a-zA-Z0-9_\-~]+:[a-zA-Z0-9_\-~]+
 */
export type DBBranchName = string;

/**
 * @pattern [a-zA-Z0-9_\-~]+
 */
export type TableName = string;

/**
 * @pattern [a-zA-Z0-9_\-~\.]+
 */
export type ColumnName = string;

export type MetricsDatapoint = {
  timestamp: string;
  value: number;
};

export type MetricsLatency = {
  p50?: MetricsDatapoint[];
  p90?: MetricsDatapoint[];
};

export type BranchMigration = {
  id?: string;
  parentID?: string;
  status: string;
  title?: string;
  lastGitRevision?: string;
  localChanges: boolean;
  createdAt?: DateTime;
  newTables?: {
    [key: string]: Table;
  };
  removedTables?: string[];
  tableMigrations?: {
    [key: string]: TableMigration;
  };
  newTableOrder: string[];
  renamedTables?: TableRename[];
};

export type TableMigration = {
  newColumns?: {
    [key: string]: Column;
  };
  removedColumns?: string[];
  modifiedColumns?: ColumnMigration[];
  newColumnOrder: string[];
};

export type ColumnMigration = {
  old: Column;
  ['new']: Column;
};

/**
 * @x-internal true
 */
export type Commit = {
  meta?: {
    title?: string;
    message?: string;
    id: string;
    parentID?: string;
    mergeParentID?: string;
    status: string;
    createdAt: DateTime;
    modifiedAt?: DateTime;
  };
  operations: MigrationOp[];
};

/**
 * Branch schema migration.
 *
 * @x-internal true
 */
export type Migration = {
  parentID?: string;
  operations: MigrationOp[];
};

/**
 * Branch schema migration operations.
 *
 * @x-internal true
 */
export type MigrationOp = MigrationTableOp | MigrationColumnOp;

/**
 * @x-internal true
 */
export type MigrationTableOp =
  | {
      addTable: TableOpAdd;
    }
  | {
      removeTable: TableOpRemove;
    }
  | {
      renameTable: TableOpRename;
    };

/**
 * @x-internal true
 */
export type MigrationColumnOp =
  | {
      addColumn: ColumnOpAdd;
    }
  | {
      removeColumn: ColumnOpRemove;
    }
  | {
      renameColumn: ColumnOpRename;
    };

/**
 * @x-internal true
 */
export type TableOpAdd = {
  table: string;
};

/**
 * @x-internal true
 */
export type TableOpRemove = {
  table: string;
};

/**
 * @x-internal true
 */
export type TableOpRename = {
  oldName: string;
  newName: string;
};

/**
 * @x-internal true
 */
export type ColumnOpAdd = {
  table?: string;
  column: Column;
};

/**
 * @x-internal true
 */
export type ColumnOpRemove = {
  table?: string;
  column: string;
};

/**
 * @x-internal true
 */
export type ColumnOpRename = {
  table?: string;
  oldName: string;
  newName: string;
};

export type MigrationRequest = {
  /*
   * The migration request number.
   */
  number: number;
  /*
   * Migration request creation timestamp.
   */
  createdAt: DateTime;
  /*
   * Last modified timestamp.
   */
  modifiedAt?: DateTime;
  /*
   * Timestamp when the migration request was closed.
   */
  closedAt?: DateTime;
  /*
   * Timestamp when the migration request was merged.
   */
  mergedAt?: DateTime;
  status: 'open' | 'closed' | 'merging' | 'merged';
  /*
   * The migration request title.
   */
  title: string;
  /*
   * The migration request body with detailed description.
   */
  body: string;
  /*
   * Name of the source branch.
   */
  source: string;
  /*
   * Name of the target branch.
   */
  target: string;
};

export type SortExpression =
  | string[]
  | {
      [key: string]: SortOrder;
    }
  | {
      [key: string]: SortOrder;
    }[];

export type SortOrder = 'asc' | 'desc';

/**
 * Maximum [Levenshtein distance](https://en.wikipedia.org/wiki/Levenshtein_distance) for the search terms. The Levenshtein
 * distance is the number of one character changes needed to make two strings equal. The default is 1, meaning that single
 * character typos per word are tollerated by search. You can set it to 0 to remove the typo tollerance or set it to 2
 * to allow two typos in a word.
 *
 * @default 1
 * @maximum 2
 * @minimum 0
 */
export type FuzzinessExpression = number;

/**
 * If the prefix type is set to "disabled" (the default), the search only matches full words. If the prefix type is set to "phrase", the search will return results that match prefixes of the search phrase.
 */
export type PrefixExpression = 'phrase' | 'disabled';

/**
 * @minProperties 1
 */
export type FilterExpression = {
  $exists?: string;
  $existsNot?: string;
  $any?: FilterList;
  $all?: FilterList;
  $none?: FilterList;
  $not?: FilterList;
} & {
  [key: string]: FilterColumn;
};

export type HighlightExpression = {
  /*
   * Set to `false` to disable highlighting. By default it is `true`.
   */
  enabled?: boolean;
  /*
   * Set to `false` to disable HTML encoding in highlight snippets. By default it is `true`.
   */
  encodeHTML?: boolean;
};

/**
 * Booster Expression
 *
 * @x-go-type xata.BoosterExpression
 */
export type BoosterExpression =
  | {
      valueBooster?: ValueBooster;
    }
  | {
      numericBooster?: NumericBooster;
    }
  | {
      dateBooster?: DateBooster;
    };

/**
 * Boost records with a particular value for a column.
 */
export type ValueBooster = {
  /*
   * The column in which to look for the value.
   */
  column: string;
  /*
   * The exact value to boost.
   */
  value: string | number | boolean;
  /*
   * The factor with which to multiply the score of the record.
   */
  factor: number;
};

/**
 * Boost records based on the value of a numeric column.
 */
export type NumericBooster = {
  /*
   * The column in which to look for the value.
   */
  column: string;
  /*
   * The factor with which to multiply the value of the column before adding it to the item score.
   */
  factor: number;
};

/**
 * Boost records based on the value of a datetime column. It is configured via "origin", "scale", and "decay". The further away from the "origin",
 * the more the score is decayed. The decay function uses an exponential function. For example if origin is "now", and scale is 10 days and decay is 0.5, it
 * should be interpreted as: a record with a date 10 days before/after origin will score 2 times less than a record with the date at origin.
 */
export type DateBooster = {
  /*
   * The column in which to look for the value.
   */
  column: string;
  /*
   * The datetime (formatted as RFC3339) from where to apply the score decay function. The maximum boost will be applied for records with values at this time.
   * If it is not specified, the current date and time is used.
   */
  origin?: string;
  /*
   * The duration at which distance from origin the score is decayed with factor, using an exponential function. It is fromatted as number + units, for example: `5d`, `20m`, `10s`.
   *
   * @pattern ^(\d+)(d|h|m|s|ms)$
   */
  scale: string;
  /*
   * The decay factor to expect at "scale" distance from the "origin".
   */
  decay: number;
};

export type FilterList = FilterExpression | FilterExpression[];

export type FilterColumn = FilterColumnIncludes | FilterPredicate | FilterList;

/**
 * @maxProperties 1
 * @minProperties 1
 */
export type FilterColumnIncludes = {
  $includes?: FilterPredicate;
  $includesAny?: FilterPredicate;
  $includesAll?: FilterPredicate;
  $includesNone?: FilterPredicate;
};

export type FilterPredicate = FilterValue | FilterPredicate[] | FilterPredicateOp | FilterPredicateRangeOp;

/**
 * @maxProperties 1
 * @minProperties 1
 */
export type FilterPredicateOp = {
  $any?: FilterPredicate[];
  $all?: FilterPredicate[];
  $none?: FilterPredicate | FilterPredicate[];
  $not?: FilterPredicate | FilterPredicate[];
  $is?: FilterValue | FilterValue[];
  $isNot?: FilterValue | FilterValue[];
  $lt?: FilterRangeValue;
  $le?: FilterRangeValue;
  $gt?: FilterRangeValue;
  $ge?: FilterRangeValue;
  $contains?: string;
  $startsWith?: string;
  $endsWith?: string;
  $pattern?: string;
};

/**
 * @maxProperties 2
 * @minProperties 2
 */
export type FilterPredicateRangeOp = {
  $lt?: FilterRangeValue;
  $le?: FilterRangeValue;
  $gt?: FilterRangeValue;
  $ge?: FilterRangeValue;
};

export type FilterRangeValue = number | string;

export type FilterValue = number | string | boolean;

/**
 * Pagination settings.
 */
export type PageConfig = {
  /*
   * Query the next page that follow the cursor.
   */
  after?: string;
  /*
   * Query the previous page before the cursor.
   */
  before?: string;
  /*
   * Query the first page from the cursor.
   */
  first?: string;
  /*
   * Query the last page from the cursor.
   */
  last?: string;
  /*
   * Set page size. If the size is missing it is read from the cursor. If no cursor is given xata will choose the default page size.
   *
   * @default 20
   */
  size?: number;
  /*
   * Use offset to skip entries. To skip pages set offset to a multiple of size.
   *
   * @default 0
   */
  offset?: number;
};

export type ColumnsProjection = string[];

/**
 * Xata Table Record Metadata
 */
export type RecordMeta = {
  id: RecordID;
  xata: {
    /*
     * The record's version. Can be used for optimistic concurrency control.
     */
    version: number;
    /*
     * The record's table name. APIs that return records from multiple tables will set this field accordingly.
     */
    table?: string;
    /*
     * Highlights of the record. This is used by the search APIs to indicate which fields and parts of the fields have matched the search.
     */
    highlight?: {
      [key: string]:
        | string[]
        | {
            [key: string]: any;
          };
    };
    /*
     * The record's relevancy score. This is returned by the search APIs.
     */
    score?: number;
    /*
     * Encoding/Decoding errors
     */
    warnings?: string[];
  };
};

/**
 * @pattern [a-zA-Z0-9_-~:]+
 */
export type RecordID = string;

/**
 * @example {"newName":"newName","oldName":"oldName"}
 */
export type TableRename = {
  /*
   * @minLength 1
   */
  newName: string;
  /*
   * @minLength 1
   */
  oldName: string;
};

/**
 * Records metadata
 */
export type RecordsMetadata = {
  page: {
    /*
     * last record id
     */
    cursor: string;
    /*
     * true if more records can be fetch
     */
    more: boolean;
  };
};

/**
 * Xata Table Record Metadata
 */
export type XataRecord = RecordMeta & {
  [key: string]: any;
};
