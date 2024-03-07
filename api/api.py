from flask import Flask, render_template, request, jsonify, send_from_directory, send_file

from pymongo import MongoClient
import json
from flask_uploads import configure_uploads, IMAGES, UploadSet, AUDIO, ALL
from scripts.classify_birds import classify
from scripts.email_service import send_email
from sys import modules
from os.path import basename, splitext
from datetime import datetime, timedelta, date
import random
import yaml
import json
import time
import subprocess
import uuid
import os, shutil
import cv2
from redis import Redis
from rq import Queue

import requests
import csv 
import sentry_sdk
from sentry_sdk.integrations.flask import FlaskIntegration
import unicodedata
def remove_control_characters(s):
    return "".join(ch for ch in s if unicodedata.category(ch)[0]!="C")


def traces_sampler(sampling_context):
    # Examine provided context data (including parent decision, if any)
    # along with anything in the global namespace to compute the sample rate
    # or sampling decision for this transaction
    #print(sampling_context["wsgi_environ"], flush=True)

    if "static" in sampling_context["wsgi_environ"]["PATH_INFO"]:
        # These are important - take a big sample
        return 0.001
    elif ("environment" in  sampling_context["wsgi_environ"]["PATH_INFO"] or "movement" in sampling_context["wsgi_environ"]["PATH_INFO"]) and "POST" == sampling_context["wsgi_environ"]["REQUEST_METHOD"]:
        # These are less important or happen much more frequently - only take 1%
        #print("first: " + sampling_context["wsgi_environ"]["PATH_INFO"], flush=True)
        return 0.01
    elif "uploads" in sampling_context["wsgi_environ"]["PATH_INFO"]:
        # These are less important or happen much more frequently - only take 1%
        #print(sampling_context["wsgi_environ"]["PATH_INFO"], flush=True)
        return 0.01
    else:
        # Default sample rate
        return 0.5

sentry_sdk.init(
    dsn="https://f7dc32893aa54ef5b2b3df3a3067c5cb@o4504179650723840.ingest.sentry.io/4504179659898880",
    integrations=[
        FlaskIntegration(),
    ],

    # Set traces_sample_rate to 1.0 to capture 100%
    # of transactions for performance monitoring.
    # We recommend adjusting this value in production.
    traces_sampler=traces_sampler
)

def insertMax(list, n, key):
 
    index = len(list)
    # Searching for the position
    for i in range(len(list)):
      if list[i][key] > n[key]:
        index = i
        break
 
    # Inserting n in the list
    if index == len(list):
      list = list[:index] + [n]
    else:
      list = list[:index] + [n] + list[index:]
    return list[1:6]

def insertMin(list, n, key):
 
    index = len(list)
    # Searching for the position
    for i in range(len(list)):
      if list[i][key] < n[key]:
        index = i
        break
 
    # Inserting n in the list
    if index == len(list):
      list = list[:index] + [n]
    else:
      list = list[:index] + [n] + list[index:]
    return list[1:6]

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
q2 = Queue("image", connection=redis)
q3 = Queue("statistics", connection=redis)
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

SECURE_KEY = os.getenv('AES_KEY', "ABC")
SECURE_IV = os.getenv('AES_IV', 'ABC')
from Crypto.Cipher import AES
import base64

def decrypt(enc,key,iv):
    key = bytes.fromhex(key)
    iv = bytes.fromhex(iv)
    enc = base64.b64decode(enc)
    cipher = AES.new(key, AES.MODE_CBC, iv)
    return cipher.decrypt(enc)

client = MongoClient('mongodb',27017)
db = client.birdiary_database

stations= db.stations



imagesSet = UploadSet('images', IMAGES)
audios = UploadSet('audios', AUDIO)
videos = UploadSet('videos', ALL)
configure_uploads(app, (imagesSet, audios, videos))


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
    #This function is a decorator that takes in a function and checks whether it is defined in the main module or imported from another module. If the function is defined in the main module, it updates its module name to the name of the script file. 
    # This is done to ensure that the function can be properly pickled and added to a task queue for asynchronous execution.
    if func.__module__ == "__main__":
        func.__module__, _ = splitext(basename(modules["__main__"].__file__))
    return func

@enqueueable
def deleteImage(id):
    os.remove('./uploads/raspberry-pi-os' +id  +'.img')
    os.remove('./uploads/raspberry-pi-os' +id  +'draft.img')

@enqueueable
def removeMovementFiles(movement):
    videofile = movement["video"]
    videofilename = os.path.basename(videofile)
    audiofile = movement["audio"]
    audiofilename = os.path.basename(audiofile)
    os.remove("./uploads/disk/audios/" + audiofilename)
    os.remove("./uploads/disk/videos/" + videofilename)


@enqueueable
def deleteMovement(movement_id, station_id):
    movement = db["movements_"+station_id].find_one({"mov_id": movement_id}, {'_id' : False})
    videofile = movement["video"]
    videofilename = os.path.basename(videofile)
    audiofile = movement["audio"]
    audiofilename = os.path.basename(audiofile)
    os.remove("./uploads/disk/audios/" + audiofilename)
    os.remove("./uploads/disk/videos/" + videofilename)
    db["movements_" + station_id].delete_many({"mov_id": movement_id})
    station = stations.find_one({"station_id":station_id}, {'_id' : False} )
    if station["type"] == "exhibit":
        if station["lastMovement"]["mov_id"] == movement["mov_id"]:
                statistics = db["statistics"].find_one({"station_id": "all"}, {'_id' : False})
                bird = random.choice(statistics["specialBirds"])
                movement = random.choice(bird["movements"])
                stations.update_one({"station_id":station_id}, {'$set': {"lastMovement" : movement}})
                    

    

@enqueueable
def modify_image(id, credentials, rotation, time, i):
    try:
        SSID = decrypt(credentials["SSID"], SECURE_KEY, SECURE_IV)
        password= decrypt(credentials["password"], SECURE_KEY, SECURE_IV)
        SSID = remove_control_characters(SSID.decode().strip())
        password = remove_control_characters(password.decode().strip())
        SSID = SSID
        password = password
        if SSID == "":
            SSID= "YourSSID"
        if password == "":
            pwd = "YourPassword"
        config_lines = [
        '\n',
        'network={',
        '\tssid="{}"'.format(SSID),
        '\tpsk="{}"'.format(pwd),
        '\tkey_mgmt=WPA-PSK',
        '}'
        ]

        config = '\n'.join(config_lines)
        # Define the path to the original Raspberry Pi OS image
        original_image_path = './uploads/pi.img'

        # Define the path to the copy of the original Raspberry Pi OS image
        copy_image_path = './uploads/raspberry-pi-os' +id  +'draft.img'
        finished_image_path = './uploads/raspberry-pi-os' +id  +'.img'

        # Define the temporary directory where the image will be mounted
        mount_dir = '/mnt/rpi'

        if not os.path.exists(mount_dir):
            subprocess.run( 'mkdir /mnt/rpi', check=True, stderr=subprocess.STDOUT, shell=True)
        elif os.listdir(mount_dir):
            shutil.rmtree(mount_dir)
        
        # Create a copy of the original image file
        #subprocess.run( 'losetup -d /dev/loop3', check=True, stderr=subprocess.STDOUT, shell=True)
  
        subprocess.run( 'losetup -a', check=True, stderr=subprocess.STDOUT, shell=True)

        command =  'cp '+  original_image_path + " "+ copy_image_path
        subprocess.run(command, stderr=subprocess.STDOUT, check=True, shell=True)

    
        # Mount the copy of the image as a loop device

        output=subprocess.run('losetup -P /dev/loop3 ' + copy_image_path, check=True, shell=True)
        print(output, flush=True)
        subprocess.run( 'ls -l /dev/loop*', check=True, stderr=subprocess.STDOUT, shell=True)

        output= subprocess.run( 'mount /dev/loop3p2 '+ mount_dir ,stderr=subprocess.STDOUT, check=True, shell=True)


        with open(mount_dir + '/home/pi/station/config.yaml') as file:
            doc = yaml.safe_load(file)
            rotation = 180
            time = 2
            try: 
                rotation = int(rotation)
            except: 
                rotation = 180
            try: 
                time = int(time)
            except: 
                time = 2
                
            doc['station']['boxId'] = id
            doc['station']['cameraRotation'] = rotation
            doc['station']['environmentTimeDeltaInMinutes'] = time
            print(doc, flush=True)

        with open(mount_dir+ '/home/pi/station/config.yaml', 'w') as file:
            yaml.dump(doc, file)



        with open(mount_dir+ "/etc/wpa_supplicant/wpa_supplicant.conf", "a+") as wifi:
            wifi.write(config)
        # Unmount the filesystem and detach the loop device
        subprocess.run([ 'umount '+mount_dir], check=True, stderr=subprocess.STDOUT, shell=True)
        subprocess.run([ 'losetup -d /dev/loop3'], check=True, stderr=subprocess.STDOUT, shell=True)
        command =  'cp '+  copy_image_path + " "+ finished_image_path
        subprocess.run(command, stderr=subprocess.STDOUT, check=True, shell=True)
        job = q.enqueue_in(timedelta(minutes=60), deleteImage, id)
        return
    except subprocess.CalledProcessError as e:
        job = q2.enqueue(modify_image, id, credentials, rotation,time, i+1)
        print('FAIL:\ncmd:{}\noutput:{}'.format(e.cmd, e.output), flush=True)
        try:
            subprocess.run('umount '+mount_dir, check=True, stderr=subprocess.STDOUT, shell=True)
        except: 
            print("not mounted")
        if i> 1:
            try:
                subprocess.run('losetup -d /dev/loop3', check=True, stderr=subprocess.STDOUT, shell=True)
            except:
                print("not looped")
        return

