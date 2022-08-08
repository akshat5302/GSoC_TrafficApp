import numpy as np
import pandas as pd
import math
import random
from sklearn.preprocessing import StandardScaler, MinMaxScaler
import tensorflow as tf 
from tensorflow.keras.models import Sequential
from tensorflow.keras.models import load_model
from tensorflow.keras.layers import LSTM,GRU,Dense, Dropout, Activation
from tensorflow.keras.callbacks import EarlyStopping
from tensorflow.keras.utils import plot_model
import sklearn.metrics as metrics
import matplotlib as mpl
import matplotlib.pyplot as plt
import sys


import mlflow
import mlflow.tensorflow 

mlflow.tensorflow.autolog()

# params 
epochs = int(sys.argv[1]) if len(sys.argv) > 1 else 600
val_split = float(sys.argv[2]) if len(sys.argv) > 1 else 0.05
# fix random seed for reproducibility
np.random.seed(1)
tf.random.set_seed(1) 
random.seed(1)

# read data from files to dataframes
df1 = pd.read_csv("./Traffic_Data_cali/train.csv", encoding='utf-8')
df2 = pd.read_csv("./Traffic_Data_cali/test.csv", encoding='utf-8')

# normalize data
scaler = MinMaxScaler(feature_range=(0, 1)).fit(df1['Flow (Veh/5 Minutes)'].values.reshape(-1, 1))
train_data = scaler.transform(df1['Flow (Veh/5 Minutes)'].values.reshape(-1, 1)).reshape(1, -1)[0]
test_data = scaler.transform(df2['Flow (Veh/5 Minutes)'].values.reshape(-1, 1)).reshape(1, -1)[0]

# practicing with different time lag (look back) values to optimize the models
lag = 12
train, test = [], []
for i in range(lag, len(train_data)):
    train.append(train_data[i - lag: i + 1])
for i in range(lag, len(test_data)):
    test.append(test_data[i - lag: i + 1])

train = np.array(train)
test = np.array(test)
# shuffle data (stateles case)
np.random.shuffle(train)
x_train = train[:, :-1]
y_train = train[:, -1]
x_test = test[:, :-1]
y_test = test[:, -1]

# building models

def build_LSTM():
    model = Sequential()
    model.add(LSTM(64,input_shape=(lag, 1),return_sequences=True))
    model.add(LSTM(64))
    model.add(Dropout(0.2))
    model.add(Dense(1, activation='sigmoid'))
    return model    

def build_GRU():
    model = Sequential()
    model.add(GRU(64, input_shape=(lag, 1), return_sequences=True))
    model.add(GRU(64))
    model.add(Dropout(0.2))
    model.add(Dense(1, activation='sigmoid'))
    return model

#model_struct = "LSTM"
model_struct = "GRU"
#model_struct = "AE"
# train the models 
if model_struct == "LSTM" :
    x_train = np.reshape(x_train, (x_train.shape[0], x_train.shape[1], 1))
    model = build_LSTM()
    model.compile(loss="mse", optimizer="rmsprop", metrics=['mape'])
    #monitor = EarlyStopping(monitor='val_loss', patience=40, verbose=1, mode='auto',restore_best_weights=True)
    hist = model.fit(x_train, y_train,batch_size=64,epochs=600,callbacks=[monitor],validation_split=0.05)
    model.save('models/LSTM.h5')
    df = pd.DataFrame.from_dict(hist.history)
    df.to_csv('models/LSTM_loss.csv', encoding='utf-8', index=False)        
elif model_struct == "GRU" :        
    x_train = np.reshape(x_train, (x_train.shape[0], x_train.shape[1], 1))
    model = build_GRU()
    model.compile(loss="mse", optimizer="rmsprop", metrics=['mape'])
    monitor = EarlyStopping(monitor='val_loss', patience=40, verbose=1, mode='auto',restore_best_weights=True)
    hist = model.fit(x_train, y_train,batch_size=64,epochs=epochs,callbacks=[monitor],validation_split=val_split)
    model.save('models/GRU.h5')
    df = pd.DataFrame.from_dict(hist.history)
    df.to_csv('models/GRU_loss.csv', encoding='utf-8', index=False)


