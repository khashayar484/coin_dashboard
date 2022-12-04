import json
import requests
import pandas as pd
from sklearn.preprocessing import MinMaxScaler


def scale(dataframe):
    data = dataframe.copy(deep = True)
    time , data = data.iloc[:, 0] , data.iloc[ : , 1:]
    data = data.astype(float)
    scale_repo = pd.DataFrame()

    for col in data.columns:
        mean, std = data[col].mean(), data[col]
        scale = (data[col]-mean) / std
        scale_repo = pd.concat([scale_repo, scale], axis=1)

    mn = MinMaxScaler(feature_range=(-1,1))
    scale = mn.fit_transform(data)
    scale = pd.DataFrame(scale, columns=data.columns)
    scale = pd.concat([time, scale], axis=1)
    total = pd.concat([time, scale_repo] , axis=1)
    return scale 


def gray_scale_portfolio():
    '''
    get gray sclae portfolio result
    '''
    url = 'https://fapi.coinglass.com/api/grayscaleOpenInterest'

    text = requests.get(url).text
    jj = json.loads(text)
    df = pd.DataFrame(jj['data'])
    df['date'] = pd.to_datetime(df['updateTime'])

    df = df[['symbol' , 'date' , 'd30OIChange' , 'd30OIChange' , 'openInterestVol' , 'oIChange'  ,'oIChangePercent' , 'd7OIChange']]
    df = df.rename(columns = { 'openInterest' : 'TotalHolding' , 'openInterestVol' : 'Total Holdings($)' ,\
                                'oIChange' : '24H Change', 'oIChangePercent' : '24H Change %', 'd7OIChange' : '7daysChange(unit)' ,'d30OIChange' : '30daysChange(unit)'})
    
    return df 
    
def show_grayscale_portfo():
    grayportfo = gray_scale_portfolio()
    total_values = grayportfo['Total Holdings($)'].sum()
    grayportfo['share'] = grayportfo['Total Holdings($)']/total_values
    weights = grayportfo[['symbol', 'share']]
    weights['share'] = weights['share'].apply(lambda x : str(round(x, 2)))

    gray_weights = weights['share'].astype(str).values.tolist()
    gray_coins =  weights['symbol'].astype(str).values.tolist()
    
    return gray_weights, gray_coins