@enqueueable
def calculateStatistics(reque):
    birdsOfInterest= list(["Passer domesticus", "Parus major","Cyanistes caeruleus","Erithacus rubecula","Turdus merula","Fringilla coelebs","Dendrocopos major","Garrulus glandarius", "Pica pica", "Pyrrhula pyrrhula", "Emberiza citrinella", "Chloris chloris", "Picus viridis", "Coccothraustes coccothraustes", "Sitta europaea", "Vanellus vanellus","Corvus cornix", "Aegithalos caudatus","Sturnus vulgaris","Carduelis carduelis","Troglodytes troglodytes","Phylloscopus collybita", "Psittacula krameri", "Phoenicurus ochruros", "Prunella modularis", "Phoenicurus phoenicurus", "Serinus serinus", "Emberiza citrinella"])
    stationsList = list(stations.find({ "type": {  "$nin": ["test", "exhibit"] } }, {'_id' : False, "mail":False} ))
    stationsComplete = []
    for station in stationsList:
        movements = list(db["movements_" + station["station_id"]].find({}, {'_id' : False}).sort("start_date",-1))
        station["measurements"] = dict()
        station["measurements"]["movements"] = movements
        environment= db["environments_"+station["station_id"]].find({}, {'_id' : False}).sort("month",-1)
        environment = list(environment)
        #print(environment, flush=True)
        environments = []
        for months in environment:
            environments= environments + months["measurements"]
        station["measurements"]["environment"] = environments
        stationsComplete.append(station)

    statisticsALL= dict()
    statisticsALL["station_id"] = "all"
    statisticsALL["name"] = "all"
    statisticsALL["numberOfMovements"] = 0
    statisticsALL["perDay"] = dict()
    statisticsALL["maxDay"] = [{"sum": 0}, {"sum": 0}, {"sum": 0}, {"sum": 0}, {"sum": 0}]
    statisticsALL["maxTemp"] = [{"temperature": -20}, {"temperature": -20},{"temperature": -20},{"temperature": -20},{"temperature": -20}]
    statisticsALL["minTemp"] = [{"temperature": 50}, {"temperature": 50}, {"temperature": 50}, {"temperature": 50}, {"temperature": 50}]
    statisticsALL["maxHum"] = [{"humidity": 0},{"humidity": 0},{"humidity": 0},{"humidity": 0},{"humidity": 0}]
    statisticsALL["minHum"] = [{"humidity": 100},{"humidity": 100},{"humidity": 100},{"humidity": 100},{"humidity": 100}]
    statisticsALL["specialBirds"]  = dict()
    statisticsALL["sumEnvironment"] = 0
    statisticsALL["sumTemperature"] = 0
    statisticsALL["sumHumidity"] = 0
    statisticsALL["maxSpecies"] = [{"amount": 0}, {"amount": 0}, {"amount": 0}, {"amount": 0} , {"amount": 0}]
    statisticsALL["maxValidatedBirds"] = [{"sum": 0}, {"sum": 0}, {"sum": 0}, {"sum": 0} , {"sum": 0}]
    statisticsALL["all"] = dict()
    statisticsALL["numberOfDetections"] = 0
    statisticsALL["numberOfValidatedBirds"] = 0
    statisticsALL["validatedBirds"] = dict()

    statisticsComplete=[]


    for station in stationsComplete:
        statistics= {}
        station_id= station["station_id"]
        statistics["station_id"] = station_id
        statistics["name"] = station["name"]
        statistics["createdAt"] = str(datetime.now())
        statistics["numberOfMovements"] = len(station["measurements"]["movements"])
        statisticsALL["numberOfMovements"] = statisticsALL["numberOfMovements"]+ len(station["measurements"]["movements"])
        statistics["perDay"] = {}
        statistics["maxDay"] = [{"sum": 0}, {"sum": 0}, {"sum": 0}, {"sum": 0}, {"sum": 0}]
        statistics["maxTemp"] = [{"temperature": -20}, {"temperature": -20},{"temperature": -20},{"temperature": -20},{"temperature": -20}]
        statistics["minTemp"] = [{"temperature": 50}, {"temperature": 50}, {"temperature": 50}, {"temperature": 50}, {"temperature": 50}]
        statistics["maxHum"] = [{"humidity": 0},{"humidity": 0},{"humidity": 0},{"humidity": 0},{"humidity": 0}]
        statistics["minHum"] = [{"humidity": 100},{"humidity": 100},{"humidity": 100},{"humidity": 100},{"humidity": 100}]
        statistics["specialBirds"]  = {}
        statistics["sumEnvironment"] = 0
        statistics["sumTemperature"] = 0
        statistics["sumHumidity"] = 0
        statistics["maxSpecies"] = [{"amount": 0}, {"amount": 0}, {"amount": 0}, {"amount": 0} , {"amount": 0}]
        statistics["maxValidatedBirds"] = [{"sum": 0}, {"sum": 0}, {"sum": 0}, {"sum": 0} , {"sum": 0}]
        statistics["all"] = {}
        statistics["numberOfDetections"] = 0
        statistics["numberOfValidatedBirds"] = 0
        statistics["validatedBirds"] = {}

        for movement in station["measurements"]["movements"]:
            detection = True
            if "detections" in movement and len(movement["detections"])  >0:
                if movement["detections"][0]["latinName"] == "None":
                    if len(movement["detections"]) < 2:
                        detection = False
                    else:
                        movement["detections"][0] = movement["detections"][1]
            else:
                detection = False

            if "validation" in movement:
                statistics["numberOfValidatedBirds"] = statistics["numberOfValidatedBirds"] + 1
                statisticsALL["numberOfValidatedBirds"] = statisticsALL["numberOfValidatedBirds"] + 1
                max= {"amount" : 0} 
                for key in movement["validation"]["summary"]:
                    if movement["validation"]["summary"][key]["amount"] > max["amount"]:
                        max = movement["validation"]["summary"][key]
                if max["latinName"] != 'None':
                    if max["latinName"] in statistics["validatedBirds"]:
                        statistics["validatedBirds"][max["latinName"]]["sum"] = statistics["validatedBirds"][max["latinName"]]["sum"] +1
                        if len(statistics["validatedBirds"][max["latinName"]]["movements"]) < 20:
                            statistics["validatedBirds"][max["latinName"]]["movements"].append({"mov_id": movement["mov_id"], "station_id" : station_id,"video": movement["video"], "start_date":movement["start_date"]})
                    else:
                        statistics["validatedBirds"][max["latinName"]] = {"sum" :1}
                        statistics["validatedBirds"][max["latinName"]]["movements"] = [{"mov_id": movement["mov_id"], "station_id" : station_id, "video": movement["video"], "start_date":movement["start_date"]}]
                    if max["latinName"] in statisticsALL["validatedBirds"]:
                        statisticsALL["validatedBirds"][max["latinName"]]["sum"] = statisticsALL["validatedBirds"][max["latinName"]]["sum"] +1
                        if len(statisticsALL["validatedBirds"][max["latinName"]]["movements"]) < 20:
                            statisticsALL["validatedBirds"][max["latinName"]]["movements"].append({"mov_id": movement["mov_id"], "station_id" : station_id, "station_name" : station["name"], "video": movement["video"], "start_date":movement["start_date"]})
                    else:
                        statisticsALL["validatedBirds"][max["latinName"]]= {"sum" :1} 
                        statisticsALL["validatedBirds"][max["latinName"]]["movements"] = [{"mov_id": movement["mov_id"], "station_id" : station_id, "station_name" : station["name"],"video": movement["video"], "start_date":movement["start_date"]}]

            if detection == True:   
                statistics["numberOfDetections"] = statistics["numberOfDetections"] + 1         
                statisticsALL["numberOfDetections"] = statisticsALL["numberOfDetections"] + 1                 
                latinName = movement["detections"][0]["latinName"]
                germanName = movement["detections"][0]["germanName"]
                existName =False
                day = movement["start_date"].split()[0]

                if day in statistics["perDay"]:
                    statistics["perDay"][day]["sum"] = statistics["perDay"][day]["sum"] +1
                    if latinName in statistics["perDay"][day]:
                        statistics["perDay"][day][latinName]["amount"] = statistics["perDay"][day][latinName]["amount"] + 1
                    else:
                        statistics["perDay"][day][latinName] = {"latinName": latinName, "germanName" : germanName, "amount": 1, "movements":[]}    
                else:
                    statistics["perDay"][day] = {latinName : {"latinName": latinName, "germanName" : germanName, "amount": 1, "movements":[]}}
                    statistics["perDay"][day]["sum"] = 1

                if day in statisticsALL["perDay"]:
                    statisticsALL["perDay"][day]["sum"] = statisticsALL["perDay"][day]["sum"] +1
                    if latinName in statisticsALL["perDay"][day]:
                        statisticsALL["perDay"][day][latinName]["amount"] = statisticsALL["perDay"][day][latinName]["amount"] + 1
                    else:
                        statisticsALL["perDay"][day][latinName] = {"latinName": latinName, "germanName" : germanName, "amount": 1, "movements":[]}    
                else:
                    statisticsALL["perDay"][day] = {latinName : {"latinName": latinName, "germanName" : germanName, "amount": 1, "movements":[]}}
                    statisticsALL["perDay"][day]["sum"] = 1

                if latinName in statistics["all"]:
                    statistics["all"][latinName]["amount"] = statistics["all"][latinName]["amount"] +1
                else:
                    statistics["all"][latinName] = {"latinName": latinName, "germanName" : germanName, "amount": 1, "movements":[]}

                if latinName in statisticsALL["all"]:
                    statisticsALL["all"][latinName]["amount"] = statisticsALL["all"][latinName]["amount"] +1
                else:
                    statisticsALL["all"][latinName] = {"latinName": latinName, "germanName" : germanName, "amount": 1, "movements":[]}

                if latinName in birdsOfInterest and movement["detections"][0]["score"] > 0.8:
                    if latinName in statistics["specialBirds"]:
                        if len(statistics["specialBirds"][latinName]["movements"]) < 20:
                            statistics["specialBirds"][latinName]["movements"].append({"mov_id": movement["mov_id"], "station_id" : station_id,"score": movement["detections"][0]["score"], "video": movement["video"], "start_date":movement["start_date"]})
                        elif len(statistics["specialBirds"][latinName]["movements"]) < 40 and movement["detections"][0]["score"] > 0.85:
                            statistics["specialBirds"][latinName]["movements"].append({"mov_id": movement["mov_id"], "station_id" : station_id,"score": movement["detections"][0]["score"], "video": movement["video"], "start_date":movement["start_date"]})
                    else:
                        statistics["specialBirds"][latinName] = {"latinName": latinName, "germanName" : germanName, "movements":[{"mov_id": movement["mov_id"], "station_id" : station_id,"score": movement["detections"][0]["score"], "video": movement["video"], "start_date":movement["start_date"]}]} 

                if latinName in birdsOfInterest and movement["detections"][0]["score"] > 0.8:
                    if latinName in statisticsALL["specialBirds"]:
                        if len(statisticsALL["specialBirds"][latinName]["movements"]) < 20:
                            movement["station_name"] = station["name"]
                            statisticsALL["specialBirds"][latinName]["movements"].append(movement)
                        elif len(statisticsALL["specialBirds"][latinName]["movements"]) < 40 and movement["detections"][0]["score"] > 0.85:
                            movement["station_name"] = station["name"]
                            statisticsALL["specialBirds"][latinName]["movements"].append(movement)
                    else:
                        movement["station_name"] = station["name"]
                        statisticsALL["specialBirds"][latinName] = {"latinName": latinName, "germanName" : germanName, "movements":[movement]} 

                if len(statistics["perDay"][day][latinName]["movements"]) < 20:
                    statistics["perDay"][day][latinName]["movements"].append({"mov_id": movement["mov_id"], "station_id" : station_id, "score": movement["detections"][0]["score"],"video": movement["video"], "start_date":movement["start_date"]})
                elif len(statistics["perDay"][day][latinName]["movements"]) < 40 and movement["detections"][0]["score"] > 0.85:
                    statistics["perDay"][day][latinName]["movements"].append({"mov_id": movement["mov_id"], "station_id" : station_id, "score": movement["detections"][0]["score"],"video": movement["video"], "start_date":movement["start_date"]})
                if len(statistics["all"][latinName]["movements"]) < 20:
                    statistics["all"][latinName]["movements"].append({"mov_id": movement["mov_id"], "station_id" : station_id, "score": movement["detections"][0]["score"],"video": movement["video"], "start_date":movement["start_date"]})
                elif len(statistics["all"][latinName]["movements"]) < 40 and movement["detections"][0]["score"] > 0.85:
                    statistics["all"][latinName]["movements"].append({"mov_id": movement["mov_id"], "station_id" : station_id, "score": movement["detections"][0]["score"],"video": movement["video"], "start_date":movement["start_date"]})

                if len(statisticsALL["perDay"][day][latinName]["movements"]) < 20:
                    statisticsALL["perDay"][day][latinName]["movements"].append({"mov_id": movement["mov_id"],"station_id":station_id, "station_name" : station["name"], "score": movement["detections"][0]["score"],"video": movement["video"], "start_date":movement["start_date"]})
                elif len(statisticsALL["perDay"][day][latinName]["movements"]) < 40 and movement["detections"][0]["score"] > 0.85:
                    statisticsALL["perDay"][day][latinName]["movements"].append({"mov_id": movement["mov_id"], "station_id":station_id, "station_name" : station["name"],"score": movement["detections"][0]["score"],"video": movement["video"], "start_date":movement["start_date"]})
                if len(statisticsALL["all"][latinName]["movements"]) < 20:
                    statisticsALL["all"][latinName]["movements"].append({"mov_id": movement["mov_id"],"station_id":station_id, "station_name" : station["name"], "score": movement["detections"][0]["score"],"video": movement["video"], "start_date":movement["start_date"]})
                elif len(statisticsALL["all"][latinName]["movements"]) < 40 and movement["detections"][0]["score"] > 0.85:
                    statisticsALL["all"][latinName]["movements"].append({"mov_id": movement["mov_id"],"station_id":station_id, "station_name" : station["name"], "score": movement["detections"][0]["score"], "video": movement["video"], "start_date":movement["start_date"]})
        
        for env in station["measurements"]["environment"]:
                
                if int(env["temperature"]) > -20 and int(env["temperature"]) < 60 :
                    statistics["sumTemperature"] = statistics["sumTemperature"] + env["temperature"]
                    statisticsALL["sumTemperature"] = statisticsALL["sumTemperature"] + env["temperature"]
                if int(env["humidity"]) > -1 and int(env["humidity"]) < 101 :
                    
                    statistics["sumEnvironment"] = statistics["sumEnvironment"] + 1 
                    statistics["sumHumidity"] = statistics["sumHumidity"] + env["humidity"]
                    statisticsALL["sumEnvironment"] = statisticsALL["sumEnvironment"] + 1 
                    statisticsALL["sumHumidity"] = statisticsALL["sumHumidity"] + env["humidity"]
                if int(env["temperature"]) > statistics["maxTemp"][0]["temperature"] and int(env["temperature"]) < 60:
                    objectToInsert = {}
                    objectToInsert["temperature"] = int(env["temperature"])
                    objectToInsert["date"] = env["date"]
                    statistics["maxTemp"]= insertMax(statistics["maxTemp"], objectToInsert, "temperature")
                    if env["temperature"] > statisticsALL["maxTemp"][0]["temperature"]:
                        objectToInsertALL = objectToInsert.copy()
                        objectToInsertALL["station_id"] =station_id
                        objectToInsertALL["station_name"] = station["name"]
                        statisticsALL["maxTemp"]= insertMax(statisticsALL["maxTemp"], objectToInsertALL, "temperature")
                if int(env["temperature"]) < statistics["minTemp"][0]["temperature"] and int(env["temperature"]) > -30:
                    objectToInsert = {}
                    objectToInsert["temperature"] = int(env["temperature"])
                    objectToInsert["date"] = env["date"]
                    statistics["minTemp"] = insertMin(statistics["minTemp"], objectToInsert, "temperature")
                    if int(env["temperature"]) < statisticsALL["minTemp"][0]["temperature"]:
                        objectToInsertALL = objectToInsert.copy()
                        objectToInsertALL["station_id"] =station_id
                        objectToInsertALL["station_name"] = station["name"]
                        statisticsALL["minTemp"] = insertMin(statisticsALL["minTemp"], objectToInsertALL, "temperature")
                if int(env["humidity"]) > statistics["maxHum"][0]["humidity"] and int(env["humidity"]) < 100.1:
                    objectToInsert = {}
                    objectToInsert["humidity"] = int(env["humidity"])
                    objectToInsert["date"] = env["date"]
                    statistics["maxHum"] = insertMax(statistics["maxHum"], objectToInsert, "humidity")
                    if int(env["humidity"]) > statisticsALL["maxHum"][0]["humidity"]:
                        objectToInsertALL = objectToInsert.copy()
                        objectToInsertALL["station_id"] =station_id
                        objectToInsertALL["station_name"] = station["name"]
                        statisticsALL["maxHum"] = insertMax(statisticsALL["maxHum"], objectToInsertALL, "humidity")
                if int(env["humidity"]) < statistics["minHum"][0]["humidity"] and int(env["humidity"]) > -0.1:
                    objectToInsert = {}
                    objectToInsert["humidity"] = int(env["humidity"])
                    objectToInsert["date"] = env["date"]
                    statistics["minHum"] =  insertMin(statistics["minHum"], objectToInsert, "humidity")
                    if int(env["humidity"]) < statisticsALL["minHum"][0]["humidity"]:
                        objectToInsertALL = objectToInsert.copy()
                        objectToInsertALL["station_id"] =station_id
                        objectToInsertALL["station_name"] = station["name"]
                        statisticsALL["minHum"] =  insertMin(statisticsALL["minHum"], objectToInsertALL, "humidity")

        for day in statistics["perDay"]:
                if statistics["maxDay"][0]["sum"] < statistics["perDay"][day]["sum"]:
                    objectToInsert = dict()
                    objectToInsert = statistics["perDay"][day]
                    objectToInsert["day"] = day
                    statistics["maxDay"] = insertMax(statistics["maxDay"], objectToInsert, "sum")

        for item in statistics["maxDay"]:
            maxSpeciesOnDay = [{"amount" :0},{"amount" :0},{"amount" :0},{"amount" :0},{"amount" :0}]
            for species in item:
                if species != "sum" and species != "day" and maxSpeciesOnDay[0]["amount"]< item[species]["amount"]:
                    objectToInsert = dict()
                    objectToInsert = item[species]
                    maxSpeciesOnDay = insertMax(maxSpeciesOnDay, objectToInsert, "amount")
            maxSpeciesOnDayfiltered = list(filter(lambda i: i['amount'] != 0, maxSpeciesOnDay))
                    
            if len(maxSpeciesOnDayfiltered) > 0:
                item["mostBirds"] = maxSpeciesOnDayfiltered

        for species in statistics["all"]:
                if species != "sum" and statistics["maxSpecies"][0]["amount"] < statistics["all"][species]["amount"]:
                    objectToInsert = dict()
                    objectToInsert = statistics["all"][species]
                    statistics["maxSpecies"] = insertMax(statistics["maxSpecies"], objectToInsert, "amount")
        statistics["maxSpecies"] = list(filter(lambda i: i['amount'] != 0, statistics["maxSpecies"]))

        for species in statistics["validatedBirds"]:
                if statistics["maxValidatedBirds"][0]["sum"] < statistics["validatedBirds"][species]["sum"]:
                    objectToInsert = dict()
                    objectToInsert = statistics["validatedBirds"][species]
                    objectToInsert["latinName"] = species
                    germanName = ""
                    try:
                        germanName = birdJSON[species]
                    except:
                        germanName = ""
                    objectToInsert["germanName"] = germanName
                    statistics["maxValidatedBirds"] = insertMax(statistics["maxValidatedBirds"], objectToInsert, "sum")
        statistics["maxValidatedBirds"] = list(filter(lambda i: i['sum'] != 0, statistics["maxValidatedBirds"]))

        specialBirds=[]
        for key in statistics['specialBirds']:
            specialBirds.append(statistics['specialBirds'][key])

        statistics['specialBirds'] = specialBirds


        if statistics["sumEnvironment"] > 0:
            statistics["averageTemp"] = statistics["sumTemperature"] / statistics["sumEnvironment"]
            statistics["averageHum"] = statistics["sumHumidity"] / statistics["sumEnvironment"]

        #Remove perDay and validated Birds statistic to keep object small and they are not necessary for the current view
        statistics["perDay"] = len(statistics["perDay"])

        result = db["statistics"].replace_one({"station_id": station_id},statistics, True)


    for day in statisticsALL["perDay"]:
            if statisticsALL["maxDay"][0]["sum"] < statisticsALL["perDay"][day]["sum"]:
                objectToInsert = dict()
                objectToInsert = statisticsALL["perDay"][day]
                objectToInsert["day"] = day
                statisticsALL["maxDay"] = insertMax(statisticsALL["maxDay"], objectToInsert, "sum")

    for item in statisticsALL["maxDay"]:
        maxSpeciesOnDay = [{"amount" :0},{"amount" :0},{"amount" :0},{"amount" :0},{"amount" :0}]
        for species in item:
            if species != "sum" and species != "day" and maxSpeciesOnDay[0]["amount"]< item[species]["amount"]:
                objectToInsert = dict()
                objectToInsert = item[species]
                maxSpeciesOnDay = insertMax(maxSpeciesOnDay, objectToInsert, "amount")
        maxSpeciesOnDayfiltered = list(filter(lambda i: i['amount'] != 0, maxSpeciesOnDay))
                
        if len(maxSpeciesOnDayfiltered) > 0:
            item["mostBirds"] = maxSpeciesOnDayfiltered

    for species in statisticsALL["all"]:
            if species != "sum" and statisticsALL["maxSpecies"][0]["amount"] < statisticsALL["all"][species]["amount"]:
                objectToInsert = dict()
                objectToInsert = statisticsALL["all"][species]
                statisticsALL["maxSpecies"] = insertMax(statisticsALL["maxSpecies"], objectToInsert, "amount")
    statisticsALL["maxSpecies"] = list(filter(lambda i: i['amount'] != 0, statisticsALL["maxSpecies"]))

    for species in statisticsALL["validatedBirds"]:
            if statisticsALL["maxValidatedBirds"][0]["sum"] < statisticsALL["validatedBirds"][species]["sum"]:
                objectToInsert = dict()
                objectToInsert = statisticsALL["validatedBirds"][species]
                objectToInsert["latinName"] = species
                germanName = ""
                try:
                    germanName = birdJSON[species]
                    
                except:
                    germanName = ""
                objectToInsert["germanName"] = germanName
                statisticsALL["maxValidatedBirds"] = insertMax(statisticsALL["maxValidatedBirds"], objectToInsert, "sum")
    
    statisticsALL["maxValidatedBirds"] = list(filter(lambda i: i['sum'] != 0, statisticsALL["maxValidatedBirds"]))

    specialBirds = []
    for key in statisticsALL['specialBirds']:
            specialBirds.append(statisticsALL['specialBirds'][key])
            
    
    statisticsALL['specialBirds'] = specialBirds
    #Remove perDay and validated Birds statisitc to keep object small and they are not necessary for the current view
    statisticsALL['perDay'] = len(statisticsALL["perDay"])
    statisticsALL['validatedBirds'] = len(statisticsALL["validatedBirds"])


    if statisticsALL["sumEnvironment"] > 0:
        statisticsALL["averageTemp"] = statisticsALL["sumTemperature"] / statisticsALL["sumEnvironment"]
        statisticsALL["averageHum"] = statisticsALL["sumHumidity"] / statisticsALL["sumEnvironment"]
    
    statisticsALL["createdAt"] = str(datetime.now())
    db["statistics"].replace_one({"station_id": "all"}, statisticsALL, True)
    if reque:
        print(reque)
        q3.enqueue_in(timedelta(minutes=30), calculateStatistics, True)

        
