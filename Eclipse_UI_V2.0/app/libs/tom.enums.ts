

const enum ActionType {
  BUY = 1,
  Sell = 2,
  Rebalance,
  Buy_Rebalance,
  Sell_Rebalance,
  Liquidate
}

const enum OrderType {
  Market = 1,
  Limit = 2,
  Stop,
  Stop_Limit,
  ManualOrder,
  MarketOnClose,
}

const enum SpendCalculationMethods {
  ProRata = 40,
  BuyRebalance = 41,
  BuyRebalanceOverBuy = 42,
  BuyRebalancewithEmphasis = 43,
  Buywithfullrebalance = 44
}

/** Raise cash Calculation Method Enum */
const enum RaiseCashCalculationMethods {
  ProRata,
  SellRebalance,
  SellRebalanceOverbuy,
  SellRebalancewithEmphasis,
  SellwithFullRebalance,
  BestTax
}

