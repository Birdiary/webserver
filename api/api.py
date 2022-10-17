from flask import Flask, render_template, request, jsonify, send_from_directory

from pymongo import MongoClient
import json
from flask_uploads import configure_uploads, IMAGES, UploadSet, AUDIO, ALL
from scripts.classify_birds import classify
from scripts.email_service import send_email
from sys import modules
from os.path import basename, splitext
from datetime import datetime
from datetime import date

import json

import subprocess
import uuid
import os
import cv2
from redis import Redis
from rq import Queue

import requests



import csv 


birdJSON = {}
    
#read csv file
with open("static/data/birdlist1.csv", encoding='utf-8') as csvf: 
    #load csv file data using csv library's dictionary reader
    csvReader = csv.DictReader(csvf) 

    #convert each csv row into python dict
    for row in csvReader: 
        #print(row, flush=True)
        #add this python dict to json array
        key = row['latinName']
        birdJSON[key] = row['germanName']

    

host= os.getenv('HOST', "localhost")
pwd = os.getenv('Mail_PWD', "ABC")

sensemapUser = os.getenv('opensensemap_User')
sensemapPwd = os.getenv('opensensemap_PWD')
API_KEY = os.getenv('API_KEY', "ABC")


app = Flask(__name__)
redis = Redis(host='redis', port=6379)
q = Queue(connection=redis)
app.config['SECRET_KEY'] = 'thisisasecret'
app.config['JSON_SORT_KEYS'] = False
app.config['UPLOADED_IMAGES_DEST'] = 'uploads/disk/images'
app.config['UPLOADED_AUDIOS_DEST'] = 'uploads/disk/audios'
app.config['UPLOADED_VIDEOS_DEST'] = 'uploads/disk/videos'
app.config['MONGODB_SETTINGS'] = {
    'db': 'your_database',
    'host': 'mongodb',
    'port': 27017
}


client = MongoClient('mongodb',27017)
db = client.birdiary_database
db_old = client.your_database

stations= db.stations



images = UploadSet('images', IMAGES)


audios = UploadSet('audios', AUDIO)
videos = UploadSet('videos', ALL)
configure_uploads(app, (images, audios, videos))


def insert(list, n):
 
    index = len(list)
    # Searching for the position
    for i in range(len(list)):
      if list[i]['date'] < n['date']:
        index = i
        break
 
    # Inserting n in the list
    if index == len(list):
      list = list[:index] + [n]
    else:
      list = list[:index] + [n] + list[index:]
    return list
 

def enqueueable(func):
    if func.__module__ == "__main__":
        func.__module__, _ = splitext(basename(modules["__main__"].__file__))
    return func

@enqueueable
# Create a working task queue  
def videoAnalysis(filename, movement_id, station_id, movement):
    if  os.path.splitext(filename)[1] == ".h264":
        command = "MP4Box -add {} {}.mp4".format("./uploads/disk/videos/" + filename, "./uploads/disk/videos/" + os.path.splitext(filename)[0])
        try:
            output = subprocess.check_output(command, stderr=subprocess.STDOUT, shell=True)
            filename = os.path.splitext(filename)[0] +".mp4"
        except subprocess.CalledProcessError as e:
            print('FAIL:\ncmd:{}\noutput:{}'.format(e.cmd, e.output))

    cap = cv2.VideoCapture('uploads/disk/videos/' + filename)
    total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
    #print(total_frames)
    result=[]
    for fno in range(0, total_frames, 10):
        cap.set(cv2.CAP_PROP_POS_FRAMES, fno)
        _, image = cap.read()
        result.append(classify(image))
        # read next frame
    output = {}
    for i in range(len(result)): 
        for key in result[i]:
            if key in output:
                if result[i][key] > output[key]:
                    output[key]=result[i][key]
            elif key!= "None":
                if result[i][key] > 0.3:
                    output[key]=result[i][key]
    #print(output)
    output2 = {k: v for k, v in output.items()}
    marklist = sorted(output2.items(), key=lambda x:x[1], reverse=True)
    output3 = dict(marklist)
    birds = []
    for key, value in output3.items():
        germanName = ""
        try:
            germanName = birdJSON[key]
        except:
            germanName = ""
        birds.append({"latinName":key, "germanName": germanName, "score" : value})
    print(birds)

    newMovement= dict()

    newMovement["detections"] = birds
    newMovement["video"] = str(host)+ "/api/uploads/videos/" + filename


    station = stations.find_one({"station_id":station_id})
    count = {}
    if "count" in station: 
        count = station["count"]


    if len(birds) > 0:
        try:
            today = movement["start_date"].split()[0]
        except:
            today = date.today()
            today = today.strftime("%Y-%m-%d")

        #print(today)
        latinName=birds[0]['latinName']
        germanName=birds[0]["germanName"]
            

        if today in count:
            existName = False
            for i, det in enumerate(count[today]):
                if det["latinName"] == latinName:
                    existName = True
                    count[today][i]["amount"] = count[today][i]["amount"] + 1
            if existName == False:
                count[today].append({"latinName": latinName, "germanName" : germanName, "amount": 1})
        else:
            count[today] = [{"latinName": latinName, "germanName" : germanName, "amount": 1}]

        for mail in station["mail"]["adresses"]:
            try:
                send_email(mail, filename, str(host)+ "/api/uploads/videos/" + filename, birds, pwd, str(host) +"/view/station/" +station_id )
            except (e):
                print(e)
                print("mail to " + mail + " failed") 

    db["movements_"+station_id].update_one({"mov_id": movement_id}, {'$set': newMovement})
    stations.update_one({"station_id":station_id}, {'$set': {"count":count}})

    return birds