@enqueueable
#The function first checks if the file extension is ".h264" and converts the file to ".mp4" format using MP4Box if so. 
# It then reads the video using OpenCV, extracts frames from the video, and calls a classify function to classify the image and detect any birds present in it. 
# It then processes the detected birds to create a list of dictionaries, where each dictionary contains the details of each bird. It then updates the database with the movement and counts the number of each bird seen for a given day. 
# It also sends an email to the provided email addresses with the details of the detected birds.  
def videoAnalysis(filename, movement_id, station_id, movement):
    if  os.path.splitext(filename)[1] != ".mp4":
        command = "MP4Box -add {} {}.mp4".format("./uploads/disk/videos/" + filename, "./uploads/disk/videos/" + os.path.splitext(filename)[0])
        command2 = "rm ./uploads/disk/videos/" + filename
        try:
            output = subprocess.check_output(command, stderr=subprocess.STDOUT, shell=True)
            output2 = subprocess.check_output(command2, stderr=subprocess.STDOUT, shell=True)
            filename = os.path.splitext(filename)[0] +".mp4"
        except subprocess.CalledProcessError as e:
            print('FAIL:\ncmd:{}\noutput:{}'.format(e.cmd, e.output))

    cap = cv2.VideoCapture('uploads/disk/videos/' + filename)
    total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
    station = stations.find_one({"station_id":station_id})
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
                threshold = 0.3
                try:
                    threshold = station["advancedSettings"]["detectionThreshold"]
                except: 
                    threshold = 0.3
                if result[i][key] > threshold:
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
    #print(birds)

    newMovement= dict()

    newMovement["detections"] = birds
    newMovement["video"] = str(host)+ "/api/uploads/videos/" + filename


    station = stations.find_one({"station_id":station_id})
    count = {}
    if "count" in station: 
        count = station["count"]


    if len(birds) > 0:
        today = movement["start_date"].split()[0]
        #print(today)
        latinName=birds[0]['latinName']
        germanName=birds[0]["germanName"]
            
        if today in count:
            existName = False
            count[today]["sum"] = count[today]["sum"] + 1
            for i, det in enumerate(count[today]["birds"]):
                if det["latinName"] == latinName:
                    existName = True
                    count[today]["birds"][i]["amount"] = count[today]["birds"][i]["amount"] + 1
            if existName == False:
                count[today]["birds"].append({"latinName": latinName, "germanName" : germanName, "amount": 1})
        else:
            count[today] = {"sum": 1, "birds": [{"latinName": latinName, "germanName" : germanName, "amount": 1}]}
        try:
            if station["mail"]["notifcation"]:
                    print(send_email)
                    send_email(station["mail"]["adresses"][0], filename, str(host)+ "/api/uploads/videos/" + filename, birds, pwd, str(host) +"/view/station/" +station_id )
        except:
                print("mail to failed") 

    db["movements_"+station_id].update_one({"mov_id": movement_id}, {'$set': newMovement})
    completeMovement = db["movements_"+station_id].find_one({"mov_id": movement_id}, {'_id' : False})
    stations.update_one({"station_id":station_id}, {'$set': {"count":count, "lastMovement" : completeMovement}})

    return birds

