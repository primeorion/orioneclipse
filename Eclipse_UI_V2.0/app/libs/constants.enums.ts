const enum UserType {
  FirmAdmin = 1,
  TeamAdmin = 2,
  User = 3
}

/**
 * Orion Privileges which are referred from eclipse database
 */
const enum Privileges {
  NONE = 0,
  TEAMS = 57,
  USERS,
  ROLES,
  MODELS,
  SECURITIES,
  PORTFOLIOS,
  ACCOUNTS,
  HOLDINGS,
  CUSTODIANS,
  FIRMPREF,
  CUSTODIANPREF,
  MODELPREF,
  TEAMPREF,
  SECURITYPREF,
  PORTFOLIOPREF,
  ACCOUNTPREF,
  HOLDINGPREF,
  QUERIES,
  FULLIMPORT,
  PARTIALIIMPORT,
  APPROVELEVEL1,
  APPROVELEVEL2,
  APPROVELEVEL3,
  APPROVEMODELCHG,
  APPROVEMODELASS,
  A
}

const PRIV_TEAMS = 'TEAMS';
const PRIV_USERS = 'USERS';
const PRIV_ROLES = 'ROLES';
const PRIV_MODELS = 'MODELS';
const PRIV_SECURITIES = 'SECURITIES';
const PRIV_PORTFOLIOS = 'PORTFOLIOS';
const PRIV_ACCOUNTS = 'ACCOUNTS';
const PRIV_HOLDINGS = 'HOLDINGS';
const PRIV_CUSTODIANS = 'CUSTODIANS';
const PRIV_FIRMPREF = 'FIRMPREF';
const PRIV_CUSTODIANPREF = 'CUSTODIANPREF';
const PRIV_MODELPREF = 'MODELPREF';
const PRIV_TEAMPREF = 'TEAMPREF';
const PRIV_SECURITYPREF = 'SECURITYPREF';
const PRIV_PORTFOLIOPREF = 'PORTFOLIOPREF';
const PRIV_ACCOUNTPREF = 'ACCOUNTPREF';
const PRIV_HOLDINGPREF = 'HOLDINGPREF';
const PRIV_QUERIES = 'QUERIES';
const PRIV_FULLIMPORT = 'FULLIMPORT';
const PRIV_PARTIALIIMPORT = 'PARTIALIIMPORT';
const PRIV_APPROVELEVEL1 = 'APPROVELEVEL1';
const PRIV_APPROVELEVEL2 = 'APPROVELEVEL2';
const PRIV_APPROVELEVEL3 = 'APPROVELEVEL3';
const PRIV_APPROVEMODELCHG = 'APPROVEMODELCHG';
const PRIV_APPROVEMODELASS = 'APPROVEMODELASSIGN';
const PRIV_ALLOW_EDIT_ON_SECURITY_PRICE = 'EDITSECPRICE';
const PRIV_ALLOW_EDIT_ON_SECURITY_TYPE = 'EDITSECTYPE';
const PRIV_A = 'A';
const PRIV_ORDEXEC='ORDEXEC';
const PRIV_ORDEDIT='ORDEDIT';

const VIEWL = 'L';
const VIEWV = 'V';
const VIEWA = 'A';
const VIEWE = 'E';
const VIEWD = 'D';

const enum Privilege {
  canView = 0,
  canAdd = 1,
  canEdit = 2,
  canDelete = 3
}

const enum Priv {
  V = 0,
  A = 1,
  E = 2,
  D = 3
}

const RouteNames: {} = {
  team: 'TEAMS',
  user: 'USERS',
  role: 'ROLES',
  model: 'MODELS',
  security: 'SECURITIES',
  portfolio: 'PORTFOLIOS',
  account: 'ACCOUNTS',
  holding: 'HOLDINGS',
  custodian: 'CUSTODIANS',
  firmpref: 'FIRMPREF',
  custodianpref: 'CUSTODIANPREF',
  modelpref: 'MODELPREF',
  teampref: 'TEAMPREF',
  securitypref: 'SECURITYPREF',
  portfoliopref: 'PORTFOLIOPREF',
  accountpref: 'ACCOUNTPREF',
  holdingpref: 'HOLDINGPREF',
  queries: 'QUERIES',
  fullimport: 'FULLIMPORT',
  partialiimport: 'PARTIALIIMPORT',
  approvelevel1: 'APPROVELEVEL1',
  approvelevel2: 'APPROVELEVEL2',
  approvelevel3: 'APPROVELEVEL3',
  approvemodelchg: 'APPROVEMODELCHG',
  approvemodelass: 'APPROVEMODELASS',
  a: 'A'
}

