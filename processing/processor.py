
import pandas as pd
from sklearn.preprocessing import MinMaxScaler

def scale(dataframe):
    data = dataframe.copy(deep = True)
    scaled_data = pd.DataFrame()
    scaled_data.index = data.index

    mn = MinMaxScaler(feature_range=(-1,1))
    for col in data.columns:
        scaled_data[col] = mn.fit_transform(data[[col]])

    return scaled_data