def create_video(files, output_video_path):
    
    result_array = []
    with open("uploads/disk/images/input.txt", "w") as file:
        for index, filename in enumerate(files, start=1):
            file.write(f"file '{filename}'\n")
    #image_array = cv2.imread('uploads/disk/images/' + files[0])
    #height, width, layers = image_array.shape

    #fourcc = cv2.VideoWriter_fourcc(*"H264")  # Use MP4V codec for mp4 format
    #video = cv2.VideoWriter(output_video_path, fourcc, 1, (width, height))

    #for file in files:
    #    print(file, flush=True)
    #    image = cv2.imread('uploads/disk/images/' + file)
    #    for _ in range(5):  # 3 seconds at 30 frames per second
    #        video.write(image)
    #cv2.destroyAllWindows()
    #video.release()
    # FFmpeg command to create video from image filenames
    ffmpeg_command = [
        "ffmpeg",
        "-f", "concat",
        "-i", "uploads/disk/images/input.txt",
        "-r", "0.33",
        "-c:v", "libx264",
        "-pix_fmt", "yuv420p",
        output_video_path
    ]

    # Run FFmpeg command
    subprocess.run(ffmpeg_command)



@enqueueable
#The function first checks if the file extension is ".h264" and converts the file to ".mp4" format using MP4Box if so. 
# It then reads the video using OpenCV, extracts frames from the video, and calls a classify function to classify the image and detect any birds present in it. 
# It then processes the detected birds to create a list of dictionaries, where each dictionary contains the details of each bird. It then updates the database with the movement and counts the number of each bird seen for a given day. 
# It also sends an email to the provided email addresses with the details of the detected birds.  
def videoAnalysisImage(filenames, movement_id, station_id, movement):
    station = stations.find_one({"station_id":station_id})
    #print(total_frames)
    result=[]
    for files in filenames:
        image_array = cv2.imread('uploads/disk/images/' + files)
        result.append(classify(image_array))
        # read next frame
    output = {}
    for i in range(len(result)): 
        for key in result[i]:
            if key in output:
                if result[i][key] > output[key]:
                    output[key]=result[i][key]
            elif key!= "None":
                threshold = 0.3
                try:
                    threshold = station["advancedSettings"]["detectionThreshold"]
                except: 
                    threshold = 0.3
                if result[i][key] > threshold:
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
    #print(birds)

    newMovement= dict()

    newMovement["detections"] = birds


    videofile= "uploads/disk/videos/" + station_id + movement_id + ".mp4"
    create_video(filenames, videofile)

    newMovement["video"] = str(host)+ "/api/"+ "uploads/videos/" + station_id + movement_id + ".mp4"


    station = stations.find_one({"station_id":station_id})
    count = {}
    if "count" in station: 
        count = station["count"]


    if len(birds) > 0:
        today = movement["start_date"].split()[0]
        #print(today)
        latinName=birds[0]['latinName']
        germanName=birds[0]["germanName"]
            
        if today in count:
            existName = False
            count[today]["sum"] = count[today]["sum"] + 1
            for i, det in enumerate(count[today]["birds"]):
                if det["latinName"] == latinName:
                    existName = True
                    count[today]["birds"][i]["amount"] = count[today]["birds"][i]["amount"] + 1
            if existName == False:
                count[today]["birds"].append({"latinName": latinName, "germanName" : germanName, "amount": 1})
        else:
            count[today] = {"sum": 1, "birds": [{"latinName": latinName, "germanName" : germanName, "amount": 1}]}
        try:
            if station["mail"]["notifcation"]:
                    print(send_email)
                    send_email(station["mail"]["adresses"][0], videofile, str(host)+ "/api/uploads/videos/" + videofile, birds, pwd, str(host) +"/view/station/" +station_id )
        except:
                print("mail to failed") 

    db["movements_"+station_id].update_one({"mov_id": movement_id}, {'$set': newMovement})
    completeMovement = db["movements_"+station_id].find_one({"mov_id": movement_id}, {'_id' : False})
    stations.update_one({"station_id":station_id}, {'$set': {"count":count, "lastMovement" : completeMovement}})

    return birds