@enqueueable
def saveEnvironment(body, env_id, station_id):

    
    environmentClass = dict()
    for name,value in body.items():
        environmentClass[name]= value
    
    environmentClass["env_id"] = env_id

    environmentList = db["environments_" + station_id].find()
    try:
        month = environmentClass["date"]
        month = month[0:7]
    except:
        month = date.today()
        month = month.strftime("%Y-%m")

    listID =""
    for listElement in environmentList:
        if listElement["month"] == month:
            listID = listElement["list_id"]
            selectedList = listElement
            break

    if listID == "":
        environmentMonth = dict()
        environmentMonth["station_id"] = station_id
        environmentMonth["month"] = month
        environmentMonth["list_id"] = str(uuid.uuid4())
        environmentMonth["measurements"] = []
        environmentMonth["measurements"].insert(0,environmentClass)
        #print(environmentMonth, flush=True)
        db["environments_" + station_id].insert_one(environmentMonth)
    else: 
        measurements = selectedList["measurements"]
        measurements = insert(measurements ,environmentClass)
        #print(measurements, flush=True)
        db["environments_"+ station_id].update_one({"list_id":listID}, {'$set': {"measurements":measurements}})

    # Send Temperature and Humidity to openSenseMap if sensebox id is defined for the station
    # print(station.sensebox_id, flush=True)
    station = stations.find_one({"station_id":station_id})
    try:
        if station.sensebox_id not in ['', None]:
            headersSendSensorValue = {'content-type': 'application/json'}
            sensemapURL = 'https://api.opensensemap.org/boxes/' + station.sensebox_id
            sensors = requests.get(sensemapURL).json()['sensors'] # get sensors of the sensebox
            urlSensorValueSensebox = sensemapURL + '/data'
            dataValue = []
            if 'temperature' in body:
                if body['temperature'] != -50.0:
                    id = [m for m in sensors if m['title'] in ['Temperature']][0]['_id']
                    dataValue.append({'sensor': id, 'value': body['temperature']})
            if 'humidity' in body:
                if body['humidity'] != 1.0:
                    id = [m for m in sensors if m['title'] in ['Humidity']][0]['_id']
                    dataValue.append({'sensor': id, 'value': body['humidity']})
            requestSensorValueSensebox = requests.post(urlSensorValueSensebox, json=dataValue, headers=headersSendSensorValue)
    except:
        print('Station has no sensebox_id')

    return(env_id)
 
@enqueueable
def save_Environment_old(environments, station_id):
    environmentMonths = []
    for environment in environments:
            try:
                month = environment["date"]
                month = month[0:7]
            except:
                month = date.today()
                month = month.strftime("%Y-%m")

            
            index= len(environmentMonths)
            listID=""
            for i in range(len(environmentMonths)):
                if environmentMonths[i]["month"] == month:
                    index=i
                    listID= environmentMonths[i]["list_id"]
                    break

            if listID == "":
                environmentMonth = dict()
                environmentMonth["station_id"] = station_id
                environmentMonth["month"] = month
                environmentMonth["list_id"] = str(uuid.uuid4())
                environmentMonth["measurements"] = []
                environmentMonth["measurements"].insert(0,environment)
                environmentMonths.insert(0, environmentMonth)
            else: 
                measurements = environmentMonths[index]["measurements"]
                measurements = insert(measurements, environment)
                environmentMonths[index]["measurements"] = measurements

    db["environments_"+station_id].insert_many(environmentMonths)
    return environmentMonths

