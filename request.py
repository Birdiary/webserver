import json
import requests
import os
def send_request(file):
    payload = {
        "start_date" : 123,
        "end_date" : 123,
        "audio" : "audioKey",
        "environment" : {
            "date": 123,
            "temp": 10
        },
        "detections" : [{
            "date": 123,
            "image": "imageKey",
            "weight" : 7.6},
            {
            "date": 123,
            "image": "imageKey2",
            "weight" : 7.6} ]

    }   
    files = {
         'json': (None, json.dumps(payload), 'application/json'),
         'imageKey': (os.path.basename(file), open(file, 'rb')),
         'imageKey2': (os.path.basename(file), open(file, 'rb')),
         'audioKey': (os.path.basename(file), open(file, 'rb'))
    }
    r = requests.post("http://localhost:5000/movement/fc4ae0c9-bee0-44e8-9c2f-d86c5e932294", files=files)
    print(r.content)

send_request("./static/data/images/svetozar-cenisev-pvqTCIOx9MQ-unsplash.jpg")