@enqueueable
def saveEnvironment(body, env_id, station_id):
    #The purpose of the function is to save environment data for a particular station. The function takes in three arguments: body, env_id, and station_id.
    #The body argument is a dictionary containing environment data that needs to be saved. The env_id argument is a unique identifier for the environment data. The station_id argument is the unique identifier for the station where the environment data is being saved.
    
    environmentClass = dict()
    for name,value in body.items():
        environmentClass[name]= value
    
    environmentClass["env_id"] = env_id
    environmentList = db["environments_" + station_id].find()
    
    month = environmentClass["date"]
    month = month[0:7]


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
    db["stations"].update_one({"station_id":station_id}, {'$set': {"lastEnvironment":environmentClass}})
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
def saveFeed(body, feed_id, station_id):
    #The purpose of the function is to save environment data for a particular station. The function takes in three arguments: body, env_id, and station_id.
    #The body argument is a dictionary containing environment data that needs to be saved. The env_id argument is a unique identifier for the environment data. The station_id argument is the unique identifier for the station where the environment data is being saved.
    
    feedClass = dict()
    for name,value in body.items():
        feedClass[name]= value
    
    feedClass["feed_id"] = feed_id

    feedList = db["feed_" + station_id].find()

    month = feedClass["date"]
    month = month[0:7]


    listID =""
    for listElement in feedList:
        if listElement["month"] == month:
            listID = listElement["list_id"]
            selectedList = listElement
            break

    if listID == "":
        feedMonth = dict()
        feedMonth["station_id"] = station_id
        feedMonth["month"] = month
        feedMonth["list_id"] = str(uuid.uuid4())
        feedMonth["measurements"] = []
        feedMonth["measurements"].insert(0,feedClass)
        #print(environmentMonth, flush=True)
        db["feed_" + station_id].insert_one(feedMonth)
    else: 
        measurements = selectedList["measurements"]
        measurements = insert(measurements ,feedClass)
        #print(measurements, flush=True)
        db["feed_"+ station_id].update_one({"list_id":listID}, {'$set': {"measurements":measurements}})
    db["stations"].update_one({"station_id":station_id}, {'$set': {"lastFeedStatus":feedClass}})
    # Send Temperature and Humidity to openSenseMap if sensebox id is defined for the station
    # print(station.sensebox_id, flush=True)
    return(feed_id)