@enqueueable
def save_station_id(station_id):
    db["movements_"+station_id].update_many({}, {"$set": { "station_id" : station_id }})
    return station_id


@app.route('/')
def index():
    return render_template('./index.html') 



@app.route('/api/image', methods=['POST'])
def image():
    if request.method=="POST":
        data = request.files['image']
        #print (data)
        filename = images.save(data)
        result = classify('uploads/disk/images/' + filename)

        return jsonify(
            result=result
    )

@app.route('/api/video', methods=['Get', 'POST'])
def video():
    if request.method=="POST":
        data = request.files['video']
        #print (data, flush=True)
        filename = videos.save(data)
        command = "MP4Box -add {} {}.mp4".format("./uploads/disk/videos/" + filename, "./uploads/disk/videos/" + os.path.splitext(filename)[0])
        try:
            output = subprocess.check_output(command, stderr=subprocess.STDOUT, shell=True)
        except subprocess.CalledProcessError as e:
             print('FAIL:\ncmd:{}\noutput:{}'.format(e.cmd, e.output))
        cap = cv2.VideoCapture('uploads/disk/videos/' + os.path.splitext(filename)[0] +".mp4")
        total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
        #print(total_frames)
        result=[]
        images = 0
        for fno in range(0, total_frames, 20):
            cap.set(cv2.CAP_PROP_POS_FRAMES, fno)
            _, image = cap.read()
            images +=1
            result.append(classify(image))
	        # read next frame
        output = {}
        for i in range(len(result)): 
            for key in result[i]:
                if key in output:
                    output[key]+=result[i][key]
                else:
                    output[key]=result[i][key]
        #print(output)
        output2 = {k: v / images for k, v in output.items()}
        marklist = sorted(output2.items(), key=lambda x:x[1], reverse=True)
        birds = dict(marklist)
        #print(birds)
                
        return jsonify(
            result= birds
        )
    return render_template('./index.html')

@app.route('/api/audio', methods=['POST'])
def audio():
    if request.method=="POST":
        # this line goes to the console/terminal in flask dev server
        data = request.files['audio']
        #print (data)
        # this line prints out the form to the browser
        #return jsonify(data)
        filename = audios.save(data)
        return filename
    return render_template('./index.html')

@app.route('/api/station', methods=['GET', 'POST'])
def add_station():
    if request.method=="POST":
        body = request.get_json()
        location = dict()
        location['lat'] = body['location']['lat']
        location['lng']= body['location']['lng']
        arr= []
        for mailToInsert in body['mail']['adresses']:
            print(mailToInsert)
            arr.append(mailToInsert)
        mail = dict()
        mail["adresses"] = arr
        id = str(uuid.uuid4())
        createSensebox = body['createSensebox']
        sensebox_id = ''
        name = body["name"]
        if createSensebox:
            # login to opensensemap account to get token
            loginUrl = 'https://api.opensensemap.org/users/sign-in'
            credentials = {'email': sensemapUser, 'password': sensemapPwd}
            login = requests.post(url=loginUrl, json=credentials)
            response = login.json()
            print(response, flush=True)

            # create sensebox with sensors for temperature and humidity
            # TODO: make modular, i.e. allow to choose which sensors are added to box
            if login.status_code == 200:
                header = {'content-type': 'application/json', 'Authorization': 'Bearer ' + response['token']}
                urlOpensensemap = 'https://api.opensensemap.org/boxes/'
                sensors = [{'title': 'Temperature', 'unit': '°C', 'sensorType': 'DHT22'}, {'title': 'Humidity', 'unit': '%', 'sensorType': 'DHT22'}]
                data = {'name': name, 'exposure': 'outdoor', 'grouptag': 'Birdiary', 'location': [location.lng, location.lat], 'sensors': sensors} 
                sensemapRequest = requests.post(urlOpensensemap, json=data, headers=header)

                # if sensebox was created successfully add sensebox id
                if sensemapRequest.status_code == 201:
                    sensebox_id = sensemapRequest.json()['data']['_id']

        #print(mail)
        count = dict()
        # Add object to movie and save
        station = stations.insert_one({"station_id": id, "location":location, "name":body['name'], "mail":mail, "count": count, "sensebox_id":sensebox_id})
        movementsCollection = db["movements_"+ id]
        movementsCollection.create_index( [( "start_date", -1 )] )
        environmentCollection = db["environments_"+ id]
        environmentCollection.create_index( [( "month", -1 )] )

        return {"id": id}, 201
    station = list(stations.find({}, {'_id' : False, "mail":False} ))
    return  jsonify(station), 200

