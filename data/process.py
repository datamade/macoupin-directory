import pandas as pd
import numpy as np
import re

df = pd.read_csv('resources/directorybusinessgovernmentservices.csv')
df['lat'] = df.NameLatLong.apply(lambda x: s.split(',')[-2])
df['long'] = df.NameLatLong.apply(lambda x: s.split(',')[-1])

df.to_csv('resources/directory_geocoded.csv', index=False)