@enqueueable
def saveValidation(validation, movement_id, station_id):
    movement = db["movements_"+station_id].find({"mov_id": movement_id}, {'_id' : False})
    movementList = list(movement)
    movement = movementList[0]
    newValidation=dict()
    if "timestamp" not in validation:
        validation["timestamp"] = str(datetime.now())
    if "validation" in  movement:
        validations = movement["validation"]["validations"]
        latinName = validation["latinName"]
        validations.append(validation)
        summary = movement["validation"]["summary"]
        found=False
        for key in summary:
            if key == latinName:
                summary[latinName]["amount"] = summary[latinName]["amount"] + 1
                found = True
                break
        if found == False:
            summary[latinName] = {"latinName": latinName, "amount": 1}
        newValidation["validations"] = validations
        newValidation["summary"] = summary
        db["movements_"+station_id].update_one({"mov_id": movement_id}, {'$set': {"validation" : newValidation} })
    else:
        latinName = validation["latinName"]
        newValidation["validations"] = [validation]
        newValidation["summary"] = {latinName: {"latinName": latinName, "amount": 1}}
        statistics = db["statistics"].find({"station_id": station_id})
        statistics = list(statistics)[0]
        newStats= dict()
        newStats["numberOfValidatedBirds"] = statistics["numberOfValidatedBirds"] + 1
        if latinName in statistics["validatedBirds"]:
                statistics["validatedBirds"][latinName]["sum"] = statistics["validatedBirds"][latinName]["sum"] +1
                if len(statistics["validatedBirds"][latinName]["movements"]) < 20:
                    statistics["validatedBirds"][latinName]["movements"].append({"mov_id": movement["mov_id"], "station_id" : station_id, "video": movement["video"], "start_date":movement["start_date"]})
        else:
            statistics["validatedBirds"][latinName]=  {"sum": 1}
            statistics["validatedBirds"][latinName]["movements"] = [{"mov_id": movement["mov_id"], "station_id" : station_id, "video": movement["video"], "start_date":movement["start_date"]}]
        newStats["validatedBirds"] = statistics["validatedBirds"]
        newStats["maxValidatedBirds"] = [{"sum": 0}, {"sum": 0}, {"sum": 0}, {"sum": 0} , {"sum": 0}]
        for species in newStats["validatedBirds"]:
            if newStats["maxValidatedBirds"][0]["sum"] < newStats["validatedBirds"][species]["sum"]:
                objectToInsert = dict()
                objectToInsert = newStats["validatedBirds"][species]
                objectToInsert["latinName"] = species
                germanName = ""
                try:
                    germanName = birdJSON[species]
                except:
                    germanName = ""
                objectToInsert["germanName"] = germanName
                newStats["maxValidatedBirds"] = insertMax(newStats["maxValidatedBirds"], objectToInsert, "sum")
        newStats["maxValidatedBirds"] = list(filter(lambda i: i['sum'] != 0, newStats["maxValidatedBirds"]))

        db["movements_"+station_id].update_one({"mov_id": movement_id}, {'$set': {"validation" : newValidation} })
        db["statistics"].update_one({"station_id": station_id}, {'$set': newStats })

    return newValidation