const enum ViewType {
  V = 0,
  A = 1,
  Portfolio = 2,
  D = 3
}

const OrionColors: string[] = [
  "#fb6948", "#492970", "#f28f43", "#14aae5", "#5f62e6", "#c42525", "#3ce440", "#3366cc", "#dc3912", "#ff9900", "#109618",
  "#990099", "#0099c6", "#dd4477", "#66aa00", "#b82e2e", "#316395", "#994499", "#22aa99", "#aaaa11", "#6633cc", "#e67300",
  "#8b0707", "#651067", "#329262", "#5574a6", "#3b3eac", "#286598", "#3284b5", "#4c4e9b", "#9593c4", "#FFFFFF", "#FFFFF0",
  "#FFFFE0", "#FFFF00", "#FFFAFA", "#FFFAF0", "#FFFACD", "#FFF8DC", "#FFF5EE", "#FFF0F5", "#FFEFD5", "#FFEBCD", "#FFE4E1",
  "#FFE4C4", "#FFE4B5", "#FFDEAD", "#FFDAB9", "#FFD700", "#FFC0CB", "#FFB6C1", "#FFA500", "#FFA07A", "#FF8C00", "#FF7F50",
  "#FF69B4", "#FF6347", "#FF4500", "#FF1493", "#FF00FF", "#FF0000", "#FDF5E6", "#FAFAD2", "#FAF0E6", "#FAEBD7", "#FA8072",
  "#F8F8FF", "#F5FFFA", "#F5F5F5", "#F5F5DC", "#F5DEB3", "#F4A460", "#F0FFFF", "#F0FFF0", "#F0F8FF", "#F0E68C", "#F08080",
  "#EEE8AA", "#EE82EE", "#E9967A", "#E6E6FA", "#E0FFFF", "#DEB887", "#DDA0DD", "#DCDCDC", "#DC143C", "#DB7093", "#DAA520",
  "#DA70D6", "#D8BFD8", "#D3D3D3", "#D2B48C", "#D2691E", "#CD853F", "#CD5C5C", "#C71585", "#C0C0C0", "#BDB76B", "#BC8F8F",
  "#BA55D3", "#B8860B", "#B22222", "#B0E0E6", "#B0C4DE", "#AFEEEE", "#ADFF2F", "#ADD8E6", "#A9A9A9", "#A52A2A", "#A0522D",
  "#9ACD32", "#9932CC", "#98FB98", "#9400D3", "#9370DB", "#90EE90", "#8FBC8F", "#8B4513", "#8B008B", "#8B0000", "#8A2BE2",
  "#87CEFA", "#87CEEB", "#808080", "#808000", "#800080", "#800000", "#7FFFD4", "#7FFF00", "#7CFC00", "#7B68EE", "#778899",
  "#708090", "#6B8E23", "#6A5ACD", "#696969", "#66CDAA", "#6495ED", "#5F9EA0", "#556B2F", "#4B0082", "#48D1CC", "#483D8B",
  "#4682B4", "#4169E1", "#40E0D0", "#3CB371", "#32CD32", "#2F4F4F", "#2E8B57", "#228B22", "#20B2AA", "#1E90FF", "#191970",
  "#00FFFF", "#00FF7F", "#00FF00", "#00FA9A", "#00CED1", "#00BFFF", "#008B8B", "#008080", "#008000", "#006400", "#0000FF",
  "#0000CD", "#00008B", "#000080", "#000000"];

const enum EmitNotificationType {
  NotificationWindow = 1,
  ProgressWindow = 2
}

/** Trade tool types */
const enum TradeToolType{
  SpendCash = 1,
  RaiseCash = 2,
  ProratedCash = 3,
  GlobalTrades = 4,
  TaxTickerSwap = 5,
  CashNeed = 6,
  TradeToTarget = 7
}