from flask import Flask, render_template, request, jsonify
from source import binance_exchange, kucoin_exchange
from algorithm import portfolio
from binance.client import Client
from kucoin.client import Client
from backend import home
from processing import processor

app = Flask(__name__, template_folder = "template" ,static_folder = "static")

binance_client = Client("***********" ,  "***********" )
kucoin_client = Client("***********", "***********", "***********")

kucoin_api = kucoin_exchange.API(client= kucoin_client)

@app.route("/", methods = ['GET' , 'POST'])
def homepage():
    return render_template("homepage.html")


@app.route("/homepage_plots", methods = ['GET' , 'POST'])
def homepage_plots():
    """
    get data from mulitple sources and aggregating here.
    """
    if request.method == 'POST':
        coins_list = request.form.get("coins")
        column = request.form.get("column")
        time = request.form.get("time")
        period =  int(request.form.get("period"))
        
        real_price = kucoin_api.get_multiple_coins(coins = coins_list, base_col=column, time = time, period = int(period))
        scaled_price = processor.scale(real_price)

        sharpe_weights = portfolio.calc_sharpe(input_price = real_price)
        hrp_weights = portfolio.risk_parity_portfolio(input_price = real_price)

        coins = list(scaled_price.columns)
        real_date = scaled_price.index.tolist()
        scaled_price = scaled_price.astype(str).values.tolist()

        coins_sharpe = sharpe_weights['coins'].astype(str).values.tolist()
        sharpe_weights['weights'] =  sharpe_weights['weights'].apply(lambda x : str(round(x*100,2)))
        weights_sharpe = sharpe_weights['weights'].astype(str).values.tolist()

        coins_hrp = hrp_weights.index.tolist()
        hrp_weights = hrp_weights.apply(lambda x :  str(round(x*100,2)))
        weights_hrp =  hrp_weights.astype(str).values.tolist()
        gray_weights, gray_coins = home.show_grayscale_portfo()

        return jsonify({"real_data" : scaled_price, 
                        "sharpe_weights" : weights_sharpe, 
                        "sharpe_coins" : coins_sharpe,
                        "hrp_weights" : weights_hrp,
                        "hrp_coins" : coins_hrp,
                        'coins' : coins,
                        "real_date" : real_date, 
                        "gray_weights" : gray_weights, 
                        "gray_coins" : gray_coins})


if __name__ == "__main__":
    app.run(debug = False)
