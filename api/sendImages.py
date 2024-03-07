import json
import requests
import os 
def send_birddata(url, stationid, payload, audiofile, imagefiles):
    #payload = {
    #    "start_date" : "2022-11-16 15:20:10.210804",
    #    "end_date" : "2022-11-16 15:20:10.210804",
    #    "audio" : "audioKey",
    #    "video" : "videoKey",
    #    "environment" : {
    #        "date": "2022-04-27 16:03:10.210804",
    #        "temperature": 11,
    #        "humidity": 10
    #    },
    #    "weight" : 18
    #}   

    payload["audio"]= "audioKey"
    files = {
         'audioKey': (os.path.basename(audiofile), open(audiofile, 'rb'), 'audio/mpeg')
    }
    imageKeys= []
    for i, image in enumerate(imagefiles):
        key= "imageKey" + str(i)
        files[key]= (os.path.basename(image), open(image, 'rb'))
        imageKeys.append(key)



    payload["images"]= imageKeys
    files['json']= (None, json.dumps(payload), 'application/json')
    r = requests.post(url + "/api/movement/image/" + stationid, files=files)
    print(r.content)


payload = {
    "start_date" : "2024-11-18 18:20:10.210804",
    "end_date" : "2024-11-18 18:20:10.210804",
    "audio" : "audioKey",
    "environment" : {
        "date": "2022-04-27 16:03:10.210804",
        "temperature": 11,
        "humidity": 10
    },
    "weight" : 18
}   
send_birddata("http://localhost:8080", "24943bb4-b902-4b32-9262-f79ecd9d69c7", payload, "test_1.mp3", ["Rotkehlchen_Moment.jpg", "Kleiber_Moment.jpg"])