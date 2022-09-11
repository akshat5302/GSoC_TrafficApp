import flask
from tensorflow.keras.models import load_model
import pandas as pd 
import numpy as np
from sklearn.preprocessing import StandardScaler, MinMaxScaler
import datetime
app = flask.Flask(__name__, template_folder='templates')
@app.route('/', methods=['GET', 'POST'])
def main():

    def HazardPredictor(traffic):
      if traffic == "High":
        hazards=["Accident","Construction","Bad Weather", "Foggy View", "Bad road conditions"]
        return random.choice(hazards)
      else :
        return "Normal Conditions"
    def trafficLevel(noOfVehicles):
      if noOfVehicles <=60:
        return "Low"
      elif noOfVehicles>60 and noOfVehicles<=120:
        return "Moderate"
      else:
        return "High"

    def getTimeAndDate(date,time):
      availDates=["4","7","8","9","10","11"]
      dateList=date.split("/")
      if(7<=int(dateList[0])<=11):
        newDate=int(dateList[0])
      else:
        newDate=availDates[int(dateList[0])%5]
      newTime=int(time.split(":")[1])
      newTime = newTime if newTime%5==0 else 5 *((newTime // 5)+1)
      timeStamp=str(newDate)+"/"+"3/2020 "+str(int(time.split(":")[0]))+":"+str(newTime).zfill(2)
      return timeStamp

    def getCurrentTimestmap():
      currentDT = datetime.datetime.now()
      currentDate = str(currentDT.day)+"/"+ str(currentDT.month) +"/" + str(currentDT.year)
      timeList=str(currentDT.time()).split(":")
      presenTimeStamp=currentDate+" "+timeList[0]+":"+timeList[1].zfill(2)
      print(presenTimeStamp)
      return presenTimeStamp

    df = pd.read_csv("./data/test.csv", encoding='utf-8')
    scaler = MinMaxScaler(feature_range=(0, 1)).fit(df['Flow (Veh/5 Minutes)'].values.reshape(-1, 1))
    test_data = scaler.transform(df['Flow (Veh/5 Minutes)'].values.reshape(-1, 1)).reshape(1, -1)[0]
    lag = 12
    test = []
    for i in range(lag, len(test_data)):
        test.append(test_data[i - lag: i + 1])
    test = np.array(test)
    x_test = test[:, :-1]
    y_test = test[:, -1]
    x_test = np.reshape(x_test, (x_test.shape[0], x_test.shape[1], 1))
    print("Loading GRU keras model...")
    model_GRU = load_model('./models/GRU.h5') 
    print("GRU model successfully loaded")     
    predicted_GRU = model_GRU.predict(x_test)    
    predicted_GRU = scaler.inverse_transform(predicted_GRU.reshape(-1, 1)).reshape(1, -1)[0]    
    if flask.request.method == 'GET':
        return(flask.render_template('index.html')) 
    if flask.request.method == 'POST':
        date = flask.request.form['date']
        time = flask.request.form['time']
        
        col = getTimeAndDate(date, time)
        currTimeList=getCurrentTimestmap().split(" ")
        x=df.loc[df['5 Minutes'] ==col] 
       
        x2=df.loc[df['5 Minutes'] ==getTimeAndDate(currTimeList[0],currTimeList[1])]
        true = x["Flow (Veh/5 Minutes)"].values
       
        true2 = x2["Flow (Veh/5 Minutes)"].values
       
        index = x["Flow (Veh/5 Minutes)"].index
        index = index[0]
     
    
        index2 = index2[0]

        pred_GRU = predicted_GRU[index].astype(int) 
        pred_GRU2 = predicted_GRU[index2].astype(int)

        pred_tl=trafficLevel(pred_GRU)
        pred_cf_tl=trafficLevel(pred_GRU2)
        
        predH=HazardPredictor(pred_tl)
        CurrH=HazardPredictor(pred_cf_tl)
        
        return flask.render_template('index.html',pred_val_GRU=pred_GRU,pred_val_GRU2=pred_GRU2,ptl=pred_tl, pcl=pred_cf_tl,predHazard=predH,currHazard=CurrH    )

@app.route('/login')
def login():
    return flask.render_template("./login/index.html")
    
@app.route('/admin')
def admin():
    return flask.render_template("./admin/index.html")
        
if __name__ == '__main__':
   
    app.run(host='0.0.0.0')    
