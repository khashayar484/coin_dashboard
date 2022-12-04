import pandas as pd
import matplotlib.pyplot as plt
from sklearn.preprocessing import MinMaxScaler

class API():
    def __init__(self, client):
        self.coins_list = []
        self.available_coins = []
        self.concat_list = []
        self.concat_dataframe = None
        self.active_account = None
        self.cash = None  
        self.client = client 
        self.time_dict = { 
        '12h' : client.KLINE_INTERVAL_12HOUR,
        '15m' : client.KLINE_INTERVAL_15MINUTE,
        '1d'  : client.KLINE_INTERVAL_1DAY,
        '1h'  : client.KLINE_INTERVAL_1HOUR,
        '1m'  : client.KLINE_INTERVAL_1MINUTE,
        '1M'  : client.KLINE_INTERVAL_1MONTH,
        '1w'  : client.KLINE_INTERVAL_1WEEK,
        '2h'  : client.KLINE_INTERVAL_2HOUR,
        '30m' : client.KLINE_INTERVAL_30MINUTE,
        '3d'  : client.KLINE_INTERVAL_3DAY,
        '3m'  : client.KLINE_INTERVAL_3MINUTE,
        '4h'  : client.KLINE_INTERVAL_4HOUR,
        '5m'  : client.KLINE_INTERVAL_5MINUTE,
        '6h'  : client.KLINE_INTERVAL_6HOUR,
        '8h'  : client.KLINE_INTERVAL_8HOUR
        
        }

    def get_coin(self , *coins , time , days , end = None ):
        '''
        times " 12h, 15m, 1d, 1h, 1m, 1M, 1w, 2h, 30m, 3d, 3m, 4h, 5m, 6h, 8h
        days : number of days

        return coin_lis <list>
        '''
        for coin in coins:
            coin = coin + 'USDT'
            print(' time is ' ,  self.time_dict[f'{time}'])
            print('coin is ' , coin)
            one = self.client.get_historical_klines(coin ,  self.time_dict[f'{time}'] , f"{days} day ago UTC")
            # print('------> this class from binance class \n ' , one)
            df = pd.DataFrame(one)
            df.columns = ['Open time','Open','High','Low','Close','Volume' , 'Close time' , 'Quote asset volume' , 'Number of trades' ,\
                                                    'Taker buy base asset volume' , 'Taker buy quote asset volume' , 'ignore']

            df['Open time'] = pd.to_datetime(df['Open time'] , unit= 'ms')
            df = df.set_index('Open time')
            print(f' get {coin} data successfully ! ')

        return df
    

    def concat(self , *coins , time , days , based_col , scale = False , save = False):
        concat = pd.DataFrame([])
        for i in coins:
            print('coin 1 ' , i)
            # i = i +'USDT'
            coin = self.get_coin(i , time = time , days = days )

            df = coin.copy(deep = True)
            con = df[[f'{based_col}']]
            con.columns = [f'{i}_{based_col}']
            concat = pd.concat([concat , con] , axis = 1)
        
        self.concat_dataframe = concat

        if scale:
            mn = MinMaxScaler()
            values = mn.fit_transform(concat)
            df = pd.DataFrame(values , columns = [concat.columns] , index = concat.index)
            print(df)

            for col in df.columns:
                plt.plot(df[col] , label = col)
            plt.title(f'--------------- {days} days -----------------')
            plt.grid()
            plt.legend()
            plt.show()

        return concat

    def balance_info(self , coin):
        balance = self.client.get_asset_balance(asset= coin)
        print('your accounct is ' , balance)
    

    def bin_coin_list(self):
        '''
        get the list of available coins in binance
        ''' 
        coins = self.client.get_all_tickers()
        df = pd.DataFrame.from_dict(coins)
        for i,j in enumerate(df.symbol):
            if 'BNB' in j:
                k = j.replace('BNB' ,  '')
                print('index ' , i , ' bin coins is ' , j , ' coin name ' , k )
                self.available_coins.append(k)
    
    def info(self):
        '''
        accountType, balances, permissions, etc.
        '''
        info = self.client.get_account()
        print('your current wallet is ' , info)


    def account_balance(self):
        '''
        return deposit_coin, cash
        '''
        info = self.client.get_account()
        active_acount = []
        for diction in info['balances']:
            asset , free  , locked = diction.values()
            if float(free) !=0:
                active_acount.append({"asset" : asset , 'amount' : free})
                if asset == 'USDT':
                    self.cash = free

        self.active_account = active_acount
        
        return active_acount , self.cash
    