@app.route('/api/station/old', methods=['GET', 'POST'])
def add_station_old():
    if request.method=="POST":
        body = request.get_json()
        location = dict()
        location['lat'] = body['location']['lat']
        location['lng']= body['location']['lng']
        arr= []
        for mailToInsert in body['mail']['adresses']:
            print(mailToInsert)
            arr.append(mailToInsert)
        mail = dict()
        mail["adresses"] = arr
        station_id = body['station_id']
        #senseboxid = ""
        #if(body['senseboxID']):
        #    senseboxid = body['senseboxID']
        #else: 
        #    senseboxid

        print(mail)
        try:
            count = body["count"]
        except:
            count= dict()
        try:
            sensebox_id= body["sensebox_id"]
        except:
            sensebox_id = ""
        # Add object to movie and save
        station = db.stations.insert_one({"station_id": station_id, "location":location, "name":body['name'], "mail":mail, "count": count, "sensebox_id": sensebox_id})
        movements= body['measurements']['movements']
        movementsCollection = db["movements_"+ station_id]
        movementsCollection.create_index( [( "start_date", -1 )] )
        environmentCollection = db["environments_"+ station_id]
        environmentCollection.create_index( [( "month", -1 )] )
        for movement in movements:
            db["movements_"+station_id].insert_one(movement)
        environments = body['measurements']['environment']
        job = q.enqueue(save_Environment_old, environments, station_id)
        
        return {"id": station_id}, 201
    if request.method=="GET":
        stations= list(db_old.station.find({}, {"measurements" : False, "_id" : False}))
        return jsonify(stations)


@app.route('/api/station/old/<station_id>', methods=['GET', 'PUT'])
def oldstation(station_id: str):
    if request.method=="GET":
        station= list(db_old.station.find({"station_id": station_id}, {"_id" : False}))
        return station
    if request.method=="PUT":
        body = request.get_json()
        environments_to_add= body["measurements"]["environment"]
        for environment in environments_to_add:
            save_Environment_old(environment, station_id)
        movements_to_add = body["measurements"]["movements"]
        for movement in movements_to_add:
            movement["station_id"] = station_id
            db["movements_"+station_id].insert_one(movement)
        station = list(db.stations.find({"station_id": station_id}, {"_id" : False}))
        count = station[0]["count"]
        dates = ["2022-09-28", "2022-09-29", "2022-09-30"]
        for date in dates:
            try:
                count[date] = body["count"][date]
            except:
                print(date)

        return station_id

@app.route('/api/station/<station_id>', methods=['GET', 'PUT', 'DELETE'])
def station(station_id: str):
    if request.method=="GET":
        numberOfMovements = request.args.get('movements')
        station = stations.find_one({"station_id":station_id}, {'_id' : False} )
        #print(station, flush=True)
        if station is None:
            return "not found", 404
        movements=[]
        if numberOfMovements and int(numberOfMovements) > 0:
            movements = list(db["movements_" + station_id].find({}, {'_id' : False}).sort("start_date",-1).limit(int(numberOfMovements)))
        else:
            movements = list(db["movements_" + station_id].find({}, {'_id' : False}).sort("start_date",-1))
        station["measurements"] = dict()
        station["measurements"]["movements"] = movements
        environment= db["environments_"+station_id].find({}, {'_id' : False}).sort("month",-1)
        environment = list(environment)
        #print(environment, flush=True)
        environments = []
        for months in environment:
            environments= environments + months["measurements"]
        station["measurements"]["environment"] = environments
        return jsonify(station), 200
    if request.method=="PUT":
        apikey= request.args.get("apikey")
        body = request.get_json()
        if API_KEY != apikey:
            return "Not authorized", 401
        result= stations.update_one({"station_id":station_id}, {'$set': body})
        return jsonify(result.modified_count), 200
    if request.method=="DELETE":
        apikey= request.args.get("apikey")
        deleteData = request.args.get("deleteData")
        if API_KEY != apikey:
            return "Not authorized", 401
        stations.delete_one({"station_id": station_id})
        if(deleteData):
            movementsCollection = db["movements_"+station_id]
            movementsCollection.drop
            environmentCollection = db["environments_"+station_id]
            environmentCollection.drop
        return jsonify(str(station_id)), 200