@app.route('/api/image', methods=['POST'])
def image():
    if request.method=="POST":
        data = request.files['image']
        #print (data)
        filename = imagesSet.save(data)
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
        id = str(uuid.uuid4())

        type = body['type'] # One of observer, test or exhibit
        if type not in ["observer", "test", "exhibit"]:
            return "type must be one of observer, test or exhibit", 400
        advancedSettings = dict()
        if type in ["exhibit", "test"] and "advancedSettings" not in body:
                return "exhibit or test station must have advancedSettings property", 400
        if "advancedSettings" in body:
            advancedSettings = body['advancedSettings']
            if type == "exhibit" and "numberVisualExamples" not in advancedSettings:
                return "exhibit station must have property numberVisualExamples in advancedSettings property", 400

        location = dict()
        location['lat'] = body['location']['lat']
        location['lng']= body['location']['lng']
        mail= dict()
        mail["adresses"] = body['mail']['adresses']
        mail["notifications"] = body["mail"]["notifications"]
        createSensebox = False # body['createSensebox']
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
        station = stations.insert_one({"station_id": id, "location":location, "name":body['name'], "mail":mail, "count": count, "sensebox_id":sensebox_id, "type": type, "advancedSettings": advancedSettings})
        movementsCollection = db["movements_"+ id]
        movementsCollection.create_index( [( "start_date", -1 )] )
        environmentCollection = db["environments_"+ id]
        environmentCollection.create_index( [( "month", -1 )] )

        return {"id": id}, 201
    station = list(stations.find({ "type": {  "$ne": "test" } }, {'_id' : False, "mail":False} ))
    return  jsonify(station), 200


@app.route('/api/station/<station_id>', methods=['GET', 'PUT', 'DELETE'])
def station(station_id: str):
    if request.method=="GET":
        numberOfMovements = request.args.get('movements')
        apikey= request.args.get("apikey")
        station = None
        if API_KEY == apikey:
            station = stations.find_one({"station_id":station_id}, {'_id' : False} )
        else: 
            station = stations.find_one({"station_id":station_id}, {'_id' : False, "mail":False} )
        #print(station, flush=True)
        if station is None:
            return "not found", 404
        movements=[]
        if numberOfMovements and int(numberOfMovements) > 0:
            movements = list(db["movements_" + station_id].find({}, {'_id' : False}).sort("start_date",-1).limit(int(numberOfMovements)))
        else:
            movements = list(db["movements_" + station_id].find({}, {'_id' : False}).sort("start_date",-1))
        if station["type"] == "exhibit":
            statistics = db["statistics"].find_one({"station_id": "all"}, {'_id' : False})
            start = 0
            if len(movements) == 0 and "lastMovement" in station:
               movements.append(station["lastMovement"])   
               start = 1     
            for i in range(start, station["advancedSettings"]["numberVisualExamples"]):
                bird = random.choice(statistics["specialBirds"])
                movement = random.choice(bird["movements"])
                movements.append(movement)       
                    
        station["measurements"] = dict()
        station["measurements"]["movements"] = movements
        envWanted = request.args.get('environment')
        if envWanted:
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
            movements = db["movements_" + station_id].find({})
            movements = list(movements)
            for movement in movements:
                q.enqueue(removeMovementFiles, movement)
            movementsCollection = db["movements_"+station_id]
            movementsCollection.drop
            environmentCollection = db["environments_"+station_id]
            environmentCollection.drop
        return jsonify(str(station_id)), 200

@app.route('/api/updateStations')
def updateStations():
    stationList = list(stations.find({}, {'_id' : False, "mail":False} ))
    print(len(stationList), flush=True)
    for station in stationList:
        newCount = dict()
        update =False
        for date in station["count"]:
            #print(date, flush=True)
            if("birds" not in station["count"][date]):
                update= True
                newCount[date] = dict()
                #print(date, flush=True) 
                newCount[date]["birds"] = station["count"][date]
                newCount[date]["sum"] = 0
                for detections in station["count"][date]:
                        newCount[date]["sum"] =  detections["amount"] + newCount[date]["sum"]  
        if update:
            db["stations"].update_one({"station_id":station["station_id"]}, {'$set': {"count":newCount}})
    return "ok", 200

@app.route('/api/environment/<station_id>', methods=['POST'])
def add_environment(station_id: str):
    content_type = request.headers.get('Content-Type')

    body = request.get_json()
    if 'date' not in body:
        return "environment has no date", 400
    
    env_id = str(uuid.uuid4())
    job = q.enqueue(saveEnvironment, body,env_id,station_id)

    return jsonify(id = env_id), 200

@app.route('/api/environment/<station_id>', methods=['GET'])
def get_environment(station_id: str):
    months = request.args.get('months', default="all")
    environment= db["environments_"+station_id].find({}, {'_id' : False}).sort("month",-1)
    environment = list(environment)
        #print(environment, flush=True)
    environments = []
    try:
        months = int(months)
    except:
        months = "all"
    if months=="all":
        for months in environment:
                environments= environments + months["measurements"]
    else:
        months = min(months,len(environment))
        for month in range(0,months):
            environments = environments + environment[month]["measurements"]

    return jsonify(environments), 200

@app.route('/api/movement/<station_id>', methods=['POST'])
def add_movement(station_id: str):
    content_type = request.headers.get('Content-Type')
    print(content_type, flush=True)
    ##TODO: Count Birds in image and Crop images to bird onyl 

    body = request.form['json']
    body = json.loads(body)

    if 'start_date' not in body:
        return "movement has no start_date", 400
    
    movementsClass = dict()
    mov_id = str(uuid.uuid4())
    movementsClass["station_id"] =station_id
    movementsClass["mov_id"] = mov_id
    movementsClass["start_date"] = body['start_date']
    movementsClass["end_date"] = body['end_date']
    movementsClass["weight"] = body['weight']
    movementsClass["detections"] = []
    name = "audio_" +str(datetime.now()).replace(" ", "") + "."
    audio = request.files[body['audio']]
    filename = audios.save(audio, name = name)
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
    movementsClass["createdAt"] = datetime.utcnow()
    
    
    db["movements_"+station_id].insert_one(movementsClass)
    job= q.enqueue(videoAnalysis, filename, mov_id, station_id, movementsClass)
    station = stations.find_one({"station_id":station_id}, {'_id' : False} )
    if station["type"] in ["test", "exhibit"]:
        try: 
            deleteMinutes = station["advancedSettings"]["deleteMinutes"]
            job = q.enqueue_in(timedelta(minutes=deleteMinutes), deleteMovement, mov_id, station_id)
        except:
            print("No deleteMinutes given")


    #print(movementList)

    return jsonify(id = mov_id), 200



