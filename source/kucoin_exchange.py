import datetime
import requests
from time import time
import pandas as pd
from datetime import datetime

class API():
    def __init__(self, client):
        self.coins_list = []
        self.cash = 0
        self.client = client
        self.date_mapper = {'1min' : 60, 
                            '3min' : 60*3 , 
                            '5min' : 60*5,
                            '15min': 60*15,
                            '30min': 60*30,
                            '1hour': 60*60,
                            '2hour': 60*60*2,
                            '4hour': 60*60*4,
                            '6hour': 60*60*6,
                            '8hour': 60*60*8,
                            '12hour':60*60*12,
                            '1day':  60*60*24,
                            '1week': 60*60*24*7}

        self.position = {   'buy' : client.SIDE_BUY,
                            "Buy" : client.SIDE_BUY,
                            "BUY" : client.SIDE_BUY,
                            "sell": client.SIDE_SELL,
                            "SELL": client.SIDE_SELL,
                            "Sell": client.SIDE_SELL}

        self.entry = {      'buy' : 'entry',
                            "BUY" : 'entry', 
                            "Buy" : 'entry',
                            "Sell": 'loss',
                            "sell": 'loss',
                            "SELL": 'loss'}

    def create_aacount(self,account_type, coin):
        '''
        account_type (string) – Account type - main or trade
        coin (string) – Currency code, 'BTC'
        '''
        self.client.create_account(account_type, coin)

    def get_account(self, account_id):
        '''
        Get an individual account
        '''
        self.client.get_account(account_id)

    def show_info(self):
        '''
        save list of coin and update after 10 days
        '''
        currencies = self.client.get_currencies()
        df = pd.DataFrame(currencies)

        return df

    def show_account(self):
        account = self.client.get_accounts()
        account = pd.DataFrame(account)
        account = account[['currency' , 'type' , 'balance' ]]
        account = account.groupby(by = 'currency').sum().reset_index()
        account['last price'] = 1

        for index, currency in enumerate(account['currency']):
            if currency != 'USDT':
                last_price = float(self.client.get_ticker(f'{currency}-USDT')['price'])
                account['last price'].iloc[index] = last_price
        account[['balance' , 'last price']] = account[['balance' , 'last price']].astype(float)
        account['total'] = account['balance'] * account['last price']
        total = account['total'].sum()
        account['share'] = account['total']/total
        print("your account is </br> balance is your amount </br>  \n " , account )

        return account , total

    def get_data(self , base_coin , frequency, window):
        '''
        frequency: 1min, 3min, 5min, 15min, 30min, 1hour, 2hour,4hour, 6hour, 8hour, 12hour, 1day, 1week
        window : length of the total dataframe
        https://python-kucoin.readthedocs.io/en/stable/market.html
        '''
        base_url = "https://api.kucoin.com"
        coin_pair = base_coin + '-USDT' 
        start = self.date_mapper[frequency]
        now_is = int(time())

        days_delta = self.date_mapper[frequency] * window 
        start_At = now_is - days_delta
        price_url = f"/api/v1/market/candles?type={frequency}&symbol={coin_pair}&startAt={start_At}&endAt={now_is}"
        prices = requests.get(base_url+price_url).json()
        prices = pd.DataFrame(prices['data'])
        prices.columns = ['Open time','Open','High','Low','Close','Transaction amount', 'Transaction volume']
        prices['Open time'] = pd.to_datetime(prices['Open time'] , unit= 's')
        prices = prices[::-1]
        prices = prices.set_index('Open time')
        prices = prices.astype(float)

        print('successfully get data' )

        return prices


    def set_market_order(self,coin ,position, amount):
        '''
        see this : https://python-kucoin.readthedocs.io/en/stable/trading.html
        '''
        print('-----------> kucoin set_market_order func()' ,f'{coin}-USDT',  self.position[position] )
        order = self.client.create_market_order(f'{coin}-USDT', self.position[position] , size=amount)


    def set_limit_order(self , coin, position, amount, price, stop_price):
        '''
        see this : https://python-kucoin.readthedocs.io/en/stable/trading.html
        '''
        print("-----------> Kucoin set_limit_order func() " , f'{coin}-USDT' , "position : " , self.position[position] , ' stop price is ' , stop_price, ' price is ' , price )
        order = self.client.create_limit_order(symbol = f'{coin}-USDT', side=self.position[position], size = amount, price = price, stop_price=stop_price , stop = self.entry[position])

    def cancel_order(self):
        self.client.cancel_all_orders()

    def get_total_trade_histories(self, coin):
        name = coin + '-USDT'
        histories = self.client.get_trade_histories(name)
        histories = pd.DataFrame(histories)
        histories['time'] = histories['time'].apply(lambda x : datetime.fromtimestamp(int(x)))

    def show_limited_orders(self):
        for modes in ['limit', 'market','limit_stop','market_stop']:
            his = self.client.get_orders(order_type = modes)
            his = pd.DataFrame(his['items'])
            print(his)

    def get_multiple_coins(self, coins, base_col, time, period):
        coins_lis = coins.split(',')
        real_price = pd.DataFrame()
        if len(coins_lis) > 1:
            for coin in coins_lis:
                data = self.get_data(base_coin=coin, frequency=time, window=period)
                col_df = data[[base_col]]
                col_df = col_df.rename(columns= {base_col : f'{base_col}_{coin}'})
                real_price = pd.concat([real_price, col_df], axis = 1)
                real_price = real_price.interpolate(method='linear')
        else:
            data = self.get_data(coins, time = time , days=period)
            col_df = data[[base_col]]
            col_df.columns = f'{base_col}_{coin}'
            real_price = col_df

        return real_price