@app.route('/api/environment/<station_id>', methods=['POST'])
def add_environment(station_id: str):
    content_type = request.headers.get('Content-Type')

    body = request.get_json()

    env_id = str(uuid.uuid4())
    job = q.enqueue(saveEnvironment, body,env_id,station_id)

    return jsonify(id = env_id), 200

@app.route('/api/movement/<station_id>', methods=['POST'])
def add_movement(station_id: str):
    content_type = request.headers.get('Content-Type')
    print(content_type, flush=True)
    ##TODO: Count Birds in image and Crop images to bird onyl 

    body = request.form['json']
    body = json.loads(body)

    movementsClass = dict()
    mov_id = str(uuid.uuid4())
    movementsClass["station_id"] =station_id
    movementsClass["mov_id"] = mov_id
    movementsClass["start_date"] = body['start_date']
    movementsClass["end_date"] = body['end_date']
    movementsClass["weight"] = body['weight']
    movementsClass["detections"] = []
    audio = request.files[body['audio']]
    filename = audios.save(audio)
    movementsClass["audio"] = str(host)+ "/api/uploads/audios/" + filename
    video = request.files[body['video']]
    filename = videos.save(video)
    movementsClass["video"] = "pending"
    

    environmentClass = dict()
    for name,value in body['environment'].items():
        environmentClass[name]= value
    env_id = str(uuid.uuid4())
    environmentClass["env_id"] = env_id

    movementsClass["environment"] = environmentClass
    
    
    db["movements_"+station_id].insert_one(movementsClass)
    job= q.enqueue(videoAnalysis, filename, mov_id, station_id, movementsClass)  
    #print(movementList)

    return jsonify(id = mov_id), 200

@app.route('/api/movement/<station_id>/<movement_id>', methods=['DELETE'])
def delete_movement(station_id: str, movement_id: str):
    apikey= request.args.get("apikey")
    deleteData = request.args.get("deleteData")
    if API_KEY != apikey:
        return "Not authorized", 401
    db["movements_" + station_id].delete_one({"mov_id": movement_id})
    return jsonify(str(station_id)), 200

@app.route('/api/movement/<station_id>', methods=['PUT'])
def insert_station_id(station_id: str):
    job = q.enqueue(save_station_id, station_id)
    return "ok", 200

@app.route('/api/uploads/images/<filename>')
def getImages(filename):
    return send_from_directory(app.config['UPLOADED_IMAGES_DEST'], filename)

@app.route('/api/uploads/audios/<filename>')
def getAudios(filename):
    return send_from_directory(app.config['UPLOADED_AUDIOS_DEST'], filename)

@app.route('/api/uploads/videos/<filename>')
def getVideos(filename):
    return send_from_directory(app.config['UPLOADED_VIDEOS_DEST'], filename)



@app.route('/api/count')
def count():

    station=  stations.find({},{"count":1})
    counts= list(station)
    count = {}
    for countObjects in counts:
        try:
            countObjects = dict(countObjects["count"])
            for date  in countObjects:
                #print(date, flush=True) 
                for detections in countObjects[date]: 
                    #print(detections, flush=True)
                    latinName = detections["latinName"]
                    germanName = detections["germanName"]
                    if date in count:
                        existName = False
                        for i, det in enumerate(count[date]):
                            if det["latinName"] == latinName:
                                existName = True
                                count[date][i]["amount"] = count[date][i]["amount"] + detections["amount"]
                        if existName == False:
                            count[date].append({"latinName": latinName, "germanName" : germanName, "amount": detections["amount"]})
                    else:
                        count[date] = [{"latinName": latinName, "germanName" : germanName, "amount": detections["amount"]}]
        except:
            print("No count available")
    return count

#@app.route('/api')
#def api():
#    return render_template('./redoc/redoc.html')


if __name__==('__main__'):
    app.run(host="0.0.0.0", debug=False)