@app.route('/api/movement/image/<station_id>', methods=['POST'])
def add_movement_image(station_id: str):
    content_type = request.headers.get('Content-Type')
    print(content_type, flush=True)
    ##TODO: Count Birds in image and Crop images to bird onyl 

    body = request.form['json']
    body = json.loads(body)

    if 'start_date' not in body:
        return "movement has no start_date", 400
    
    movementsClass = dict()
    mov_id = str(uuid.uuid4())
    movementsClass["station_id"] =station_id
    movementsClass["mov_id"] = mov_id
    movementsClass["start_date"] = body['start_date']
    movementsClass["end_date"] = body['end_date']
    movementsClass["weight"] = body['weight']
    movementsClass["detections"] = []
    name = "audio_" +str(datetime.now()).replace(" ", "") + "."
    audio = request.files[body['audio']]
    filename = audios.save(audio, name = name)
    movementsClass["audio"] = str(host)+ "/api/uploads/audios/" + filename
    filenames = []
    for img in body['images']:
        image = request.files[img]
        filename = imagesSet.save(image)
        filenames.append(filename)
    movementsClass["video"] = "pending"
    

    environmentClass = dict()
    for name,value in body['environment'].items():
        environmentClass[name]= value
    env_id = str(uuid.uuid4())
    environmentClass["env_id"] = env_id

    movementsClass["environment"] = environmentClass
    movementsClass["createdAt"] = datetime.utcnow()
    
    
    db["movements_"+station_id].insert_one(movementsClass)
    job= q.enqueue(videoAnalysisImage, filenames, mov_id, station_id, movementsClass)
    station = stations.find_one({"station_id":station_id}, {'_id' : False} )
    if station["type"] in ["test", "exhibit"]:
        try: 
            deleteMinutes = station["advancedSettings"]["deleteMinutes"]
            job = q.enqueue_in(timedelta(minutes=deleteMinutes), deleteMovement, mov_id, station_id)
        except:
            print("No deleteMinutes given")


    #print(movementList)

    return jsonify(id = mov_id), 200
@app.route('/api/movement/<station_id>/<movement_id>', methods=['GET', 'DELETE'])
def handle_movement(station_id: str, movement_id: str):
    if request.method=="DELETE":
        apikey= request.args.get("apikey")
        deleteData = request.args.get("deleteData")
        if API_KEY != apikey:
            return "Not authorized", 401
        if deleteData:
            movements = db["movements_" + station_id].find({"mov_id": movement_id})
            movements = list(movements)
            for movement in movements:
                q.enqueue(removeMovementFiles, movement)
        db["movements_" + station_id].delete_many({"mov_id": movement_id})
        return jsonify(str(station_id)), 200   
        
    movement = db["movements_" + station_id].find({"mov_id": movement_id}, {'_id' : False})
    movement = list(movement)[0]
    return jsonify(movement)

@app.route('/api/movement/<station_id>', methods=['GET'])
def search_Movements(station_id: str):
    species = request.args.get('species')
    date = request.args.get('date')
    
    numberOfMovements = request.args.get('movements')
    query = {}
    print(species, flush=True)
    if date and species:
        date = date.split()[0]
        date_object = datetime.strptime(date, '%Y-%m-%d').date()
        date2_object = date_object + timedelta(days=1)
        date2 = date2_object.strftime("%Y-%m-%d")
        species = species.replace("_", " ")
        query = {"$and": [{"detections": { "$elemMatch" : {"latinName": { "$in": [species] } } }},{"start_date": {
        "$gte": date,
        "$lt": date2
    } }]}
    elif species:
        species = species.replace("_", " ")
        print(species, flush=True)
        query = {"detections": { "$elemMatch" : {"latinName": { "$in": [species] } } } }
    elif date:
        date = date.split()[0]
        date_object = datetime.strptime(date, '%Y-%m-%d').date()
        date2_object = date_object + timedelta(days=1)
        date2 = date2_object.strftime("%Y-%m-%d")
        query = {"start_date": {
        "$gte": date,
        "$lt": date2
    } }
    if numberOfMovements and int(numberOfMovements) > 0:
            movements = list(db["movements_" + station_id].find(query, {'_id' : False}).sort("start_date",-1).limit(int(numberOfMovements)))
    else:
            movements = list(db["movements_" + station_id].find(query, {'_id' : False}).sort("start_date",-1))
    return jsonify(movements), 200

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

    station=  stations.find({"type": {  "$ne": "test" }},{"count":1})
    counts= list(station)
    count = {}
    for countObjects in counts:
        try:
            countObjects = dict(countObjects["count"])
            for date  in countObjects:
                for detections in countObjects[date]["birds"]: 
                    latinName = detections["latinName"]
                    germanName = detections["germanName"]
                    if date in count:
                        existName = False
                        for i, det in enumerate(count[date]["birds"]):
                            if det["latinName"] == latinName:
                                existName = True
                                count[date]["birds"][i]["amount"] = count[date]["birds"][i]["amount"] + detections["amount"]
                        if existName == False:
                            count[date]["birds"].append({"latinName": latinName, "germanName" : germanName, "amount": detections["amount"]})
                    else:
                        count[date]= {"birds": [{"latinName": latinName, "germanName" : germanName, "amount": detections["amount"]}]}
        except:
           print("No count available")
    return count

@app.route('/api/movement', methods=['GET'])
def getMovement():
    collections = db.list_collection_names()
    movementCollections= []
    for col in collections:
        if col.find('movements') != -1:
            if db[col].count_documents({}) > 30:
                movementCollections.append(col)
    randomCollection = random.choice(movementCollections)
    print(randomCollection, flush=True)
    movement = db[randomCollection].aggregate([{ "$sample": { "size": 1 } } ])
    movemntList = list(movement)
    print(movemntList, flush=True)
    movement = movemntList[0]
    movement.pop("_id")

    return jsonify(movement)

@app.route('/api/validate/<station_id>/<movement_id>', methods=['PUT'])
def addValidation(station_id: str, movement_id: str):
    body = request.get_json()
    validation= body["validation"]
    movement = db["movements_"+station_id].find({"mov_id": movement_id}, {'_id' : False})
    movementList = list(movement)
    if len(movementList) == 0:
        return "Not Found", 404
    job=q.enqueue(saveValidation, validation, movement_id, station_id)
    return "ok", 200

@app.route('/api/statistics/<station_id>', methods=['GET'])
def getStatistics(station_id: str):
    statistics = db["statistics"].find({"station_id": station_id}, {'_id' : False})
    statistics = list(statistics)[0]
    return jsonify(statistics)


@app.route('/api/statistics', methods=['GET'])
def runStatistics():
    reque = request.args.get('reque')
    job = q3.enqueue(calculateStatistics, reque)
    return "ok", 200


@app.route('/api/image/<id>', methods=['GET', 'POST'])
def get_image(id):
    if request.method=="POST":
        body = request.get_json()
        wlanCredentials = body['wlanCredentials']
        rotation = body['rotation']
        time = body["time"]
        job = q2.enqueue(modify_image, id, wlanCredentials, rotation, time, 0)
        return 201
    else:
        path = './uploads/raspberry-pi-os' +id  +'.img'
        if not os.path.exists(path):
            print("Path of the file is Invalid")
            return "Image not found", 404
        return send_file(path, as_attachment=True, download_name='birdiary-pi.img')##

@app.route('/api/image', methods=['GET'])
def get_dafault_image():
    path = './uploads/pi.img'
    if not os.path.exists(path):
        print("Path of the file is Invalid")
        return "Image not found", 404
    return send_file(path, as_attachment=True, download_name='birdiary-pi.img')

@app.route('/api/imageStatus/<id>', methods=['GET'])
def get_imageStatus(id):
    path = './uploads/raspberry-pi-os' +id  +'.img'
    if not os.path.exists(path) or os.path.getsize(path) < 5905580032:
        print("Path of the file is Invalid")
        return "Image not found", 404
    return "Image ready", 200


@app.route('/api/feed/<station_id>', methods=['POST'])
def add_feed(station_id: str):
    content_type = request.headers.get('Content-Type')

    body = request.get_json()
    if 'date' not in body:
        return "environment has no date", 400

    feed_id = str(uuid.uuid4())
    job = q.enqueue(saveFeed, body,feed_id,station_id)

    return jsonify(id = feed_id), 200

@app.route('/api/feed/<station_id>', methods=['GET'])
def get_feed(station_id: str):
    feed= db["feed_"+station_id].find({}, {'_id' : False}).sort("month",-1)
    feed = list(feed)
    print(feed, flush=True)
    feeds = []
    for months in feed:
            feeds= feeds + months["measurements"]
    return jsonify(feeds), 200

if __name__==('__main__'):
    app.run(host="0.0.0.0", debug=False)